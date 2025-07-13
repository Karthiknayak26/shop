const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayConfig = require('../config/razorpay');

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret
});

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Check if we're in demo mode (no real Razorpay keys)
    if (razorpayConfig.key_id === 'rzp_test_YOUR_TEST_KEY_ID' || razorpayConfig.key_secret === 'YOUR_TEST_KEY_SECRET') {
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
      payment_capture: 1
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

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Check if we're in demo mode
    if (razorpayConfig.key_id === 'rzp_test_YOUR_TEST_KEY_ID' || razorpayConfig.key_secret === 'YOUR_TEST_KEY_SECRET') {
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

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment
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