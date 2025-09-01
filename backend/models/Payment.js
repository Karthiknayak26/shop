const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: { type: String, required: true, unique: true }, // Razorpay payment ID
  orderId: { type: String, required: true, unique: true }, // Razorpay order ID
  receipt: { type: String, required: true },

  // Amount and currency
  amount: { type: Number, required: true, min: 0 }, // Amount in paise
  currency: { type: String, default: 'INR' },
  amountInRupees: { type: Number, required: true, min: 0 }, // Amount in rupees

  // Payment method details
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'cod'],
    required: true
  },
  bank: { type: String }, // Bank name for UPI/Netbanking
  cardNetwork: { type: String }, // Visa, Mastercard, etc.
  upiId: { type: String }, // UPI ID if UPI payment

  // Payment status and flow
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'],
    default: 'created'
  },
  captureStatus: { type: String, default: 'pending' },

  // Customer details
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },

  // Order reference
  orderReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  // Razorpay specific fields
  razorpayPaymentId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String, required: true },
  razorpaySignature: { type: String },

  // Timestamps
  paymentDate: { type: Date, default: Date.now },
  captureDate: { type: Date },
  refundDate: { type: Date },

  // Error and failure details
  errorCode: { type: String },
  errorDescription: { type: String },
  failureReason: { type: String },

  // Refund information
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String },
  refundStatus: { type: String, enum: ['none', 'partial', 'full'], default: 'none' },

  // Additional metadata
  notes: { type: String },
  metadata: { type: Map, of: String },

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },

  // Audit trail
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes for better query performance
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentDate: 1 });
PaymentSchema.index({ method: 1 });

// Virtual for payment status display
PaymentSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    'created': 'Payment Initiated',
    'authorized': 'Payment Authorized',
    'captured': 'Payment Successful',
    'failed': 'Payment Failed',
    'refunded': 'Payment Refunded',
    'cancelled': 'Payment Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for amount in rupees
PaymentSchema.virtual('amountRupees').get(function () {
  return this.amount / 100;
});

// Pre-save middleware to update amount in rupees
PaymentSchema.pre('save', function (next) {
  if (this.isModified('amount')) {
    this.amountInRupees = this.amount / 100;
  }
  this.updatedAt = new Date();
  next();
});

// Static method to find payments by status
PaymentSchema.statics.findByStatus = function (status) {
  return this.find({ status: status });
};

// Static method to find payments by date range
PaymentSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    paymentDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Instance method to mark payment as captured
PaymentSchema.methods.markAsCaptured = function () {
  this.status = 'captured';
  this.captureStatus = 'captured';
  this.captureDate = new Date();
  this.isVerified = true;
  this.verificationDate = new Date();
  return this.save();
};

// Instance method to process refund
PaymentSchema.methods.processRefund = function (amount, reason) {
  this.refundAmount = amount;
  this.refundReason = reason;
  this.refundDate = new Date();

  if (amount >= this.amountInRupees) {
    this.refundStatus = 'full';
    this.status = 'refunded';
  } else {
    this.refundStatus = 'partial';
  }

  return this.save();
};

module.exports = mongoose.model('Payment', PaymentSchema);
