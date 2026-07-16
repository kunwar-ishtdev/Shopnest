require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const amqp = require('amqplib');
const client = require('prom-client');

const { sendEmail } = require('./handlers/emailHandler');
const templates = require('./templates/emailTemplates');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3005;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'notification-service', timestamp: new Date().toISOString() }));
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });

// ─── Event Handlers ───────────────────────────────────────────

const eventHandlers = {
  'user.registered': async (data) => {
    if (!data.email) return;
    const tmpl = templates.welcome({ firstName: data.firstName, email: data.email });
    await sendEmail({ to: data.email, ...tmpl });
  },

  'order.created': async (data) => {
    if (!data.userEmail) return;
    const tmpl = templates.orderConfirmation({
      firstName: data.firstName || 'Customer',
      orderId: data.orderId,
      items: data.items || [],
      total: data.total,
    });
    await sendEmail({ to: data.userEmail, ...tmpl });
  },

  'order.status_updated': async (data) => {
    if (!data.userEmail) return;

    let tmpl;
    if (data.status === 'shipped') {
      tmpl = templates.orderShipped({ firstName: 'Customer', orderId: data.orderId, trackingNumber: data.trackingNumber });
    } else if (data.status === 'delivered') {
      tmpl = templates.orderDelivered({ firstName: 'Customer', orderId: data.orderId });
    } else {
      return; // No email for other statuses
    }

    await sendEmail({ to: data.userEmail, ...tmpl });
  },

  'payment.completed': async (data) => {
    logger.info(`Payment completed for order: ${data.orderId}`);
    // Could send payment receipt email here
  },

  'payment.refunded': async (data) => {
    logger.info(`Refund processed for order: ${data.orderId}, amount: ${data.amount}`);
  },
};

// ─── RabbitMQ Consumer ────────────────────────────────────────

async function startConsumer(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertExchange('shopnest.events', 'topic', { durable: true });

      const q = await channel.assertQueue('notification-service', { durable: true });

      // Bind to all events
      const routingKeys = [
        'user.registered',
        'order.created',
        'order.status_updated',
        'order.cancelled',
        'payment.completed',
        'payment.refunded',
      ];

      for (const key of routingKeys) {
        await channel.bindQueue(q.queue, 'shopnest.events', key);
      }

      channel.prefetch(1); // Process one message at a time

      channel.consume(q.queue, async (msg) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          const { routingKey, data } = content;

          logger.info(`📩 Received event: ${routingKey}`);

          const handler = eventHandlers[routingKey];
          if (handler) {
            await handler(data);
          } else {
            logger.warn(`No handler for event: ${routingKey}`);
          }

          channel.ack(msg);
        } catch (err) {
          logger.error(`Event processing error: ${err.message}`);
          channel.nack(msg, false, false); // Dead-letter
        }
      });

      logger.info('✅ RabbitMQ consumer started');

      connection.on('error', () => {
        logger.error('RabbitMQ connection error. Reconnecting...');
        setTimeout(() => startConsumer(), 5000);
      });

      return;
    } catch (err) {
      logger.error(`RabbitMQ consumer failed (${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  logger.warn('Could not start RabbitMQ consumer. Running in HTTP-only mode.');
}

// ─── REST API for manual notifications ───────────────────────
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { to, type, data } = req.body;
    const handler = eventHandlers[type];
    if (!handler) return res.status(400).json({ success: false, message: 'Unknown notification type' });

    await handler({ ...data, userEmail: to });
    res.json({ success: true, message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, async () => {
  logger.info(`🚀 Notification Service on port ${PORT}`);
  await startConsumer();
});

module.exports = app;