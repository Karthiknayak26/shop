require('dotenv').config();

// Enhanced Configuration Management for Kandukuru Supermarket
const config = {
  // Environment Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  APP_NAME: process.env.APP_NAME || 'Kandukuru Supermarket',
  API_VERSION: process.env.API_VERSION || 'v1',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/kandukuru-supermarket',

  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],

  // Payment Gateway Configuration
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID',
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET',
    MODE: process.env.RAZORPAY_MODE || 'test',
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  },

  // Email Configuration
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT) || 587,
    SECURE: process.env.EMAIL_SECURE === 'true',
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
    FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@kandukuru-supermarket.com'
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['image/jpeg', 'image/png', 'image/webp']
  },

  // Rate Limiting Configuration
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logging Configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE: process.env.LOG_FILE || 'logs/app.log'
  },

  // Business Configuration
  BUSINESS: {
    STORE_NAME: process.env.STORE_NAME || 'Kandukuru Supermarket',
    STORE_ADDRESS: process.env.STORE_ADDRESS || 'Andhra Pradesh Mantralaya',
    STORE_PHONE: process.env.STORE_PHONE || '+91-XXXXXXXXXX',
    STORE_EMAIL: process.env.STORE_EMAIL || 'support@kandukuru-supermarket.com',
    DELIVERY_RADIUS_KM: parseInt(process.env.DELIVERY_RADIUS_KM) || 10
  },

  // Admin Configuration
  ADMIN: {
    EMAIL: process.env.ADMIN_EMAIL || 'admin@kandukuru-supermarket.com',
    PASSWORD: process.env.ADMIN_PASSWORD || 'change_this_password_in_production'
  },

  // External APIs
  EXTERNAL_APIS: {
    RAPID_API_HOST: process.env.RAPID_API_HOST || '',
    RAPID_API_KEY: process.env.RAPID_API_KEY || ''
  },

  // Monitoring & Analytics
  MONITORING: {
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID || ''
  },

  // Helper Methods
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isTest: () => process.env.NODE_ENV === 'test'
};

// Validation for critical configuration
const validateConfig = () => {
  function validateConfig(config) {
    if (process.env.NODE_ENV === 'production') {
      if (!config.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        process.exit(1);
      }
      if (!config.MONGODB_URI) {
        console.error('FATAL ERROR: MONGODB_URI is not defined.');
        process.exit(1);
      }
      // Temporarily comment out Razorpay validation
      /*
      if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
        console.error('FATAL ERROR: Razorpay credentials are not defined.');
        process.exit(1);
      }
      */
    }
  }
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = requiredVars.filter(variable => {
    if (variable === 'JWT_SECRET') {
      return !config.JWT_SECRET || config.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production';
    } else if (variable === 'MONGODB_URI') {
      return !config.MONGODB_URI; // Corrected logic: directly check MONGODB_URI
    }
    return false; // Should not reach here for requiredVars
  });

  if (missing.length > 0 && config.isProduction()) {
    console.error('❌ Critical environment variables missing in production:', missing);
    process.exit(1);
  }

  if (config.isProduction()) {
    // Additional production validations
    // if (config.RAZORPAY.KEY_ID.includes('YOUR_') || config.RAZORPAY.KEY_SECRET.includes('YOUR_')) {
    //   console.warn('⚠️  Warning: Using placeholder Razorpay credentials in production');
    // }

    if (!config.EMAIL.USER || config.EMAIL.USER === '') {
      console.warn('⚠️  Warning: Email configuration not set up');
    }
    // Validate Razorpay credentials in production
    // if (process.env.NODE_ENV === 'production') {
    //     if (!config.RAZORPAY_KEY_ID || config.RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
    //         console.warn('WARNING: RAZORPAY_KEY_ID is not set or is a placeholder. Payments will not function correctly.');
    //     }
    //     if (!config.RAZORPAY_KEY_SECRET || config.RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_KEY_SECRET') {
    //         console.warn('WARNING: RAZORPAY_KEY_SECRET is not set or is a placeholder. Payments will not function correctly.');
    //     }
    //     if (!config.RAZORPAY_MODE || !['test', 'live'].includes(config.RAZORPAY_MODE)) {
    //         console.warn('WARNING: RAZORPAY_MODE is not set or is invalid. Payments may not function correctly.');
    //     }
    // }
  }
};

// Run validation
validateConfig();

module.exports = config;
