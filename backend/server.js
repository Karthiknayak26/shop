const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const locationRoutes = require('./routes/locationRoutes');
require('dotenv').config();
const authRoutes = require('./routes/userRoutes'); // Load environment variables

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

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
