require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const client = require('prom-client');

const logger = require('./config/logger');
const { authenticate, optionalAuth } = require('./middleware/auth');
const swaggerSetup = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Prometheus Metrics ───────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Logging ──────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// ─── Metrics Middleware ───────────────────────────────────────
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = { method: req.method, route: req.path, status_code: res.statusCode };
    end(labels);
    httpRequestTotal.inc(labels);
  });
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts.' },
});

app.use(globalLimiter);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Metrics Endpoint ─────────────────────────────────────────
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── Swagger Docs ─────────────────────────────────────────────
swaggerSetup(app);

// ─── Service URLs ─────────────────────────────────────────────
const SERVICES = {
  users: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  products: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  orders: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
};

const proxyOptions = (target, pathRewrite) => ({
  target,
  changeOrigin: true,
  pathRewrite,
  on: {
    error: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(502).json({ success: false, message: 'Service temporarily unavailable' });
    },
    proxyReq: (proxyReq, req) => {
      // Forward user headers set by auth middleware to downstream services
      if (req.headers['x-user-id']) proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      if (req.headers['x-user-role']) proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
      if (req.headers['x-user-email']) proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
    },
  },
});

// ─── Route Proxies ────────────────────────────────────────────

// Auth routes (rate-limited)
app.use('/api/users/login', authLimiter, createProxyMiddleware(proxyOptions(SERVICES.users)));
app.use('/api/users/register', authLimiter, createProxyMiddleware(proxyOptions(SERVICES.users)));

// User routes
app.use('/api/users', createProxyMiddleware(proxyOptions(SERVICES.users)));

// Product routes (GET public, mutations protected)
app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') return next();
  authenticate(req, res, next);
}, createProxyMiddleware(proxyOptions(SERVICES.products)));

// Order routes (protected)
app.use('/api/orders', authenticate, createProxyMiddleware(proxyOptions(SERVICES.orders)));

// Payment routes (protected)
app.use('/api/payments', authenticate, createProxyMiddleware(proxyOptions(SERVICES.payments)));

// Notification routes (admin only)
app.use('/api/notifications', authenticate, createProxyMiddleware(proxyOptions(SERVICES.notifications)));

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
  logger.info(`📊 Metrics at http://localhost:${PORT}/metrics`);
});

module.exports = app;