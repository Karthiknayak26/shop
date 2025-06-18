const express = require('express');
const router = express.Router();
const Order = require('../models/order');

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



module.exports = router;
