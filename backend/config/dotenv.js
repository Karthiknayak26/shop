require('dotenv').config();

// Set default values if environment variables are not set
const config = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/kandukuru-supermarket',
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
