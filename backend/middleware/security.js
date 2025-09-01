const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
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
};

// Helmet configuration for security headers
const helmetConfig = {
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
};

// Security middleware function
const securityMiddleware = (app) => {
  // Basic security headers
  app.use(helmet(helmetConfig));

  // CORS
  app.use(cors(corsOptions));

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // Additional security headers
  app.use((req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    // Custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Cache control for sensitive endpoints
    if (req.path.includes('/api/auth') || req.path.includes('/api/admin')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  });

  // Request logging for security monitoring
  app.use((req, res, next) => {
    const start = Date.now();

    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);

      // Log suspicious activity
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn(`[SECURITY] Unauthorized access attempt: ${req.method} ${req.path} from IP: ${req.ip}`);
      }

      if (res.statusCode === 429) {
        console.warn(`[SECURITY] Rate limit exceeded: ${req.method} ${req.path} from IP: ${req.ip}`);
      }
    });

    next();
  });
};

// IP filtering middleware
const ipFilter = (req, res, next) => {
  const blockedIPs = process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [];
  const clientIP = req.ip;

  if (blockedIPs.includes(clientIP)) {
    console.warn(`[SECURITY] Blocked request from blocked IP: ${clientIP}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  next();
};

// Request size limiting
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      maxSize: '10MB'
    });
  }

  next();
};

// SQL injection protection (basic)
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|SCRIPT>)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*[=<>]\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"][^'"]*['"]\s*[=<>]\s*['"][^'"]*['"])/i,
    /(\b(OR|AND)\b\s+\w+\s*[=<>]\s*\w+)/i
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (checkValue(value)) {
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check request body
  if (req.body && checkObject(req.body)) {
    console.warn(`[SECURITY] Potential SQL injection attempt from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }

  // Check query parameters
  if (req.query && checkObject(req.query)) {
    console.warn(`[SECURITY] Potential SQL injection attempt from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }

  next();
};

// XSS protection middleware
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (checkValue(value)) {
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check request body
  if (req.body && checkObject(req.body)) {
    console.warn(`[SECURITY] Potential XSS attempt from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }

  // Check query parameters
  if (req.query && checkObject(req.query)) {
    console.warn(`[SECURITY] Potential XSS attempt from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }

  next();
};

// Environment-based security
const environmentSecurity = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Additional security for production
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Block certain user agents in production
    const userAgent = req.get('User-Agent') || '';
    const blockedUserAgents = [
      'sqlmap',
      'nikto',
      'nmap',
      'w3af',
      'acunetix',
      'burpsuite'
    ];

    for (const blockedAgent of blockedUserAgents) {
      if (userAgent.toLowerCase().includes(blockedAgent.toLowerCase())) {
        console.warn(`[SECURITY] Blocked request from security scanner: ${userAgent}`);
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
  }

  next();
};

module.exports = {
  securityMiddleware,
  ipFilter,
  requestSizeLimit,
  sqlInjectionProtection,
  xssProtection,
  environmentSecurity,
  corsOptions,
  helmetConfig
};
