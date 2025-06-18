const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    img: String
  }],
  shippingAddress: {
    name: String,
    email: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String
  },
  paymentMethod: String,
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Order', orderSchema);
