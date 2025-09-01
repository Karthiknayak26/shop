const config = require('./dotenv');

// Security configuration object
const securityConfig = {
  // Rate limiting configuration
  rateLimit: {
    // General API rate limiting
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Authentication rate limiting
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth attempts per windowMs
      message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Payment rate limiting
    payment: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 payment attempts per windowMs
      message: {
        error: 'Too many payment attempts, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Admin API rate limiting
    admin: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // limit each IP to 50 admin requests per windowMs
      message: {
        error: 'Too many admin requests, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // File upload rate limiting
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 file uploads per hour
      message: {
        error: 'Too many file uploads, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Search rate limiting
    search: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 30, // limit each IP to 30 search requests per 5 minutes
      message: {
        error: 'Too many search requests, please try again later.',
        retryAfter: '5 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Strict rate limiting for suspicious activity
    strict: {
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 requests per minute
      message: {
        error: 'Suspicious activity detected, please try again later.',
        retryAfter: '1 minute'
      },
      standardHeaders: true,
      legacyHeaders: false
    }
  },

  // CORS configuration
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = config.CORS_ORIGIN
        ? config.CORS_ORIGIN.split(',')
        : ['http://localhost:3000', 'http://localhost:5000'];

      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Razorpay-Signature'
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ],
    maxAge: 86400 // 24 hours
  },

  // Helmet configuration for security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
          "https://js.stripe.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://checkout.razorpay.com"
        ],
        frameSrc: [
          "'self'",
          "https://checkout.razorpay.com",
          "https://js.stripe.com"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false, // Allow external resources
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  },

  // JWT configuration
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: '30d',
    algorithm: 'HS256',
    issuer: config.APP_NAME,
    audience: config.APP_NAME
  },

  // Password policy
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },

  // Session configuration
  session: {
    secret: config.SESSION_SECRET || config.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.isProduction(),
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    }
  },

  // File upload security
  fileUpload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    uploadPath: 'uploads/',
    tempPath: 'temp/'
  },

  // IP filtering
  ipFilter: {
    blockedIPs: config.BLOCKED_IPS ? config.BLOCKED_IPS.split(',') : [],
    trustedIPs: config.TRUSTED_IPS ? config.TRUSTED_IPS.split(',') : [
      '127.0.0.1',
      '::1'
    ],
    whitelistMode: config.IP_WHITELIST_MODE === 'true'
  },

  // Request size limits
  requestLimits: {
    body: '10mb',
    urlencoded: '10mb',
    json: '10mb'
  },

  // Security monitoring
  monitoring: {
    enabled: config.MONITORING?.ENABLED || false,
    logLevel: config.MONITORING?.LOG_LEVEL || 'info',
    alertThreshold: config.MONITORING?.ALERT_THRESHOLD || 100,
    slowRequestThreshold: 5000, // 5 seconds
    errorRateThreshold: 0.1 // 10%
  },

  // Environment-specific security
  environment: {
    development: {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000']
      },
      helmet: {
        contentSecurityPolicy: false // Disable CSP in development for easier debugging
      },
      logging: {
        level: 'debug',
        showStack: true
      }
    },
    production: {
      cors: {
        origin: config.ALLOWED_ORIGINS ? config.ALLOWED_ORIGINS.split(',') : []
      },
      helmet: {
        contentSecurityPolicy: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      },
      logging: {
        level: 'warn',
        showStack: false
      }
    }
  }
};

// Get environment-specific configuration
const getEnvironmentConfig = () => {
  const env = config.NODE_ENV || 'development';
  return {
    ...securityConfig,
    ...securityConfig.environment[env]
  };
};

// Validate security configuration
const validateSecurityConfig = () => {
  const errors = [];

  // Check required environment variables
  if (!config.JWT_SECRET || config.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
    errors.push('JWT_SECRET is not properly configured');
  }

  if (config.isProduction()) {
    if (!config.ALLOWED_ORIGINS) {
      errors.push('ALLOWED_ORIGINS is required in production');
    }

    if (!config.SESSION_SECRET && !config.JWT_SECRET) {
      errors.push('SESSION_SECRET or JWT_SECRET is required in production');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Security configuration errors:', errors);
    if (config.isProduction()) {
      process.exit(1);
    }
  } else {
    console.log('✅ Security configuration validated');
  }
};

// Export configuration
module.exports = {
  securityConfig,
  getEnvironmentConfig,
  validateSecurityConfig
};
