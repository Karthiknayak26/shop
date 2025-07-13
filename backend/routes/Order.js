const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const orderController = require('../controllers/orderController');
const mongoose = require('mongoose'); // Add this at the top for ObjectId validation

router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    // Add default status if not present
    const ordersWithStatus = orders.map(order => ({
      ...order._doc,
      status: order.status || 'Pending'
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

module.exports = router;
