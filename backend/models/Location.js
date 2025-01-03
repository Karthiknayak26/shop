const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., city name
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'location' }); // Explicitly set collection name

module.exports = mongoose.model('Location', LocationSchema);
