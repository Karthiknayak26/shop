const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

// Sync local cart with server (for guest users who just logged in)
router.post('/sync', syncCart);

module.exports = router; 