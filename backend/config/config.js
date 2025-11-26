require('dotenv').config(); // Load .env locally

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/kandukuru-supermarket',
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT) || 587,
    SECURE: process.env.EMAIL_SECURE === 'true',
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
    FROM: process.env.EMAIL_FROM || 'noreply@kandukuru-supermarket.com'
  },
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID',
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET',
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  }
};

// Validate critical variables in production
if (config.NODE_ENV === 'production') {
  if (!config.MONGODB_URI || !config.JWT_SECRET) {
    console.error('❌ Critical environment variables missing in production!');
    process.exit(1);
  }
}

module.exports = config;
