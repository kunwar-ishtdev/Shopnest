require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');

const sequelize = require('./config/database');
const Payment = require('./models/Payment');
const paymentRoutes = require('./routes/paymentRoutes');
const { connect: connectRabbitMQ } = require('./utils/rabbitmq');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3004;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.use(helmet());
app.use(cors());
// Note: Stripe webhook needs raw body, so we apply JSON parsing after webhook route
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') return next();
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(morgan('dev'));

app.use('/api/payments', paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'payment-service', timestamp: new Date().toISOString() }));
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });
app.use((err, req, res, next) => res.status(500).json({ success: false, message: 'Internal server error' }));

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected');
    await sequelize.sync({ alter: true });
    logger.info('✅ Database synced');
    await connectRabbitMQ();
    app.listen(PORT, () => logger.info(`🚀 Payment Service on port ${PORT}`));
  } catch (err) {
    logger.error(`Startup error: ${err.message}`);
    process.exit(1);
  }
};

startServer();
module.exports = app;