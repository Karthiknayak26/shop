const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const orderController = require('../controllers/orderController');
const mongoose = require('mongoose'); // Add this at the top for ObjectId validation
const { setOutForDelivery } = require('../controllers/orderController');
const emailService = require('../services/emailService');

router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    // Generate a user-friendly orderId
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g., 20240714
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    newOrder.orderId = `ORD${dateStr}-${randomNum}`;
    await newOrder.save();

    // Send order confirmation email asynchronously (non-blocking)
    // Don't await - let it run in the background
    emailService.sendOrderConfirmation(newOrder)
      .then(() => console.log('Order confirmation email sent successfully'))
      .catch(emailError => console.error('Failed to send order confirmation email:', emailError));

    // Respond immediately without waiting for email
    res.status(201).json({ message: 'Order saved successfully', order: newOrder });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    // Add default status and ensure orderId is present
    const ordersWithStatus = orders.map(order => ({
      ...order._doc,
      status: order.status || 'Pending',
      orderId: order.orderId || `ORD${order._id.toString().substring(0, 8).toUpperCase()}`
    }));
    res.json(ordersWithStatus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders for a specific user
router.get('/user/:userId', orderController.getOrdersByUser);

// Cancel an order by ID
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Cancel request for orderId:', orderId);
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log('Invalid ObjectId for cancel:', orderId);
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });
    if (!order) {
      console.log('Order not found for cancel:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Set order as Out for Delivery and set expected delivery date
router.put('/:id/out-for-delivery', setOutForDelivery);

// Track order by custom orderId
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
