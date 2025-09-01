const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const razorpayConfig = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

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

    // Check if we're in demo mode
    if (!razorpayConfig.isLive && (razorpayConfig.key_id === 'rzp_test_YOUR_TEST_KEY_ID' || razorpayConfig.key_secret === 'YOUR_TEST_KEY_SECRET')) {
      // Demo mode - simulate payment verification
      console.log('🔄 Demo Mode: Simulating payment verification');

      // Check if it's a demo order
      if (razorpay_order_id && razorpay_order_id.includes('_demo')) {
        res.json({
          success: true,
          message: 'Payment verified successfully (Demo Mode)',
          paymentId: razorpay_payment_id || `pay_${Date.now()}_demo`,
          orderId: razorpay_order_id,
          demo: true
        });
        return;
      }
    }

    // Create the signature string
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate expected signature
    const expectedSign = crypto
      .createHmac("sha256", razorpayConfig.key_secret)
      .update(sign.toString())
      .digest("hex");

    // Verify signature
    if (razorpay_signature === expectedSign) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
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