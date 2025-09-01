const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  to: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  template: { type: String },               // optional template identifier
  status: { type: String, enum: ['sent', 'failed'], required: true },
  messageId: { type: String },
  response: { type: String },
  error: { type: String },
}, {
  timestamps: true, // createdAt & updatedAt
});

module.exports = mongoose.model('EmailLog', emailLogSchema);