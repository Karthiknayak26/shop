const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { generateToken, generateRefreshToken, authMiddleware, refreshTokenMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================
// PASSWORD STRENGTH VALIDATION
// ============================================
const validatePasswordStrength = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  return errors;
};

// ============================================
// REGISTRATION
// ============================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Password strength validation
  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ message: 'Password does not meet requirements', errors: passwordErrors });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer',
    });

    await newUser.save();

    // Generate tokens
    const token = generateToken({ userId: newUser._id, email: newUser.email, role: newUser.role });
    const refreshToken = generateRefreshToken(newUser._id);

    logger.info('User registered', { userId: newUser._id, email: newUser.email });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      token,
      refreshToken,
    });
  } catch (err) {
    logger.error('Registration error', { error: err.message });
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ============================================
// LOGIN — Returns JWT
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid input format.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked. Please try again later.' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact support.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked. Contact support.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    await user.resetLoginAttempts();

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user._id);

    logger.info('User logged in', { userId: user._id });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
      refreshToken,
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// TOKEN REFRESH
// ============================================
router.post('/refresh-token', refreshTokenMiddleware, (req, res) => {
  res.json({
    message: 'Token refreshed successfully',
    token: req.newTokens.accessToken,
    refreshToken: req.newTokens.refreshToken,
  });
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', authMiddleware, (req, res) => {
  logger.info('User logged out', { userId: req.user._id });
  res.json({ message: 'Logged out successfully' });
});

// ============================================
// GET CURRENT USER (Protected)
// ============================================
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      shippingAddress: req.user.shippingAddress,
    },
  });
});

// ============================================
// FORGOT PASSWORD
// ============================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent.' });
    }

    // Generate reset token and hash it before storage
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await emailService.sendPasswordReset(user, resetToken); // Send unhashed token in email
    } catch (emailError) {
      logger.error('Failed to send password reset email', { error: emailError.message });
    }

    res.json({ message: 'If an account exists, a reset email has been sent.' });
  } catch (err) {
    logger.error('Forgot password error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Validate new password strength
  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ message: 'Password does not meet requirements', errors: passwordErrors });
  }

  try {
    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    try {
      await emailService.sendNotification(
        user,
        'Password Changed Successfully',
        'Your password has been changed. If you did not make this change, contact support immediately.'
      );
    } catch (emailError) {
      logger.error('Failed to send password change email', { error: emailError.message });
    }

    logger.info('Password reset successful', { userId: user._id });
    res.json({ message: 'Password has been reset' });
  } catch (err) {
    logger.error('Reset password error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// UPDATE PROFILE (Protected — own profile only)
// ============================================
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // From auth middleware — can only update OWN profile
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
    });
  } catch (err) {
    logger.error('Profile update error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// CHANGE PASSWORD (Protected — from auth token, not body)
// ============================================
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate new password strength
  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ message: 'Password does not meet requirements', errors: passwordErrors });
  }

  try {
    const user = await User.findById(req.user._id); // From auth middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    try {
      await emailService.sendNotification(
        user,
        'Password Changed Successfully',
        'Your password has been changed. If you did not make this change, contact support immediately.'
      );
    } catch (emailError) {
      logger.error('Failed to send password change notification', { error: emailError.message });
    }

    logger.info('Password changed', { userId: user._id });
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    logger.error('Change password error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GET SHIPPING ADDRESS (Protected — own only)
// ============================================
router.get('/shipping-address', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ shippingAddress: user.shippingAddress || {} });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// UPDATE SHIPPING ADDRESS (Protected — own only)
// ============================================
router.put('/shipping-address', authMiddleware, async (req, res) => {
  const { shippingAddress } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { shippingAddress },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Shipping address updated successfully',
      shippingAddress: updatedUser.shippingAddress,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;