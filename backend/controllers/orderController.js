const Order = require('../models/Order');

// Get all orders for a specific user
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};

// Set order as Out for Delivery and set expectedDelivery date
exports.setOutForDelivery = async (req, res) => {
  try {
    const orderId = req.params.id;
    // Set expected delivery to 3 days from now
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 3);
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'Out for Delivery',
        outForDeliveryDate: new Date(),
        expectedDelivery
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
