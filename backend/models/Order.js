const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    img: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingAddress: {
    name: String,
    email: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String
  },
  paymentMethod: String,
  paymentInfo: {
    cardNumber: String,
    cardHolderName: String,
    cardType: String,
    upiId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: { type: String, default: 'pending' }
  },
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  orderId: { type: String, unique: true },
  outForDeliveryDate: { type: Date },
  expectedDelivery: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
