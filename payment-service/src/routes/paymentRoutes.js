const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Stripe webhook (raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

router.get('/', paymentController.getAllPayments);
router.get('/my-payments', paymentController.getMyPayments);
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/:paymentId/confirm', paymentController.confirmPayment);
router.get('/order/:orderId', paymentController.getPaymentByOrder);
router.post('/:paymentId/refund', paymentController.processRefund);

module.exports = router;