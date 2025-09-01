const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/adminModel');
const config = require('../config/dotenv');

// Enhanced JWT verification with better error handling
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'], // Only allow HS256 algorithm
      issuer: config.APP_NAME, // Verify issuer
      audience: config.APP_NAME // Verify audience
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Generate JWT token with enhanced security
const generateToken = (payload, expiresIn = config.JWT_EXPIRES_IN) => {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000), // Issued at
    iss: config.APP_NAME, // Issuer
    aud: config.APP_NAME, // Audience
    jti: require('crypto').randomBytes(16).toString('hex') // JWT ID for uniqueness
  };

  return jwt.sign(tokenPayload, config.JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  const refreshPayload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    iss: config.APP_NAME,
    aud: config.APP_NAME,
    jti: require('crypto').randomBytes(16).toString('hex')
  };

  return jwt.sign(refreshPayload, config.JWT_SECRET, {
    expiresIn: '30d', // Refresh token valid for 30 days
    algorithm: 'HS256'
  });
};

// Main authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Check if token was issued before a certain time (for token revocation)
    if (decoded.iat && decoded.iat < (currentTime - (30 * 24 * 60 * 60))) { // 30 days ago
      return res.status(401).json({
        success: false,
        error: 'Token is too old',
        code: 'TOKEN_TOO_OLD'
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated',
        code: 'USER_DEACTIVATED'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        error: 'User account is blocked',
        code: 'USER_BLOCKED'
      });
    }

    // Add user to request
    req.user = user;
    req.token = token;
    req.tokenData = decoded;

    // Log successful authentication
    console.log(`[AUTH] User ${user.email} authenticated successfully from IP: ${req.ip}`);

    next();
  } catch (error) {
    console.error(`[AUTH] Authentication error: ${error.message} from IP: ${req.ip}`);

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  }
};

// Admin authentication middleware
const adminMiddleware = async (req, res, next) => {
  try {
    // First authenticate the user
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
    });

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    // Log admin access
    console.log(`[ADMIN] Admin ${req.user.email} accessed admin endpoint: ${req.path} from IP: ${req.ip}`);

    next();
  } catch (error) {
    console.error(`[ADMIN] Admin authentication error: ${error.message} from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Admin access denied',
      code: 'ADMIN_ACCESS_DENIED'
    });
  }
};

// Super admin middleware
const superAdminMiddleware = async (req, res, next) => {
  try {
    // First authenticate as admin
    await adminMiddleware(req, res, (err) => {
      if (err) return next(err);
    });

    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Super admin access required',
        code: 'SUPER_ADMIN_ACCESS_REQUIRED'
      });
    }

    // Log super admin access
    console.log(`[SUPER_ADMIN] Super admin ${req.user.email} accessed super admin endpoint: ${req.path} from IP: ${req.ip}`);

    next();
  } catch (error) {
    console.error(`[SUPER_ADMIN] Super admin authentication error: ${error.message} from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Super admin access denied',
      code: 'SUPER_ADMIN_ACCESS_DENIED'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return next(); // Continue without authentication
    }

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isActive && !user.isBlocked) {
      req.user = user;
      req.token = token;
      req.tokenData = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

// Token refresh middleware
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Check if it's actually a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive || user.isBlocked) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
        code: 'USER_INVALID'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken(user._id);

    req.user = user;
    req.newTokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

    next();
  } catch (error) {
    console.error(`[REFRESH] Token refresh error: ${error.message} from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      code: 'REFRESH_FAILED'
    });
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This will be applied by the rate limiting middleware
  next();
};

// Logout middleware (for token blacklisting if needed)
const logoutMiddleware = async (req, res, next) => {
  try {
    // Here you could implement token blacklisting
    // For now, we'll just log the logout
    if (req.user) {
      console.log(`[LOGOUT] User ${req.user.email} logged out from IP: ${req.ip}`);
    }

    // Clear user from request
    req.user = null;
    req.token = null;
    req.tokenData = null;

    next();
  } catch (error) {
    console.error(`[LOGOUT] Logout error: ${error.message}`);
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  optionalAuthMiddleware,
  refreshTokenMiddleware,
  authRateLimit,
  logoutMiddleware,
  generateToken,
  generateRefreshToken,
  verifyToken
};
