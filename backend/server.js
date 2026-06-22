const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

require('dotenv').config();

const config = require('./config/dotenv');
const logger = require('./utils/logger');
const { sanitizeRequest } = require('./middleware/validation');

// Route imports
const authRoutes = require('./routes/userRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const OrderRoutes = require('./routes/Order');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const locationRoutes = require('./routes/locationRoutes');
const path = require('path');

const app = express();

// ============================================
// STATIC ASSETS & CDN CACHING
// ============================================
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  setHeaders: (res, assetPath) => {
    if (assetPath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(hpp());

// CORS — whitelist only allowed origins
const allowedOrigins = config.CORS_ORIGIN;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/admin/auth/login', authLimiter);

// ============================================
// BODY PARSING
// ============================================
// Webhook route needs raw body for signature verification — must be BEFORE json parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON body parser with size limit for all other routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitize inputs globally except webhook
app.use((req, res, next) => {
  if (req.path.startsWith('/api/payments/webhook')) {
    return next();
  }
  sanitizeRequest(req, res, next);
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/locations', locationRoutes);

// ============================================
// ERROR HANDLING
// ============================================
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack, path: req.path });

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  res.status(err.status || 500).json({
    error: config.isProduction()
      ? 'Internal server error'
      : err.message,
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Database connected successfully'))
  .catch((error) => {
    logger.error('Database connection error:', { error: error.message });
    process.exit(1);
  });

// ============================================
// SERVER START
// ============================================
const PORT = config.PORT;
const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      logger.info('Database connection closed.');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', { reason: reason?.message || reason });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = app;
