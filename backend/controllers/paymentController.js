const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const razorpayConfig = require('../config/razorpay');
const config = require('../config/dotenv');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const logger = require('../utils/logger');

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret
});

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, customerDetails } = req.body;

    // Check if we're in demo mode (no real Razorpay keys)
    if (!razorpayConfig.isLive && (razorpayConfig.key_id === 'rzp_test_YOUR_TEST_KEY_ID' || razorpayConfig.key_secret === 'YOUR_TEST_KEY_SECRET')) {
      // Demo mode - simulate payment order creation
      console.log('🔄 Demo Mode: Simulating payment order creation');

      const demoOrderId = `order_${Date.now()}_demo`;

      res.json({
        success: true,
        orderId: demoOrderId,
        amount: amount * 100,
        currency: currency,
        demo: true
      });
      return;
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        customer_email: customerDetails?.email || '',
        customer_phone: customerDetails?.phone || '',
        store: 'Kandukuru Supermarket'
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
};

// Generate UPI QR Code
exports.generateUPIQRCode = async (req, res) => {
  try {
    const { amount, upiId, orderId, merchantName = 'Kandukuru Supermarket' } = req.body;

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI ID format'
      });
    }

    // Create UPI payment URL
    const upiParams = new URLSearchParams({
      pa: upiId, // Payee UPI ID
      pn: merchantName, // Payee name
      am: amount.toString(), // Amount
      cu: 'INR', // Currency
      tn: `Order ${orderId} - ${Date.now()}`, // Transaction note
      mode: '02' // UPI mode
    });

    const upiUrl = `upi://pay?${upiParams.toString()}`;

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      upiUrl: upiUrl,
      upiId: upiId,
      amount: amount,
      orderId: orderId
    });
  } catch (error) {
    console.error('Generate UPI QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate UPI QR code'
    });
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if we're in demo mode
    if (!razorpayConfig.isLive && (razorpayConfig.key_id === 'rzp_test_YOUR_TEST_KEY_ID' || razorpayConfig.key_secret === 'YOUR_TEST_KEY_SECRET')) {
      // Demo mode - simulate payment status check
      console.log('🔄 Demo Mode: Simulating payment status check');

      // For demo orders, return a simulated status
      if (orderId && orderId.includes('_demo')) {
        // Simulate different payment statuses based on time
        const timeDiff = Date.now() - parseInt(orderId.split('_')[1]);
        let status = 'pending';

        if (timeDiff > 30000) { // 30 seconds
          status = 'completed';
        } else if (timeDiff > 15000) { // 15 seconds
          status = 'processing';
        }

        res.json({
          success: true,
          status: status,
          orderId: orderId,
          demo: true
        });
        return;
      }
    }

    // Real payment status check
    try {
      const order = await razorpay.orders.fetch(orderId);
      const payments = await razorpay.orders.fetchPayments(orderId);

      let status = 'pending';
      if (payments.items && payments.items.length > 0) {
        const latestPayment = payments.items[0];
        status = latestPayment.status;
      }

      res.json({
        success: true,
        status: status,
        orderId: orderId,
        order: order,
        payments: payments.items || []
      });
    } catch (razorpayError) {
      // If order not found in Razorpay, check our database
      console.log('Order not found in Razorpay, checking local database...');

      // You can add database check here if you store payment status locally
      res.json({
        success: true,
        status: 'pending',
        orderId: orderId,
        message: 'Order found in local database'
      });
    }
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status'
    });
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    const isDemo = razorpay_order_id.includes('_demo');

    // Check if we're in demo mode
    if (isDemo) {
      if (config.isProduction() || razorpayConfig.isLive) {
        return res.status(400).json({ success: false, error: 'Demo mode is not allowed in production.' });
      }

      logger.info('Demo Mode: Simulating payment verification', { razorpay_order_id });

      const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpay_order_id });
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found for demo verification' });
      }

      // Record simulated payment
      let paymentRecord = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
      if (!paymentRecord) {
        paymentRecord = new Payment({
          paymentId: razorpay_payment_id || `pay_${Date.now()}_demo`,
          orderId: razorpay_order_id,
          receipt: order.orderId,
          amount: order.totalAmount * 100,
          currency: 'INR',
          amountInRupees: order.totalAmount,
          method: 'upi',
          status: 'captured',
          captureStatus: 'captured',
          captureDate: new Date(),
          customerEmail: order.shippingAddress.email,
          customerPhone: order.shippingAddress.phone,
          customerName: order.shippingAddress.name,
          customerId: order.user,
          orderReference: order._id,
          razorpayPaymentId: razorpay_payment_id || `pay_${Date.now()}_demo`,
          razorpayOrderId: razorpay_order_id,
          isVerified: true,
          verificationDate: new Date()
        });
        await paymentRecord.save();
      }

      // Update order status
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id || `pay_${Date.now()}_demo`;
      order.paymentInfo.paymentStatus = 'completed';
      order.status = 'Confirmed';
      await order.save();

      return res.json({
        success: true,
        message: 'Payment verified successfully (Demo Mode)',
        paymentId: paymentRecord.paymentId,
        orderId: razorpay_order_id,
        demo: true
      });
    }

    // Real Razorpay signature verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", razorpayConfig.key_secret)
      .update(sign.toString())
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpay_signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSign, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      logger.error('Invalid payment signature', { razorpay_order_id, razorpay_payment_id });
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Retrieve order from database to verify amount
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpay_order_id });
    if (!order) {
      logger.error('Order not found for signature verification', { razorpay_order_id });
      return res.status(404).json({ success: false, error: 'Order not found in database' });
    }

    // Check for duplicate verification
    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingPayment && existingPayment.isVerified) {
      return res.status(400).json({ success: false, error: 'Payment already verified' });
    }

    // Fetch real payment details from Razorpay to verify the amount
    let razorpayPayment;
    try {
      razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (err) {
      logger.error('Failed to fetch payment details from Razorpay API', { error: err.message, paymentId: razorpay_payment_id });
      return res.status(400).json({ success: false, error: 'Could not fetch payment details from Razorpay' });
    }

    if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
      logger.error('Payment not successfully authorized/captured on Razorpay', { status: razorpayPayment.status, paymentId: razorpay_payment_id });
      return res.status(400).json({ success: false, error: `Payment is in ${razorpayPayment.status} state, not captured.` });
    }

    // Verify amount (paise vs rupees)
    const expectedAmountPaise = Math.round(order.totalAmount * 100);
    if (razorpayPayment.amount !== expectedAmountPaise) {
      logger.error('Payment amount mismatch between local order and Razorpay API', {
        localAmountPaise: expectedAmountPaise,
        razorpayAmount: razorpayPayment.amount
      });
      return res.status(400).json({ success: false, error: 'Payment amount mismatch. Order verification rejected.' });
    }

    // Create or update local Payment record
    let paymentRecord = existingPayment;
    if (!paymentRecord) {
      paymentRecord = new Payment({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        receipt: order.orderId,
        amount: razorpayPayment.amount,
        currency: razorpayPayment.currency,
        amountInRupees: razorpayPayment.amount / 100,
        method: razorpayPayment.method || 'online',
        bank: razorpayPayment.bank || null,
        cardNetwork: razorpayPayment.card?.network || null,
        upiId: razorpayPayment.upi?.vpa || null,
        status: razorpayPayment.status,
        captureStatus: razorpayPayment.status,
        captureDate: new Date(),
        customerEmail: razorpayPayment.email || order.shippingAddress.email,
        customerPhone: razorpayPayment.contact || order.shippingAddress.phone,
        customerName: order.shippingAddress.name,
        customerId: order.user,
        orderReference: order._id,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        isVerified: true,
        verificationDate: new Date()
      });
    } else {
      paymentRecord.status = razorpayPayment.status;
      paymentRecord.captureStatus = razorpayPayment.status;
      paymentRecord.isVerified = true;
      paymentRecord.verificationDate = new Date();
      paymentRecord.orderReference = order._id;
      paymentRecord.customerId = order.user;
    }
    await paymentRecord.save();

    // Update Order payment status and confirm it
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.paymentStatus = 'completed';
    order.status = 'Confirmed';
    await order.save();

    logger.info('Payment verified and order confirmed successfully', { orderId: order.orderId, paymentId: razorpay_payment_id });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    logger.error('Payment verification exception', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // First try to get from our database
    let payment = await Payment.findOne({
      $or: [
        { razorpayPaymentId: paymentId },
        { paymentId: paymentId }
      ]
    });

    if (payment) {
      return res.json({
        success: true,
        payment: payment
      });
    }

    // If not in our database, fetch from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment: razorpayPayment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment details'
    });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Convert to paise
      reason: reason || 'Customer request'
    });

    // Update our payment record
    const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
    if (payment) {
      await payment.processRefund(amount, reason);
    }

    res.json({
      success: true,
      refund
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method, startDate, endDate } = req.query;

    const query = {};

    if (status) query.status = status;
    if (method) query.method = method;
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name email')
      .populate('orderReference', 'orderNumber totalAmount');

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
};

// Get payment statistics (admin)
exports.getPaymentStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total payments
    const totalPayments = await Payment.countDocuments({
      paymentDate: { $gte: startDate }
    });

    // Successful payments
    const successfulPayments = await Payment.countDocuments({
      status: 'captured',
      paymentDate: { $gte: startDate }
    });

    // Failed payments
    const failedPayments = await Payment.countDocuments({
      status: 'failed',
      paymentDate: { $gte: startDate }
    });

    // Total amount
    const totalAmount = await Payment.aggregate([
      {
        $match: {
          status: 'captured',
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountInRupees' }
        }
      }
    ]);

    // Payment methods breakdown
    const methodBreakdown = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          amount: { $sum: '$amountInRupees' }
        }
      }
    ]);

    // Daily payment trends
    const dailyTrends = await Payment.aggregate([
      {
        $match: {
          status: 'captured',
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amountInRupees' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        period: `${period} days`,
        totalPayments,
        successfulPayments,
        failedPayments,
        successRate: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(2) : 0,
        totalAmount: totalAmount[0]?.total || 0,
        methodBreakdown,
        dailyTrends
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment statistics'
    });
  }
};

// Export payments (admin)
exports.exportPayments = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .sort({ paymentDate: -1 })
      .populate('customerId', 'name email')
      .populate('orderReference', 'orderNumber totalAmount');

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = payments.map(payment => ({
        PaymentID: payment.paymentId,
        OrderID: payment.orderId,
        Amount: payment.amountInRupees,
        Currency: payment.currency,
        Method: payment.method,
        Status: payment.status,
        CustomerName: payment.customerName,
        CustomerEmail: payment.customerEmail,
        PaymentDate: payment.paymentDate,
        CaptureDate: payment.captureDate
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');

      // Simple CSV conversion
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csv);
    } else {
      res.json({
        success: true,
        payments,
        total: payments.length
      });
    }
  } catch (error) {
    console.error('Export payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export payments'
    });
  }
}; 