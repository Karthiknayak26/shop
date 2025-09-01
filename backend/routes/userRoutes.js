const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Return created user data
    const userData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userData
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Server error during registration',
      error: err.message
    });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email exists' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordReset(user, resetToken);
      res.json({ message: 'Password reset email sent' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Send confirmation email
    try {
      await emailService.sendNotification(
        user,
        'Password Changed Successfully',
        'Your password has been changed successfully. If you did not make this change, please contact us immediately.'
      );
    } catch (emailError) {
      console.error('Failed to send password change confirmation email:', emailError);
      // Continue with the response even if email fails
    }

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    res.json({ message: 'Login successful', user: userData });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile (name/email)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Find user by email from session or token (for demo, get from body or hardcode)
    // In production, use authentication middleware to get user from req.user
    const userId = req.body.userId; // You may want to get this from session/token
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    // Send notification email
    try {
      await emailService.sendNotification(
        user,
        'Password Changed Successfully',
        'Your password has been changed successfully. If you did not make this change, please contact us immediately.'
      );
    } catch (emailError) {
      console.error('Failed to send password change notification email:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user shipping address
router.get('/:id/shipping-address', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      shippingAddress: user.shippingAddress || {}
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user shipping address
router.put('/:id/shipping-address', async (req, res) => {
  const { id } = req.params;
  const { shippingAddress } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { shippingAddress },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Shipping address updated successfully',
      shippingAddress: updatedUser.shippingAddress
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;