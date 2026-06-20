const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    id: {
      type: String,
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    img: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online', 'UPI', 'cod', 'creditCard', 'debitCard', 'upi'],
    required: true
  },
  paymentInfo: {
    upiId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  totalAmount: { type: Number, required: true, min: 0 },
  orderDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  orderId: { type: String, unique: true, required: true },
  outForDeliveryDate: { type: Date },
  expectedDelivery: { type: Date }
});

// Indexes for query performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

