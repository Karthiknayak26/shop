const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const orderController = require('../controllers/orderController');
const mongoose = require('mongoose');
const emailService = require('../services/emailService');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// ============================================
// CREATE ORDER (Authenticated)
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Whitelist fields — prevent mass assignment
    const { items, shippingAddress, paymentMethod, paymentInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Server-side total calculation — never trust client total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.id}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      validatedItems.push({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        img: product.imageUrl,
      });
      totalAmount += product.price * item.quantity;
    }

    // Deduct stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Generate user-friendly orderId
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newOrder = new Order({
      items: validatedItems,
      user: req.user._id, // From auth middleware — never from request body
      shippingAddress,
      paymentMethod,
      paymentInfo: {
        upiId: paymentInfo?.upiId,
        razorpayOrderId: paymentInfo?.razorpayOrderId,
        razorpayPaymentId: paymentInfo?.razorpayPaymentId,
        paymentStatus: paymentInfo?.paymentStatus || 'pending',
      },
      totalAmount,
      orderId: `ORD${dateStr}-${randomNum}`,
      status: 'Pending',
    });

    await newOrder.save();

    // Send confirmation email asynchronously
    setImmediate(() => {
      emailService.sendOrderConfirmation(newOrder)
        .then(() => logger.info('Order confirmation email sent', { orderId: newOrder.orderId }))
        .catch(emailError => logger.error('Failed to send order email', { orderId: newOrder.orderId, error: emailError.message }));
    });

    logger.info('Order created', { orderId: newOrder.orderId, userId: req.user._id });
    res.status(201).json({ message: 'Order saved successfully', order: newOrder });
  } catch (err) {
    logger.error('Order creation error', { error: err.message });
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// ============================================
// GET ALL ORDERS (Admin only)
// ============================================
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments();

    res.json({
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ============================================
// GET USER'S OWN ORDERS (Authenticated)
// ============================================
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ orderDate: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for a specific user (admin or own orders)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  // Allow admin to fetch any user's orders, or user to fetch own orders only
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user._id.toString() !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  return orderController.getOrdersByUser(req, res);
});

// ============================================
// CANCEL ORDER (Authenticated — own order only)
// ============================================
router.put('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only owner or admin can cancel
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel pending orders
    if (order.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'Cancelled';
    await order.save();

    logger.info('Order cancelled', { orderId, userId: req.user._id });
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    logger.error('Cancel order error', { error: err.message });
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// ============================================
// UPDATE ORDER STATUS (Admin only)
// ============================================
router.put('/:id/out-for-delivery', authMiddleware, adminMiddleware, orderController.setOutForDelivery);

router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    logger.info('Order status updated', { orderId: order.orderId, status, adminId: req.user._id });
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ============================================
// TRACK ORDER (Public — by custom orderId)
// ============================================
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).select('orderId status orderDate outForDeliveryDate expectedDelivery').lean();
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
