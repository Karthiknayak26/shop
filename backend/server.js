const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const locationRoutes = require('./routes/locationRoutes');
const authRoutes = require('./routes/userRoutes');
const OrderRoutes = require('./routes/order'); // ⬅️ Added
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database connected successfully'))
  .catch((error) => console.error('❌ Database connection error:', error));

// API Routes
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', OrderRoutes); // ⬅️ Added
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start Server
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
