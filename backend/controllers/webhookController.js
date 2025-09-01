const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const razorpayConfig = require('../config/razorpay');

// Verify webhook signature
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.webhook_secret)
      .update(body, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

// Process payment captured webhook
const processPaymentCaptured = async (payload) => {
  try {
    const { id, order_id, amount, currency, method, bank, card, upi, email, contact, fee, tax, error_code, error_description } = payload;

    console.log(`💰 Processing payment captured webhook for payment ID: ${id}`);

    // Find existing payment record
    let payment = await Payment.findOne({ razorpayPaymentId: id });

    if (!payment) {
      console.log(`⚠️ Payment record not found for payment ID: ${id}, creating new record`);

      // Create new payment record
      payment = new Payment({
        paymentId: id,
        orderId: order_id,
        receipt: `receipt_${Date.now()}`,
        amount: amount,
        currency: currency,
        amountInRupees: amount / 100,
        method: method,
        bank: bank || null,
        cardNetwork: card?.network || null,
        upiId: upi?.vpa || null,
        status: 'captured',
        captureStatus: 'captured',
        captureDate: new Date(),
        customerEmail: email,
        customerPhone: contact,
        razorpayPaymentId: id,
        razorpayOrderId: order_id,
        isVerified: true,
        verificationDate: new Date(),
        metadata: {
          fee: fee || 0,
          tax: tax || 0,
          errorCode: error_code || null,
          errorDescription: error_description || null
        }
      });
    } else {
      // Update existing payment record
      payment.status = 'captured';
      payment.captureStatus = 'captured';
      payment.captureDate = new Date();
      payment.isVerified = true;
      payment.verificationDate = new Date();
      payment.method = method;
      payment.bank = bank || payment.bank;
      payment.cardNetwork = card?.network || payment.cardNetwork;
      payment.upiId = upi?.vpa || payment.upiId;

      if (payment.metadata) {
        payment.metadata.set('fee', fee || 0);
        payment.metadata.set('tax', tax || 0);
        payment.metadata.set('errorCode', error_code || null);
        payment.metadata.set('errorDescription', error_description || null);
      }
    }

    await payment.save();
    console.log(`✅ Payment captured successfully for payment ID: ${id}`);

    // Update order status if order reference exists
    if (payment.orderReference) {
      await Order.findByIdAndUpdate(payment.orderReference, {
        paymentStatus: 'completed',
        status: 'confirmed',
        updatedAt: new Date()
      });
      console.log(`✅ Order status updated for order ID: ${payment.orderReference}`);
    }

    return { success: true, paymentId: id };
  } catch (error) {
    console.error('❌ Error processing payment captured webhook:', error);
    throw error;
  }
};

// Process payment failed webhook
const processPaymentFailed = async (payload) => {
  try {
    const { id, order_id, amount, currency, method, error_code, error_description } = payload;

    console.log(`❌ Processing payment failed webhook for payment ID: ${id}`);

    // Find existing payment record
    let payment = await Payment.findOne({ razorpayPaymentId: id });

    if (!payment) {
      console.log(`⚠️ Payment record not found for payment ID: ${id}, creating new record`);

      // Create new payment record for failed payment
      payment = new Payment({
        paymentId: id,
        orderId: order_id,
        receipt: `receipt_${Date.now()}`,
        amount: amount,
        currency: currency,
        amountInRupees: amount / 100,
        method: method,
        status: 'failed',
        captureStatus: 'failed',
        errorCode: error_code,
        errorDescription: error_description,
        failureReason: error_description,
        razorpayPaymentId: id,
        razorpayOrderId: order_id,
        isVerified: true,
        verificationDate: new Date()
      });
    } else {
      // Update existing payment record
      payment.status = 'failed';
      payment.captureStatus = 'failed';
      payment.errorCode = error_code;
      payment.errorDescription = error_description;
      payment.failureReason = error_description;
      payment.isVerified = true;
      payment.verificationDate = new Date();
    }

    await payment.save();
    console.log(`✅ Payment failed status recorded for payment ID: ${id}`);

    // Update order status if order reference exists
    if (payment.orderReference) {
      await Order.findByIdAndUpdate(payment.orderReference, {
        paymentStatus: 'failed',
        status: 'cancelled',
        updatedAt: new Date()
      });
      console.log(`✅ Order status updated for failed payment, order ID: ${payment.orderReference}`);
    }

    return { success: true, paymentId: id };
  } catch (error) {
    console.error('❌ Error processing payment failed webhook:', error);
    throw error;
  }
};

// Process refund created webhook
const processRefundCreated = async (payload) => {
  try {
    const { id, payment_id, amount, currency, receipt, speed, status, notes } = payload;

    console.log(`🔄 Processing refund created webhook for refund ID: ${id}`);

    // Find the original payment
    const payment = await Payment.findOne({ razorpayPaymentId: payment_id });

    if (!payment) {
      console.log(`⚠️ Original payment not found for refund ID: ${id}`);
      return { success: false, error: 'Original payment not found' };
    }

    // Update payment with refund information
    const refundAmount = amount / 100; // Convert from paise to rupees
    await payment.processRefund(refundAmount, notes || 'Customer request');

    console.log(`✅ Refund processed successfully for payment ID: ${payment_id}, refund ID: ${id}`);

    // Update order status if order reference exists
    if (payment.orderReference) {
      await Order.findByIdAndUpdate(payment.orderReference, {
        paymentStatus: 'refunded',
        status: 'refunded',
        updatedAt: new Date()
      });
      console.log(`✅ Order status updated for refund, order ID: ${payment.orderReference}`);
    }

    return { success: true, refundId: id, paymentId: payment_id };
  } catch (error) {
    console.error('❌ Error processing refund created webhook:', error);
    throw error;
  }
};

// Main webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`📡 Webhook received: ${event}`);

    let result;

    switch (event) {
      case 'payment.captured':
        result = await processPaymentCaptured(payload.payment.entity);
        break;

      case 'payment.failed':
        result = await processPaymentFailed(payload.payment.entity);
        break;

      case 'refund.created':
        result = await processRefundCreated(payload.refund.entity);
        break;

      case 'order.paid':
        // This event is handled by payment.captured
        result = { success: true, message: 'Order paid event handled' };
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event}`);
        result = { success: true, message: 'Event not handled' };
    }

    res.json({ success: true, result });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Test webhook endpoint (for development)
exports.testWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log(`🧪 Testing webhook: ${event}`);

    let result;

    switch (event) {
      case 'payment.captured':
        result = await processPaymentCaptured(payload);
        break;

      case 'payment.failed':
        result = await processPaymentFailed(payload);
        break;

      case 'refund.created':
        result = await processRefundCreated(payload);
        break;

      default:
        result = { success: true, message: 'Test event processed' };
    }

    res.json({ success: true, result });

  } catch (error) {
    console.error('❌ Test webhook error:', error);
    res.status(500).json({ error: 'Test webhook failed' });
  }
};

// Get webhook events list
exports.getWebhookEvents = (req, res) => {
  const events = [
    'payment.captured',
    'payment.failed',
    'order.paid',
    'refund.created'
  ];

  res.json({ success: true, events });
};
