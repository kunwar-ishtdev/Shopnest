require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');

const sequelize = require('./config/database');
const { Product } = require('./models/Product');
const productRoutes = require('./routes/productRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3002;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'product-service', timestamp: new Date().toISOString() }));
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const SEED_PRODUCTS = [
  { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with titanium design and A17 Pro chip.', price: 134900, originalPrice: 149900, category: 'electronics', stock: 50, images: ['https://picsum.photos/seed/iphone/400/400'], rating: 4.8, reviewCount: 124 },
  { name: 'Samsung Galaxy S24', description: 'Android flagship with AI-powered camera system.', price: 79999, originalPrice: 89999, category: 'electronics', stock: 35, images: ['https://picsum.photos/seed/samsung/400/400'], rating: 4.6, reviewCount: 89 },
  { name: 'Nike Air Max 270', description: 'Comfortable running shoes with max cushioning.', price: 12995, originalPrice: 15999, category: 'clothing', stock: 120, images: ['https://picsum.photos/seed/nike/400/400'], rating: 4.5, reviewCount: 245 },
  { name: 'MacBook Air M3', description: 'Ultra-thin laptop with Apple M3 chip and all-day battery.', price: 114900, originalPrice: 119900, category: 'electronics', stock: 20, images: ['https://picsum.photos/seed/macbook/400/400'], rating: 4.9, reviewCount: 67 },
  { name: 'Ceramic Coffee Mug Set', description: 'Set of 4 handcrafted ceramic coffee mugs, 350ml each.', price: 999, originalPrice: 1499, category: 'home', stock: 200, images: ['https://picsum.photos/seed/mug/400/400'], rating: 4.3, reviewCount: 312 },
  { name: 'Yoga Mat Premium', description: '6mm thick non-slip yoga mat with carrying strap.', price: 1299, originalPrice: 1999, category: 'sports', stock: 80, images: ['https://picsum.photos/seed/yoga/400/400'], rating: 4.4, reviewCount: 156 },
  { name: 'The Alchemist', description: 'Bestselling novel by Paulo Coelho about following your dreams.', price: 299, originalPrice: 399, category: 'books', stock: 500, images: ['https://picsum.photos/seed/book/400/400'], rating: 4.7, reviewCount: 891 },
  { name: 'Wireless Earbuds Pro', description: 'True wireless earbuds with active noise cancellation.', price: 4999, originalPrice: 7999, category: 'electronics', stock: 65, images: ['https://picsum.photos/seed/earbuds/400/400'], rating: 4.2, reviewCount: 423 },
  { name: 'Vitamin C Serum', description: 'Brightening face serum with 20% Vitamin C and hyaluronic acid.', price: 899, originalPrice: 1299, category: 'beauty', stock: 150, images: ['https://picsum.photos/seed/serum/400/400'], rating: 4.6, reviewCount: 567 },
  { name: 'Smart Watch Series 9', description: 'Feature-packed smartwatch with health monitoring and GPS.', price: 34999, originalPrice: 42999, category: 'electronics', stock: 40, images: ['https://picsum.photos/seed/watch/400/400'], rating: 4.5, reviewCount: 189 },
  { name: 'Denim Jacket Classic', description: 'Timeless blue denim jacket, unisex, multiple sizes.', price: 2499, originalPrice: 3499, category: 'clothing', stock: 95, images: ['https://picsum.photos/seed/jacket/400/400'], rating: 4.1, reviewCount: 78 },
  { name: 'Table Lamp LED', description: 'Modern LED table lamp with adjustable brightness and color temperature.', price: 1599, originalPrice: 2499, category: 'home', stock: 60, images: ['https://picsum.photos/seed/lamp/400/400'], rating: 4.3, reviewCount: 145 },
];

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected');

    await sequelize.sync({ alter: true });
    logger.info('✅ Database synced');

    // Seed products
    const count = await Product.count();
    if (count === 0) {
      await Product.bulkCreate(SEED_PRODUCTS);
      logger.info(`✅ Seeded ${SEED_PRODUCTS.length} products`);
    }

    app.listen(PORT, () => logger.info(`🚀 Product Service running on port ${PORT}`));
  } catch (err) {
    logger.error(`Startup error: ${err.message}`);
    process.exit(1);
  }
};

startServer();
module.exports = app;