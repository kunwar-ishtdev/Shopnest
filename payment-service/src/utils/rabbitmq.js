const amqp = require('amqplib');
const logger = require('./logger');
let channel = null;
let connection = null;
const URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function connect(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(URL);
      channel = await connection.createChannel();
      await channel.assertExchange('shopnest.events', 'topic', { durable: true });
      connection.on('error', () => setTimeout(() => connect(), 5000));
      connection.on('close', () => setTimeout(() => connect(), 5000));
      logger.info('✅ Connected to RabbitMQ');
      return;
    } catch (err) {
      logger.error(`RabbitMQ connect failed (${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function publishEvent(routingKey, data) {
  if (!channel) return;
  try {
    channel.publish('shopnest.events', routingKey, Buffer.from(JSON.stringify({ routingKey, data, timestamp: new Date().toISOString() })), { persistent: true });
  } catch (err) {
    logger.error(`Publish error: ${err.message}`);
  }
}

module.exports = { connect, publishEvent };
