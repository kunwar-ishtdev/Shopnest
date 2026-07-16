require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');

const orderRoutes = require('./routes/orderRoutes');
const { connect: connectRabbitMQ } = require('./utils/rabbitmq');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3003;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.use(helmet()); app.use(cors()); app.use(express.json({ limit: '10mb' })); app.use(morgan('dev'));
app.use('/api/orders', orderRoutes);
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'order-service', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });
app.use((err, req, res, next) => res.status(500).json({ success: false, message: 'Internal server error' }));

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopnest_orders');
    logger.info('✅ MongoDB connected');
    await connectRabbitMQ();
    app.listen(PORT, () => logger.info(`🚀 Order Service on port ${PORT}`));
  } catch (err) {
    logger.error(`Startup error: ${err.message}`);
    process.exit(1);
  }
};

startServer();
module.exports = app;
