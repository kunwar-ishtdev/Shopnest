const Payment = require('../models/Payment');
const { publishEvent } = require('../utils/rabbitmq');
const logger = require('../utils/logger');

// Initialize Stripe only if key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// ─── Create Payment Intent ────────────────────────────────────
exports.createPaymentIntent = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { orderId, amount, currency = 'inr', method = 'card' } = req.body;

    // Create payment record
    const payment = await Payment.create({
      orderId,
      userId,
      amount,
      currency: currency.toUpperCase(),
      method,
      status: 'pending',
    });

    let clientSecret = null;

    // If Stripe is configured and method is card, create payment intent
    if (stripe && method === 'card') {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          metadata: { orderId, userId, paymentId: payment.id },
        });
        await payment.update({
          stripePaymentIntentId: paymentIntent.id,
          status: 'processing',
          gatewayResponse: paymentIntent,
        });
        clientSecret = paymentIntent.client_secret;
      } catch (stripeErr) {
        logger.warn(`Stripe error: ${stripeErr.message}. Using mock payment.`);
      }
    }

    // For COD or non-Stripe, auto-complete
    if (method === 'cod') {
      await payment.update({ status: 'completed' });
      await publishEvent('payment.completed', { orderId, userId, amount, paymentId: payment.id, method });
    }

    logger.info(`Payment created: ${payment.id} for order: ${orderId}`);

    res.status(201).json({
      success: true,
      payment,
      clientSecret,
      message: method === 'cod' ? 'Cash on delivery order confirmed' : 'Payment initiated',
    });
  } catch (err) {
    logger.error(`Create payment error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Payment creation failed' });
  }
};

// ─── Confirm Payment ──────────────────────────────────────────
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { stripePaymentIntentId } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Verify with Stripe if available
    if (stripe && stripePaymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      if (intent.status === 'succeeded') {
        await payment.update({ status: 'completed', stripeChargeId: intent.latest_charge, gatewayResponse: intent });
      } else {
        await payment.update({ status: 'failed' });
        return res.status(400).json({ success: false, message: 'Payment not completed' });
      }
    } else {
      // Mock success for development
      await payment.update({ status: 'completed' });
    }

    await publishEvent('payment.completed', {
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      paymentId: payment.id,
    });

    res.json({ success: true, payment });
  } catch (err) {
    logger.error(`Confirm payment error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Payment confirmation failed' });
  }
};

// ─── Get Payment by Order ID ──────────────────────────────────
exports.getPaymentByOrder = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    const { orderId } = req.params;

    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (payment.userId !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment' });
  }
};

// ─── Get My Payments ──────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const payments = await Payment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// ─── Process Refund ───────────────────────────────────────────
exports.processRefund = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
    }

    // Process refund via Stripe if available
    if (stripe && payment.stripeChargeId) {
      try {
        await stripe.refunds.create({ charge: payment.stripeChargeId });
      } catch (stripeErr) {
        logger.warn(`Stripe refund error: ${stripeErr.message}`);
      }
    }

    await payment.update({ status: 'refunded', refundReason: reason, refundedAt: new Date() });

    await publishEvent('payment.refunded', {
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      reason,
    });

    logger.info(`Refund processed for payment: ${paymentId}`);
    res.json({ success: true, payment, message: 'Refund processed successfully' });
  } catch (err) {
    logger.error(`Refund error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Refund processing failed' });
  }
};

// ─── Get All Payments (Admin) ─────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const payments = await Payment.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// ─── Stripe Webhook ───────────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.json({ received: true });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      const payment = await Payment.findOne({ where: { stripePaymentIntentId: intent.id } });
      if (payment) {
        await payment.update({ status: 'completed' });
        await publishEvent('payment.completed', { orderId: payment.orderId, userId: payment.userId, amount: payment.amount });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      const payment = await Payment.findOne({ where: { stripePaymentIntentId: intent.id } });
      if (payment) await payment.update({ status: 'failed' });
      break;
    }
  }

  res.json({ received: true });
};