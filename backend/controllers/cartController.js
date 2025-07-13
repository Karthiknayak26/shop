const Cart = require('../models/cartModel');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.getOrCreateCart(userId);

    // Populate product details
    await cart.populate('items.productId');

    res.json({
      success: true,
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const cart = await Cart.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.imageUrl || '',
        category: product.category || ''
      });
    }

    await cart.save();
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.getOrCreateCart(userId);

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.getOrCreateCart(userId);

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.getOrCreateCart(userId);

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Sync local cart with server (for guest users who just logged in)
const syncCart = async (req, res) => {
  try {
    const { localCartItems } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(localCartItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart items format'
      });
    }

    const cart = await Cart.getOrCreateCart(userId);

    // Merge local cart items with server cart
    for (const localItem of localCartItems) {
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === localItem.productId
      );

      if (existingItemIndex > -1) {
        // Add quantities if item exists
        cart.items[existingItemIndex].quantity += localItem.quantity;
      } else {
        // Add new item
        cart.items.push({
          productId: localItem.productId,
          quantity: localItem.quantity,
          price: localItem.price,
          name: localItem.name,
          image: localItem.imageUrl || '',
          category: localItem.category || ''
        });
      }
    }

    await cart.save();
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Cart synced successfully',
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
}; 