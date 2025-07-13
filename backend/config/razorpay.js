// Razorpay Configuration
// Replace these with your actual Razorpay keys from your Razorpay dashboard

const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET'
};

module.exports = razorpayConfig; 