const config = require('../config/dotenv');

// Error types for better categorization
const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  PAYMENT: 'PAYMENT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  INTERNAL: 'INTERNAL_SERVER_ERROR'
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, errorType = ErrorTypes.INTERNAL, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error logger
const logError = (error, req = null) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      statusCode: error.statusCode || 500,
      errorType: error.errorType || ErrorTypes.INTERNAL
    },
    request: req ? {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      headers: {
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? 'Bearer ***' : 'none'
      }
    } : null,
    environment: config.NODE_ENV
  };

  // Log to console
  if (config.NODE_ENV === 'development') {
    console.error('🚨 Error Details:', JSON.stringify(errorLog, null, 2));
  } else {
    console.error(`[ERROR] ${error.message} - Status: ${error.statusCode} - Type: ${error.errorType}`);
  }

  // TODO: Send to external logging service (e.g., Sentry, LogRocket)
  if (config.MONITORING?.SENTRY_DSN) {
    // Sentry.captureException(error);
  }

  // TODO: Send to monitoring service
  if (config.MONITORING?.ENABLED) {
    // Send error metrics
  }
};

// Error response formatter
const formatErrorResponse = (error, req) => {
  const isDevelopment = config.NODE_ENV === 'development';

  const response = {
    success: false,
    error: {
      message: error.message,
      type: error.errorType || ErrorTypes.INTERNAL,
      code: error.statusCode || 500
    }
  };

  // Add details in development
  if (isDevelopment && error.details) {
    response.error.details = error.details;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.error.stack = error.stack;
  }

  // Add request ID if available
  if (req && req.id) {
    response.requestId = req.id;
  }

  // Add timestamp
  response.timestamp = new Date().toISOString();

  return response;
};

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  // Set default status code
  error.statusCode = error.statusCode || 500;
  error.errorType = error.errorType || ErrorTypes.INTERNAL;

  // Log the error
  logError(error, req);

  // Handle specific error types
  switch (error.errorType) {
    case ErrorTypes.VALIDATION:
      error.statusCode = 400;
      break;

    case ErrorTypes.AUTHENTICATION:
      error.statusCode = 401;
      break;

    case ErrorTypes.AUTHORIZATION:
      error.statusCode = 403;
      break;

    case ErrorTypes.NOT_FOUND:
      error.statusCode = 404;
      break;

    case ErrorTypes.RATE_LIMIT:
      error.statusCode = 429;
      break;

    case ErrorTypes.PAYMENT:
      error.statusCode = 400;
      break;

    case ErrorTypes.DATABASE:
      error.statusCode = 500;
      break;

    case ErrorTypes.EXTERNAL_API:
      error.statusCode = 502;
      break;

    case ErrorTypes.FILE_UPLOAD:
      error.statusCode = 400;
      break;

    default:
      error.statusCode = 500;
  }

  // Format error response
  const errorResponse = formatErrorResponse(error, req);

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    ErrorTypes.NOT_FOUND
  );
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  const message = `Invalid input data: ${errors.join('. ')}`;

  return new AppError(message, 400, ErrorTypes.VALIDATION, errors);
};

// Cast error handler (MongoDB ObjectId errors)
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400, ErrorTypes.VALIDATION);
};

// Duplicate key error handler
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const message = `Duplicate field value: ${field}. Please use another value.`;

  return new AppError(message, 400, ErrorTypes.VALIDATION);
};

// JWT error handler
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401, ErrorTypes.AUTHENTICATION);
};

// JWT expired error handler
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401, ErrorTypes.AUTHENTICATION);
};

// MongoDB error handler
const handleMongoError = (error) => {
  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  }

  if (error.name === 'CastError') {
    return handleCastError(error);
  }

  if (error.code === 11000) {
    return handleDuplicateKeyError(error);
  }

  return new AppError('Database operation failed', 500, ErrorTypes.DATABASE);
};

// Rate limit error handler
const handleRateLimitError = (error) => {
  return new AppError(
    'Too many requests from this IP, please try again later.',
    429,
    ErrorTypes.RATE_LIMIT
  );
};

// File upload error handler
const handleFileUploadError = (error) => {
  let message = 'File upload failed';
  let statusCode = 400;

  if (error.code === 'LIMIT_FILE_SIZE') {
    message = 'File too large. Maximum size is 5MB.';
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files. Maximum is 5 files.';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field.';
  }

  return new AppError(message, statusCode, ErrorTypes.FILE_UPLOAD);
};

// External API error handler
const handleExternalAPIError = (error) => {
  const message = error.response?.data?.message || error.message || 'External API request failed';
  const statusCode = error.response?.status || 502;

  return new AppError(message, statusCode, ErrorTypes.EXTERNAL_API);
};

// Global error handler for unhandled errors
const globalErrorHandler = (error) => {
  console.error('🚨 Unhandled Error:', error);

  // Log to external service
  if (config.MONITORING?.SENTRY_DSN) {
    // Sentry.captureException(error);
  }

  // Exit process in production for unhandled errors
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
};

// Setup global error handlers
const setupErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('🚨 Unhandled Rejection:', err);
    globalErrorHandler(err);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', err);
    globalErrorHandler(err);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('🚨 Unhandled Rejection:', err);
    globalErrorHandler(err);
  });
};

// Error monitoring middleware
const errorMonitoring = (req, res, next) => {
  // Add request ID for tracking
  req.id = require('crypto').randomBytes(8).toString('hex');

  // Monitor response time
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 5000) { // 5 seconds
      console.warn(`[SLOW_REQUEST] ${req.method} ${req.path} took ${duration}ms`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.warn(`[ERROR_RESPONSE] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    }
  });

  next();
};

module.exports = {
  ErrorTypes,
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleValidationError,
  handleCastError,
  handleDuplicateKeyError,
  handleJWTError,
  handleJWTExpiredError,
  handleMongoError,
  handleRateLimitError,
  handleFileUploadError,
  handleExternalAPIError,
  globalErrorHandler,
  setupErrorHandlers,
  errorMonitoring,
  logError,
  formatErrorResponse
};
