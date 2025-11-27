const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const locationRoutes = require('./routes/locationRoutes');
const authRoutes = require('./routes/userRoutes');
const OrderRoutes = require('./routes/Order'); // ⬅️ Added
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes'); // Added productRoutes
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(hpp()); // Prevent http param pollution

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter); // Apply to all API routes

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Database connected successfully'))
  .catch((error) => console.error('❌ Database connection error:', error));

// API Routes
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', OrderRoutes); // ⬅️ Added
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes); // Added productRoutes

app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/', (req, res) => {
  res.send('Server is running');
});

// Start Server
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

console.log(process.env.MONGODB_URI)
