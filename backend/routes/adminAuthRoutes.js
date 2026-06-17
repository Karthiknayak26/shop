const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel');
const { generateToken, generateRefreshToken, authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================
// ADMIN LOGIN — Server-side JWT auth
// ============================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid input format.' });
  }

  try {
    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase().trim() },
        { email: username.toLowerCase().trim() },
      ],
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked. Try again later.' });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is deactivated.' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      await admin.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    await admin.resetLoginAttempts();

    // Generate tokens with admin role
    const token = generateToken({
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    });
    const refreshToken = generateRefreshToken(admin._id);

    logger.info('Admin logged in', { adminId: admin._id, username: admin.username });

    res.json({
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    logger.error('Admin login error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// ADMIN LOGOUT
// ============================================
router.post('/logout', (req, res) => {
  logger.info('Admin logged out');
  res.json({ message: 'Admin logged out successfully' });
});

// ============================================
// VERIFY ADMIN TOKEN — validate token is still valid
// ============================================
router.get('/verify', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    valid: true,
    admin: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
