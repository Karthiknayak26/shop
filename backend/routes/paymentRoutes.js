const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public payment endpoints
router.post('/create-order', paymentController.createPaymentOrder);
router.post('/generate-upi-qr', paymentController.generateUPIQRCode);
router.get('/check-status/:orderId', paymentController.checkPaymentStatus);
router.post('/verify', paymentController.verifyPayment);

// Webhook endpoints (no auth required - Razorpay calls these)
router.post('/webhook', webhookController.handleWebhook);
router.get('/webhook/events', webhookController.getWebhookEvents);

// Test webhook endpoint (for development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/webhook/test', webhookController.testWebhook);
}

// Protected payment endpoints (require authentication)
router.get('/payment/:paymentId', authMiddleware, paymentController.getPaymentDetails);
router.post('/refund', authMiddleware, adminMiddleware, paymentController.refundPayment);

// Admin payment management endpoints
router.get('/admin/payments', authMiddleware, adminMiddleware, paymentController.getAllPayments);
router.get('/admin/payments/stats', authMiddleware, adminMiddleware, paymentController.getPaymentStats);
router.get('/admin/payments/export', authMiddleware, adminMiddleware, paymentController.exportPayments);

module.exports = router; 