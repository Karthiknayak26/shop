const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Redis client for distributed rate limiting (optional)
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
  redisClient.connect().catch(console.error);
}

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address and user agent for better rate limiting
    return `${req.ip}-${req.get('User-Agent')}`;
  },
  skip: (req) => {
    // Skip rate limiting for health checks and webhooks
    return req.path === '/health' || req.path.includes('/webhook');
  }
});

// Authentication rate limiting (login, register, password reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address for auth rate limiting
    return `auth-${req.ip}`;
  },
  skip: (req) => {
    // Only apply to authentication endpoints
    return !['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'].includes(req.path);
  }
});

// Payment rate limiting
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment attempts per windowMs
  message: {
    error: 'Too many payment attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address and user ID if available for payment rate limiting
    const userId = req.user?.id || 'anonymous';
    return `payment-${req.ip}-${userId}`;
  },
  skip: (req) => {
    // Only apply to payment endpoints
    return !req.path.includes('/api/payments');
  }
});

// Admin API rate limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 admin requests per windowMs
  message: {
    error: 'Too many admin requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address and admin user ID for admin rate limiting
    const adminId = req.user?.id || 'anonymous';
    return `admin-${req.ip}-${adminId}`;
  },
  skip: (req) => {
    // Only apply to admin endpoints
    return !req.path.includes('/api/admin') && !req.path.includes('/admin/');
  }
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 file uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address and user ID for upload rate limiting
    const userId = req.user?.id || 'anonymous';
    return `upload-${req.ip}-${userId}`;
  },
  skip: (req) => {
    // Only apply to file upload endpoints
    return !req.path.includes('/api/upload') && !req.path.includes('/upload');
  }
});

// Search rate limiting
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 search requests per 5 minutes
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address for search rate limiting
    return `search-${req.ip}`;
  },
  skip: (req) => {
    // Only apply to search endpoints
    return !req.path.includes('/api/search') && !req.path.includes('/search');
  }
});

// Strict rate limiting for suspicious activity
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: {
    error: 'Suspicious activity detected, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use IP address for strict rate limiting
    return `strict-${req.ip}`;
  },
  skip: (req) => {
    // Apply to all endpoints when suspicious activity is detected
    return false;
  }
});

// Rate limit bypass for trusted IPs
const trustedIPs = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];

const isTrustedIP = (ip) => {
  return trustedIPs.includes(ip) ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.');
};

// Middleware to check if IP should bypass rate limiting
const bypassRateLimit = (req, res, next) => {
  if (isTrustedIP(req.ip)) {
    req.bypassRateLimit = true;
  }
  next();
};

// Enhanced rate limiting with bypass support
const createEnhancedLimiter = (limiter) => {
  return (req, res, next) => {
    if (req.bypassRateLimit) {
      return next();
    }
    return limiter(req, res, next);
  };
};

module.exports = {
  generalLimiter: createEnhancedLimiter(generalLimiter),
  authLimiter: createEnhancedLimiter(authLimiter),
  paymentLimiter: createEnhancedLimiter(paymentLimiter),
  adminLimiter: createEnhancedLimiter(adminLimiter),
  uploadLimiter: createEnhancedLimiter(uploadLimiter),
  searchLimiter: createEnhancedLimiter(searchLimiter),
  strictLimiter: createEnhancedLimiter(strictLimiter),
  bypassRateLimit,
  isTrustedIP
};
