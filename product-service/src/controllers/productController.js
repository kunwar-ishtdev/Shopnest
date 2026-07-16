const { Op } = require('sequelize');
const { Product, Review } = require('../models/Product');
const logger = require('../utils/logger');

// ─── Get All Products ─────────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const {
      search = '', category = '', minPrice, maxPrice,
      sortBy = 'createdAt', order = 'DESC',
      page = 1, limit = 12,
    } = req.query;

    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const offset = (Number(page) - 1) * Number(limit);
    const validSortFields = ['price', 'rating', 'createdAt', 'name', 'reviewCount'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [[orderField, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      limit: Math.min(Number(limit), 100),
      offset,
    });

    res.json({
      success: true,
      products: rows,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    logger.error(`Get products error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// ─── Get Single Product ───────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Review, as: 'reviews', limit: 10, order: [['createdAt', 'DESC']] }],
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (err) {
    logger.error(`Get product error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// ─── Get Categories ───────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: ['category'],
      where: { isActive: true },
      group: ['category'],
      raw: true,
    });
    res.json({ success: true, categories: categories.map((c) => c.category) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// ─── Create Product (Admin) ───────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const product = await Product.create(req.body);
    logger.info(`Product created: ${product.id}`);
    res.status(201).json({ success: true, product });
  } catch (err) {
    logger.error(`Create product error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Update Product (Admin) ───────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update(req.body);
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Delete Product (Admin) ───────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update({ isActive: false });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// ─── Update Stock (Internal) ──────────────────────────────────
exports.updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    await product.decrement('stock', { by: quantity });
    res.json({ success: true, message: 'Stock updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Stock update failed' });
  }
};

// ─── Add Review ───────────────────────────────────────────────
exports.addReview = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const existing = await Review.findOne({ where: { productId: req.params.id, userId } });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

    const review = await Review.create({
      productId: req.params.id,
      userId,
      userName: req.headers['x-user-name'] || 'Anonymous',
      ...req.body,
    });

    // Recalculate product rating
    const reviews = await Review.findAll({ where: { productId: req.params.id }, attributes: ['rating'] });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await product.update({ rating: avgRating.toFixed(2), reviewCount: reviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) {
    logger.error(`Add review error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};