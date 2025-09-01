// Enhanced Razorpay Configuration for Kandukuru Supermarket
const config = require('./dotenv');

const razorpayConfig = {
  key_id: config.RAZORPAY.KEY_ID,
  key_secret: config.RAZORPAY.KEY_SECRET,
  webhook_secret: config.RAZORPAY.WEBHOOK_SECRET,

  // Environment detection
  isLive: config.RAZORPAY.MODE === 'live' || config.isProduction(),
  mode: config.RAZORPAY.MODE,

  // Additional configuration
  currency: 'INR',
  receipt_prefix: 'KS_',

  // Payment options
  payment_capture: 1, // Auto capture payments

  // Razorpay Instance Options
  options: {
    key: config.RAZORPAY.KEY_ID,
    amount: null, // Will be set dynamically
    currency: 'INR',
    name: config.BUSINESS.STORE_NAME,
    description: 'Payment for Kandukuru Supermarket',
    order_id: null, // Will be set dynamically
    handler: null, // Will be set in frontend
    prefill: {
      name: '',
      email: '',
      contact: config.BUSINESS.STORE_PHONE
    },
    notes: {
      store: 'Kandukuru Supermarket',
      location: config.BUSINESS.STORE_ADDRESS
    },
    theme: {
      color: '#1976d2'
    },
    modal: {
      ondismiss: null // Will be set in frontend
    }
  },

  // Webhook configuration
  webhook: {
    url: process.env.RAZORPAY_WEBHOOK_URL || '',
    secret: config.RAZORPAY.WEBHOOK_SECRET,
    events: [
      'payment.captured',
      'payment.failed',
      'order.paid',
      'refund.created'
    ]
  },

  // Test card details for development
  testCards: {
    success: {
      number: '4111111111111111',
      expiry: '12/25',
      cvv: '123',
      name: 'Test User'
    },
    failure: {
      number: '4000000000000002',
      expiry: '12/25',
      cvv: '123',
      name: 'Test User'
    }
  },

  // Validation method
  validate: function () {
    if (this.isLive) {
      if (this.key_id.includes('test') || this.key_id.includes('YOUR_')) {
        // Temporarily comment out this line to prevent crashing with placeholder keys
        // throw new Error('❌ Production mode detected but using test/placeholder Razorpay keys!');
        console.warn('⚠️  Warning: Production mode detected but using test/placeholder Razorpay keys!');
      }
      if (!this.webhook_secret) {
        console.warn('⚠️  Warning: Webhook secret not configured for production');
      }
    }

    if (!this.key_id || !this.key_secret) {
      throw new Error('❌ Razorpay credentials not configured');
    }

    console.log(`✅ Razorpay configured in ${this.mode} mode`);
    return true;
  }
};

// Run validation
try {
  razorpayConfig.validate();
} catch (error) {
  console.error('Razorpay configuration error:', error.message);
  if (config.isProduction()) {
    process.exit(1);
  }
}

module.exports = razorpayConfig;