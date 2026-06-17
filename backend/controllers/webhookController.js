const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const razorpayConfig = require('../config/razorpay');
const logger = require('../utils/logger');

// Verify webhook signature
const verifyWebhookSignature = (body, signature) => {
  try {
    if (!signature) {
      logger.error('Webhook signature header missing');
      return false;
    }
    if (!razorpayConfig.webhook_secret) {
      logger.error('Webhook secret not configured in backend');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.webhook_secret)
      .update(body, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    logger.error('Webhook signature verification exception', { error: error.message });
    return false;
  }
};

// Process payment captured webhook
const processPaymentCaptured = async (payload) => {
  try {
    const { id, order_id, amount, currency, method, bank, card, upi, email, contact, fee, tax, error_code, error_description } = payload;

    logger.info(`Processing payment captured webhook`, { paymentId: id, orderId: order_id });

    // Look up order to associate correctly
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': order_id });

    // Find or create payment record
    let payment = await Payment.findOne({ razorpayPaymentId: id });

    if (!payment) {
      payment = new Payment({
        paymentId: id,
        orderId: order_id,
        receipt: order?.orderId || `receipt_${Date.now()}`,
        amount: amount,
        currency: currency,
        amountInRupees: amount / 100,
        method: method || 'online',
        bank: bank || null,
        cardNetwork: card?.network || null,
        upiId: upi?.vpa || null,
        status: 'captured',
        captureStatus: 'captured',
        captureDate: new Date(),
        customerEmail: email || order?.shippingAddress?.email,
        customerPhone: contact || order?.shippingAddress?.phone,
        customerName: order?.shippingAddress?.name || 'Customer',
        customerId: order?.user || null,
        orderReference: order?._id || null,
        razorpayPaymentId: id,
        razorpayOrderId: order_id,
        isVerified: true,
        verificationDate: new Date(),
        metadata: {
          fee: fee ? fee.toString() : '0',
          tax: tax ? tax.toString() : '0',
          errorCode: error_code || '',
          errorDescription: error_description || ''
        }
      });
    } else {
      payment.status = 'captured';
      payment.captureStatus = 'captured';
      payment.captureDate = new Date();
      payment.isVerified = true;
      payment.verificationDate = new Date();
      payment.method = method || payment.method;
      payment.bank = bank || payment.bank;
      payment.cardNetwork = card?.network || payment.cardNetwork;
      payment.upiId = upi?.vpa || payment.upiId;
      if (order) {
        payment.orderReference = order._id;
        payment.customerId = order.user;
        if (!payment.customerName) payment.customerName = order.shippingAddress?.name;
      }
    }

    await payment.save();
    logger.info(`Payment record saved`, { paymentId: id });

    // Update order status if found
    if (order) {
      order.paymentInfo.razorpayPaymentId = id;
      order.paymentInfo.paymentStatus = 'completed';
      order.status = 'Confirmed';
      await order.save();
      logger.info(`Order status updated to Confirmed`, { orderId: order.orderId });
    }

    return { success: true, paymentId: id };
  } catch (error) {
    logger.error('Error processing payment captured webhook', { error: error.message });
    throw error;
  }
};

// Process payment failed webhook
const processPaymentFailed = async (payload) => {
  try {
    const { id, order_id, amount, currency, method, error_code, error_description } = payload;

    logger.warn(`Processing payment failed webhook`, { paymentId: id, orderId: order_id });

    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': order_id });

    let payment = await Payment.findOne({ razorpayPaymentId: id });

    if (!payment) {
      payment = new Payment({
        paymentId: id,
        orderId: order_id,
        receipt: order?.orderId || `receipt_${Date.now()}`,
        amount: amount,
        currency: currency,
        amountInRupees: amount / 100,
        method: method || 'online',
        status: 'failed',
        captureStatus: 'failed',
        errorCode: error_code || '',
        errorDescription: error_description || '',
        failureReason: error_description || '',
        razorpayPaymentId: id,
        razorpayOrderId: order_id,
        customerEmail: order?.shippingAddress?.email,
        customerPhone: order?.shippingAddress?.phone,
        customerName: order?.shippingAddress?.name || 'Customer',
        customerId: order?.user || null,
        orderReference: order?._id || null,
        isVerified: true,
        verificationDate: new Date()
      });
    } else {
      payment.status = 'failed';
      payment.captureStatus = 'failed';
      payment.errorCode = error_code || '';
      payment.errorDescription = error_description || '';
      payment.failureReason = error_description || '';
      payment.isVerified = true;
      payment.verificationDate = new Date();
      if (order) {
        payment.orderReference = order._id;
        payment.customerId = order.user;
      }
    }

    await payment.save();
    logger.warn(`Failed payment record saved`, { paymentId: id });

    if (order) {
      order.paymentInfo.razorpayPaymentId = id;
      order.paymentInfo.paymentStatus = 'failed';
      order.status = 'Cancelled'; // Cancel order on payment failure
      await order.save();
      logger.warn(`Order status set to Cancelled due to payment failure`, { orderId: order.orderId });
    }

    return { success: true, paymentId: id };
  } catch (error) {
    logger.error('Error processing payment failed webhook', { error: error.message });
    throw error;
  }
};

// Process refund created webhook
const processRefundCreated = async (payload) => {
  try {
    const { id, payment_id, amount, currency, status, notes } = payload;

    logger.info(`Processing refund created webhook`, { refundId: id, paymentId: payment_id });

    const payment = await Payment.findOne({ razorpayPaymentId: payment_id });

    if (!payment) {
      logger.error(`Original payment not found for refund`, { refundId: id, paymentId: payment_id });
      return { success: false, error: 'Original payment not found' };
    }

    const refundAmount = amount / 100;
    await payment.processRefund(refundAmount, notes || 'Customer request');

    logger.info(`Refund status updated on payment record`, { paymentId: payment_id });

    if (payment.orderReference) {
      const order = await Order.findById(payment.orderReference);
      if (order) {
        order.paymentInfo.paymentStatus = 'refunded';
        order.status = 'Cancelled'; // Mark cancelled on full refund
        await order.save();
        logger.info(`Order status updated to Cancelled/Refunded`, { orderId: order.orderId });
      }
    }

    return { success: true, refundId: id, paymentId: payment_id };
  } catch (error) {
    logger.error('Error processing refund created webhook', { error: error.message });
    throw error;
  }
};

// Main webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    let rawBody;
    let eventData;

    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
      eventData = JSON.parse(rawBody);
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
      eventData = JSON.parse(rawBody);
    } else {
      rawBody = JSON.stringify(req.body);
      eventData = req.body;
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = eventData.event;
    const payload = eventData.payload;

    logger.info(`Webhook received`, { event });

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
        result = { success: true, message: 'order.paid handled via payment.captured' };
        break;

      default:
        logger.info(`Unhandled webhook event`, { event });
        result = { success: true, message: 'Event not handled' };
    }

    res.json({ success: true, result });
  } catch (error) {
    logger.error('Webhook processing failure', { error: error.message });
    res.status(500).json({ error: 'Webhook processing failed' });
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

