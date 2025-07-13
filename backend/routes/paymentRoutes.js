const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create payment order
router.post('/create-order', paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Get payment details
router.get('/payment/:paymentId', paymentController.getPaymentDetails);

// Refund payment
router.post('/refund', paymentController.refundPayment);

module.exports = router; 