const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  // Create an in-memory MongoDB instance
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`[TEST DB] In-memory MongoDB started at: ${uri}`);
  
  // Override database URI for server.js
  process.env.MONGODB_URI = uri;
  
  // Connect and Seed database before starting server
  await mongoose.connect(uri);
  console.log('[TEST DB] Connected, seeding initial data...');
  
  // Seed categories
  const Category = require('../models/Category');
  const categoriesData = require('./seedData/categories');
  const createdCategories = [];
  for (const catData of categoriesData.filter(cat => !cat.parentCategory)) {
    const category = new Category(catData);
    const saved = await category.save();
    createdCategories.push(saved);
  }
  for (const catData of categoriesData.filter(cat => cat.parentCategory)) {
    const parentCategory = createdCategories.find(cat => cat.name === catData.parentCategory);
    if (parentCategory) {
      catData.parentCategory = parentCategory._id;
      const category = new Category(catData);
      const saved = await category.save();
      parentCategory.subcategories.push(saved._id);
      await parentCategory.save();
      createdCategories.push(saved);
    }
  }
  console.log(`[TEST DB] Seeded ${createdCategories.length} categories.`);

  // Seed products
  const Product = require('../models/Product');
  const productsData = require('./seedData/products');
  let productsCount = 0;
  for (const prodData of productsData) {
    const category = createdCategories.find(cat => cat.name === prodData.categoryName);
    if (category) {
      const { categoryName, ...productInfo } = prodData;
      productInfo.category = category._id;
      const product = new Product(productInfo);
      await product.save();
      productsCount++;
    }
  }
  console.log(`[TEST DB] Seeded ${productsCount} products.`);

  // Seed admins
  const Admin = require('../models/adminModel');
  const adminData = require('./seedData/admin');
  for (const adminInfo of adminData) {
    const copy = { ...adminInfo };
    copy.password = await bcrypt.hash(copy.password, 10);
    const admin = new Admin(copy);
    await admin.save();
  }
  console.log(`[TEST DB] Seeded admin users.`);

  // Seed a default test customer user for API testing
  const User = require('../models/User');
  const hashedPassword = await bcrypt.hash('TestCustomer123!', 10);
  const testUser = new User({
    name: 'Test Customer',
    email: 'customer@example.com',
    password: hashedPassword,
    phone: '9876543210'
  });
  await testUser.save();
  console.log('[TEST DB] Seeded test customer user (customer@example.com / TestCustomer123!).');

  // Disconnect so that server.js can connect
  await mongoose.disconnect();
  
  // Start server
  console.log('[TEST SERVER] Starting Express server...');
  require('../server.js');
}

run().catch(err => {
  console.error('[TEST SERVER] Failed to start:', err);
  process.exit(1);
});
