#!/usr/bin/env node

/**
 * Database Seeding Script for Kandukuru Supermarket
 * This script populates the database with initial data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');
const Admin = require('../models/adminModel');
const User = require('../models/User');

// Import seed data
const categories = require('./seedData/categories');
const products = require('./seedData/products');
const adminData = require('./seedData/admin');

// Configuration
const config = require('../config/dotenv');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log('✅ Connected to MongoDB', 'green');
  } catch (error) {
    log(`❌ MongoDB connection error: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Clear existing data
 */
async function clearDatabase() {
  try {
    log('🗑️  Clearing existing data...', 'yellow');

    await Product.deleteMany({});
    await Category.deleteMany({});
    await Admin.deleteMany({});

    log('✅ Database cleared', 'green');
  } catch (error) {
    log(`❌ Error clearing database: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Seed Categories
 */
async function seedCategories() {
  try {
    log('📂 Seeding categories...', 'blue');

    const createdCategories = [];

    // Create main categories first
    for (const categoryData of categories.filter(cat => !cat.parentCategory)) {
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      createdCategories.push(savedCategory);
      log(`  ✓ Created category: ${savedCategory.name}`, 'cyan');
    }

    // Create subcategories
    for (const categoryData of categories.filter(cat => cat.parentCategory)) {
      const parentCategory = createdCategories.find(cat => cat.name === categoryData.parentCategory);
      if (parentCategory) {
        categoryData.parentCategory = parentCategory._id;
        const category = new Category(categoryData);
        const savedCategory = await category.save();

        // Update parent category with subcategory reference
        parentCategory.subcategories.push(savedCategory._id);
        await parentCategory.save();

        createdCategories.push(savedCategory);
        log(`  ✓ Created subcategory: ${savedCategory.name}`, 'cyan');
      }
    }

    log(`✅ Created ${createdCategories.length} categories`, 'green');
    return createdCategories;
  } catch (error) {
    log(`❌ Error seeding categories: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Seed Products
 */
async function seedProducts(categories) {
  try {
    log('🛍️  Seeding products...', 'blue');

    const createdProducts = [];

    for (const productData of products) {
      // Find category by name
      const category = categories.find(cat => cat.name === productData.categoryName);
      if (!category) {
        log(`  ⚠️  Category not found for product: ${productData.name}`, 'yellow');
        continue;
      }

      // Replace category name with category ID
      const { categoryName, ...productInfo } = productData;
      productInfo.category = category._id;

      const product = new Product(productInfo);
      const savedProduct = await product.save();
      createdProducts.push(savedProduct);

      if (createdProducts.length % 10 === 0) {
        log(`  ✓ Created ${createdProducts.length} products...`, 'cyan');
      }
    }

    log(`✅ Created ${createdProducts.length} products`, 'green');
    return createdProducts;
  } catch (error) {
    log(`❌ Error seeding products: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Seed Admin Users
 */
async function seedAdmins() {
  try {
    log('👤 Seeding admin users...', 'blue');

    const createdAdmins = [];

    for (const adminInfo of adminData) {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminInfo.password, 10);
      adminInfo.password = hashedPassword;

      const admin = new Admin(adminInfo);
      const savedAdmin = await admin.save();
      createdAdmins.push(savedAdmin);

      log(`  ✓ Created admin: ${savedAdmin.username} (${savedAdmin.role})`, 'cyan');
    }

    log(`✅ Created ${createdAdmins.length} admin users`, 'green');
    return createdAdmins;
  } catch (error) {
    log(`❌ Error seeding admins: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Create database indexes
 */
async function createIndexes() {
  try {
    log('📊 Creating database indexes...', 'blue');

    // Product indexes
    await Product.createIndexes();

    // Category indexes
    await Category.createIndexes();

    // Admin indexes
    await Admin.createIndexes();

    log('✅ Database indexes created', 'green');
  } catch (error) {
    log(`❌ Error creating indexes: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Print summary
 */
function printSummary(categories, products, admins) {
  log('\n🎉 Database seeding completed successfully!', 'green');
  log('\n📊 Summary:', 'magenta');
  log(`  Categories: ${categories.length}`, 'cyan');
  log(`  Products: ${products.length}`, 'cyan');
  log(`  Admin Users: ${admins.length}`, 'cyan');

  log('\n🔐 Admin Credentials:', 'magenta');
  admins.forEach(admin => {
    log(`  Username: ${admin.username}`, 'cyan');
    log(`  Role: ${admin.role}`, 'cyan');
    log(`  Email: ${admin.email}`, 'cyan');
    log(`  ---`, 'cyan');
  });

  log('\n🌐 Next Steps:', 'magenta');
  log('  1. Start your backend server: npm start', 'cyan');
  log('  2. Access admin panel with the credentials above', 'cyan');
  log('  3. Test the frontend application', 'cyan');
  log('  4. Configure payment gateway', 'cyan');
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    log('🚀 Starting database seeding for Kandukuru Supermarket...', 'magenta');

    // Connect to database
    await connectDB();

    // Ask user if they want to clear existing data
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear') || args.includes('-c');

    if (shouldClear) {
      await clearDatabase();
    }

    // Seed data
    const categories = await seedCategories();
    const products = await seedProducts(categories);
    const admins = await seedAdmins();

    // Create indexes
    await createIndexes();

    // Print summary
    printSummary(categories, products, admins);

  } catch (error) {
    log(`💥 Seeding failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log('\n🔌 Database connection closed', 'yellow');
    process.exit(0);
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('\n📖 Kandukuru Supermarket Database Seeding Script', 'magenta');
  log('\nUsage:', 'cyan');
  log('  node seed.js [options]', 'cyan');
  log('\nOptions:', 'cyan');
  log('  --clear, -c    Clear existing data before seeding', 'cyan');
  log('  --help, -h     Show this help message', 'cyan');
  log('\nExamples:', 'cyan');
  log('  node seed.js              # Seed without clearing', 'cyan');
  log('  node seed.js --clear      # Clear and seed', 'cyan');
  process.exit(0);
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedCategories,
  seedProducts,
  seedAdmins
};
