const amqp = require('amqplib');
const logger = require('./logger');

let channel = null;
let connection = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function connect(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();

      // Declare exchanges
      await channel.assertExchange('shopnest.events', 'topic', { durable: true });

      connection.on('error', (err) => {
        logger.error(`RabbitMQ connection error: ${err.message}`);
        setTimeout(() => connect(), 5000);
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed. Reconnecting...');
        setTimeout(() => connect(), 5000);
      });

      logger.info('✅ Connected to RabbitMQ');
      return;
    } catch (err) {
      logger.error(`RabbitMQ connection failed (attempt ${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  logger.warn('Could not connect to RabbitMQ. Messages will not be published.');
}

async function publishEvent(routingKey, data) {
  if (!channel) {
    logger.warn(`Cannot publish event ${routingKey}: no RabbitMQ connection`);
    return;
  }
  try {
    const message = JSON.stringify({ routingKey, data, timestamp: new Date().toISOString() });
    channel.publish('shopnest.events', routingKey, Buffer.from(message), { persistent: true });
    logger.info(`Published event: ${routingKey}`);
  } catch (err) {
    logger.error(`Failed to publish event ${routingKey}: ${err.message}`);
  }
}

async function subscribeToEvent(routingKey, handler) {
  if (!channel) {
    logger.warn('Cannot subscribe: no RabbitMQ connection');
    return;
  }
  try {
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, 'shopnest.events', routingKey);
    channel.consume(q.queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content.data);
          channel.ack(msg);
        } catch (err) {
          logger.error(`Error processing event: ${err.message}`);
          channel.nack(msg, false, false);
        }
      }
    });
    logger.info(`Subscribed to event: ${routingKey}`);
  } catch (err) {
    logger.error(`Failed to subscribe to ${routingKey}: ${err.message}`);
  }
}

module.exports = { connect, publishEvent, subscribeToEvent };
