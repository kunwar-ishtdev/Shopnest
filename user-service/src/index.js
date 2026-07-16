require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');

const userRoutes = require('./routes/userRoutes');
const { connect: connectRabbitMQ } = require('./utils/rabbitmq');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Metrics ──────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/users', userRoutes);

// ─── Health ───────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user-service',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── Error Handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── DB + Start ───────────────────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopnest_users');
    logger.info('✅ MongoDB connected');

    await connectRabbitMQ();

    // Seed admin user if not exists
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@shopnest.com' });
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'ShopNest',
        email: 'admin@shopnest.com',
        password: 'admin123',
        role: 'admin',
      });
      logger.info('✅ Admin user seeded');
    }

    const userExists = await User.findOne({ email: 'user@shopnest.com' });
    if (!userExists) {
      await User.create({
        firstName: 'Demo',
        lastName: 'User',
        email: 'user@shopnest.com',
        password: 'user123',
        role: 'user',
      });
      logger.info('✅ Demo user seeded');
    }

    app.listen(PORT, () => logger.info(`🚀 User Service running on port ${PORT}`));
  } catch (err) {
    logger.error(`Startup error: ${err.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
