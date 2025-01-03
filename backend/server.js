const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const locationRoutes = require('./routes/locationRoutes'); // Location routes
const productRoutes = require('./routes/productRoutes'); // Product routes
const registerRoutes = require('./routes/userRoutes'); // Register routes
require('dotenv').config(); // Load environment variables

const app = express();

// Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse incoming requests as JSON
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Database connection error:', error));

// Use routes
app.use('/api/locations', locationRoutes); // Location-related endpoints
app.use('/api/products', productRoutes); // Product-related endpoints
app.use('/api/auth', registerRoutes); // Authentication endpoints (e.g., registration)

// Default Route (Optional, for testing the server is running)
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
