const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total price and item count before saving
cartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
  next();
});

// Static method to get or create cart for a user
cartSchema.statics.getOrCreateCart = async function (userId) {
  let cart = await this.findOne({ userId });
  if (!cart) {
    cart = new this({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
