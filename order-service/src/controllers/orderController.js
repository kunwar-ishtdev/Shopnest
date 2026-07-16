const Order = require('../models/Order');
const { publishEvent } = require('../utils/rabbitmq');
const logger = require('../utils/logger');

// ─── Create Order ─────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { items, shippingAddress, paymentMethod, subtotal, deliveryFee, tax, total } = req.body;

    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      trackingHistory: [{ status: 'pending', message: 'Order placed successfully' }],
    });

    // Publish event to notify other services
    await publishEvent('order.created', {
      orderId: order._id,
      userId,
      total: order.total,
      items: order.items,
      shippingAddress: order.shippingAddress,
    });

    logger.info(`Order created: ${order._id} for user: ${userId}`);

    res.status(201).json({ success: true, order });
  } catch (err) {
    logger.error(`Create order error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// ─── Get My Orders ────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ─── Get Order by ID ──────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only owner or admin can view
    if (order.userId.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ─── Update Order Status ──────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.trackingHistory.push({ status, message: `Order status updated to ${status}` });
    await order.save();

    // Publish status change event
    await publishEvent('order.status_updated', {
      orderId: order._id,
      userId: order.userId,
      status,
      userEmail: req.headers['x-user-email'],
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// ─── Cancel Order ─────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.trackingHistory.push({ status: 'cancelled', message: 'Order cancelled by customer' });
    await order.save();

    await publishEvent('order.cancelled', { orderId: order._id, userId, items: order.items });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};