const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');
const sanitizeHtml = require('sanitize-html');

// Custom sanitization function
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove XSS attempts
    let sanitized = xss(input);
    // Remove HTML tags but keep safe content
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
      disallowedTagsMode: 'recursiveEscape'
    });
    // Trim whitespace
    return sanitized.trim();
  }
  return input;
};

// Recursive sanitization for objects and arrays
const deepSanitize = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  } else {
    return sanitizeInput(obj);
  }
};

// Sanitization middleware
const sanitizeRequest = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = deepSanitize(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = deepSanitize(req.params);
  }

  next();
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  // Password validation
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  // Phone number validation (Indian format)
  phone: body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),

  // Name validation
  name: body('name')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must be 2-50 characters long and contain only letters and spaces'),

  // Price validation
  price: body('price')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Price must be a positive number between 0.01 and 1,000,000'),

  // Quantity validation
  quantity: body('quantity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Quantity must be a positive integer between 1 and 10,000'),

  // ObjectId validation
  objectId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// User validation rules
const userValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone,
    body('address')
      .optional()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters'),
    handleValidationErrors
  ],

  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],

  updateProfile: [
    commonValidations.name.optional(),
    commonValidations.email.optional(),
    commonValidations.phone.optional(),
    body('address')
      .optional()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Product validation rules
const productValidations = {
  create: [
    body('name')
      .isLength({ min: 3, max: 100 })
      .withMessage('Product name must be between 3 and 100 characters'),
    body('description')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Product description must be between 10 and 1000 characters'),
    commonValidations.price,
    commonValidations.quantity,
    body('category')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Invalid image URL'),
    handleValidationErrors
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Product name must be between 3 and 100 characters'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Product description must be between 10 and 1000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Price must be a positive number between 0.01 and 1,000,000'),
    body('stock')
      .optional()
      .isInt({ min: 0, max: 10000 })
      .withMessage('Stock must be a non-negative integer between 0 and 10,000'),
    handleValidationErrors
  ]
};

// Order validation rules
const orderValidations = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.productId')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 100 })
      .withMessage('Item quantity must be between 1 and 100'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address is required'),
    body('shippingAddress.name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Shipping name must be between 2 and 50 characters'),
    body('shippingAddress.address')
      .isLength({ min: 10, max: 200 })
      .withMessage('Shipping address must be between 10 and 200 characters'),
    body('shippingAddress.phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit Indian phone number'),
    body('paymentMethod')
      .isIn(['cod', 'card', 'upi', 'netbanking'])
      .withMessage('Invalid payment method'),
    handleValidationErrors
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    handleValidationErrors
  ]
};

// Payment validation rules
const paymentValidations = {
  createOrder: [
    body('amount')
      .isFloat({ min: 1, max: 1000000 })
      .withMessage('Amount must be between 1 and 1,000,000'),
    body('currency')
      .optional()
      .isIn(['INR'])
      .withMessage('Only INR currency is supported'),
    handleValidationErrors
  ],

  verify: [
    body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
    handleValidationErrors
  ]
};

// Admin validation rules
const adminValidations = {
  createProduct: productValidations.create,
  updateProduct: productValidations.update,
  createCategory: [
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage('Category description must be between 10 and 500 characters'),
    handleValidationErrors
  ],

  updateCategory: [
    param('id').isMongoId().withMessage('Invalid category ID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage('Category description must be between 10 and 500 characters'),
    handleValidationErrors
  ]
};

// Search validation rules
const searchValidations = {
  products: [
    query('q')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    query('category')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a non-negative number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a non-negative number'),
    query('sort')
      .optional()
      .isIn(['name', 'price', 'createdAt', 'popularity'])
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be either asc or desc'),
    handleValidationErrors
  ]
};

// File upload validation rules
const fileValidations = {
  image: [
    body('image')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Image file is required');
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only JPEG, JPG, PNG, and WebP images are allowed');
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
          throw new Error('Image file size must be less than 5MB');
        }

        return true;
      }),
    handleValidationErrors
  ]
};

module.exports = {
  // Middleware
  sanitizeRequest,
  handleValidationErrors,

  // Common validations
  commonValidations,

  // Specific validation sets
  userValidations,
  productValidations,
  orderValidations,
  paymentValidations,
  adminValidations,
  searchValidations,
  fileValidations,

  // Utility functions
  sanitizeInput,
  deepSanitize
};
