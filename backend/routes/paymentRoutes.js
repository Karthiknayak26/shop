const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// ============================================
// AUTHENTICATED PAYMENT ENDPOINTS
// ============================================
router.post('/create-order', authMiddleware, paymentController.createPaymentOrder);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.post('/generate-upi-qr', authMiddleware, paymentController.generateUPIQRCode);
router.get('/check-status/:orderId', authMiddleware, paymentController.checkPaymentStatus);

// ============================================
// WEBHOOK ENDPOINTS (no auth — Razorpay calls these directly)
// ============================================
router.post('/webhook', webhookController.handleWebhook);

// ============================================
// PROTECTED ENDPOINTS (Authenticated)
// ============================================
router.get('/payment/:paymentId', authMiddleware, paymentController.getPaymentDetails);

// ============================================
// ADMIN ENDPOINTS
// ============================================
router.post('/refund', authMiddleware, adminMiddleware, paymentController.refundPayment);
router.get('/admin/payments', authMiddleware, adminMiddleware, paymentController.getAllPayments);
router.get('/admin/payments/stats', authMiddleware, adminMiddleware, paymentController.getPaymentStats);
router.get('/admin/payments/export', authMiddleware, adminMiddleware, paymentController.exportPayments);

module.exports = router;