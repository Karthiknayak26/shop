const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Product name
  price: { type: Number, required: true }, // Product price
  description: { type: String, required: true }, // Product description
  category: { type: String, required: true }, // Product category
  stock: { type: Number, required: true }, // Available stock
  imageUrl: { type: String }, // Image URL
  createdAt: { type: Date, default: Date.now }, // Auto-generated timestamp
}, { collection: 'products' }); // Explicitly set collection name

module.exports = mongoose.model('Product', ProductSchema);
