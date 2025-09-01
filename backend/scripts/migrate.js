#!/usr/bin/env node

/**
 * Database Migration Script for Kandukuru Supermarket
 * Handles database schema updates and data migrations
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure schemas are registered
require('../models/Product');
require('../models/Category');
require('../models/adminModel');
require('../models/User');
require('../models/Order');

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
 * Migration 1: Create indexes for better performance
 */
async function migration001_CreateIndexes() {
  try {
    log('📊 Running Migration 001: Creating database indexes...', 'blue');

    const Product = mongoose.model('Product');
    const Category = mongoose.model('Category');
    const Admin = mongoose.model('Admin');
    const User = mongoose.model('User');
    const Order = mongoose.model('Order');

    // Create indexes for all models
    await Product.createIndexes();
    await Category.createIndexes();
    await Admin.createIndexes();
    await User.createIndexes();
    await Order.createIndexes();

    log('✅ Migration 001 completed: Database indexes created', 'green');
  } catch (error) {
    log(`❌ Migration 001 failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Migration 2: Add missing fields to existing products
 */
async function migration002_UpdateProductSchema() {
  try {
    log('📦 Running Migration 002: Updating product schema...', 'blue');

    const Product = mongoose.model('Product');

    // Find products without the new fields and update them
    const productsToUpdate = await Product.find({
      $or: [
        { unit: { $exists: false } },
        { unitSize: { $exists: false } },
        { isActive: { $exists: false } },
        { ratings: { $exists: false } }
      ]
    });

    for (const product of productsToUpdate) {
      const updates = {};

      if (!product.unit) updates.unit = 'piece';
      if (!product.unitSize) updates.unitSize = '1';
      if (product.isActive === undefined) updates.isActive = true;
      if (!product.ratings) {
        updates.ratings = { average: 0, count: 0 };
      }
      if (!product.minStock) updates.minStock = 5;
      if (!product.maxStock) updates.maxStock = 1000;
      if (!product.tags) updates.tags = [];
      if (!product.images) updates.images = [];

      await Product.findByIdAndUpdate(product._id, updates);
    }

    log(`✅ Migration 002 completed: Updated ${productsToUpdate.length} products`, 'green');
  } catch (error) {
    log(`❌ Migration 002 failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Migration 3: Update category references in products
 */
async function migration003_UpdateCategoryReferences() {
  try {
    log('🔗 Running Migration 003: Updating category references...', 'blue');

    const Product = mongoose.model('Product');
    const Category = mongoose.model('Category');

    // Find products with string category references
    const productsWithStringCategories = await Product.find({
      category: { $type: 'string' }
    });

    let updatedCount = 0;

    for (const product of productsWithStringCategories) {
      // Find category by name
      const category = await Category.findOne({ name: product.category });

      if (category) {
        await Product.findByIdAndUpdate(product._id, {
          category: category._id
        });
        updatedCount++;
      } else {
        log(`⚠️  Category not found for product: ${product.name} (${product.category})`, 'yellow');
      }
    }

    log(`✅ Migration 003 completed: Updated ${updatedCount} product category references`, 'green');
  } catch (error) {
    log(`❌ Migration 003 failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Migration 4: Add SEO fields to categories and products
 */
async function migration004_AddSEOFields() {
  try {
    log('🔍 Running Migration 004: Adding SEO fields...', 'blue');

    const Product = mongoose.model('Product');
    const Category = mongoose.model('Category');

    // Update categories without SEO fields
    const categoriesWithoutSEO = await Category.find({
      $or: [
        { seoTitle: { $exists: false } },
        { seoDescription: { $exists: false } }
      ]
    });

    for (const category of categoriesWithoutSEO) {
      const updates = {};

      if (!category.seoTitle) {
        updates.seoTitle = category.name;
      }
      if (!category.seoDescription) {
        updates.seoDescription = category.description || `Shop ${category.name} at Kandukuru Supermarket`;
      }

      await Category.findByIdAndUpdate(category._id, updates);
    }

    // Update products without SEO fields
    const productsWithoutSEO = await Product.find({
      $or: [
        { seoTitle: { $exists: false } },
        { seoDescription: { $exists: false } }
      ]
    });

    for (const product of productsWithoutSEO) {
      const updates = {};

      if (!product.seoTitle) {
        updates.seoTitle = product.name;
      }
      if (!product.seoDescription) {
        updates.seoDescription = product.description.substring(0, 160);
      }

      await Product.findByIdAndUpdate(product._id, updates);
    }

    log(`✅ Migration 004 completed: Added SEO fields to ${categoriesWithoutSEO.length} categories and ${productsWithoutSEO.length} products`, 'green');
  } catch (error) {
    log(`❌ Migration 004 failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Migration 5: Generate slugs for categories
 */
async function migration005_GenerateCategorySlugs() {
  try {
    log('🔗 Running Migration 005: Generating category slugs...', 'blue');

    const Category = mongoose.model('Category');

    const categoriesWithoutSlugs = await Category.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    for (const category of categoriesWithoutSlugs) {
      const slug = category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await Category.findByIdAndUpdate(category._id, { slug });
    }

    log(`✅ Migration 005 completed: Generated slugs for ${categoriesWithoutSlugs.length} categories`, 'green');
  } catch (error) {
    log(`❌ Migration 005 failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Get migration version from database
 */
async function getMigrationVersion() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('migrations');
    const migration = await collection.findOne({ _id: 'version' });
    return migration ? migration.version : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Set migration version in database
 */
async function setMigrationVersion(version) {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('migrations');
    await collection.replaceOne(
      { _id: 'version' },
      { _id: 'version', version, updatedAt: new Date() },
      { upsert: true }
    );
  } catch (error) {
    log(`❌ Failed to update migration version: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  try {
    log('🚀 Starting database migrations for Kandukuru Supermarket...', 'magenta');

    const currentVersion = await getMigrationVersion();
    log(`📍 Current migration version: ${currentVersion}`, 'cyan');

    const migrations = [
      { version: 1, name: 'Create Indexes', fn: migration001_CreateIndexes },
      { version: 2, name: 'Update Product Schema', fn: migration002_UpdateProductSchema },
      { version: 3, name: 'Update Category References', fn: migration003_UpdateCategoryReferences },
      { version: 4, name: 'Add SEO Fields', fn: migration004_AddSEOFields },
      { version: 5, name: 'Generate Category Slugs', fn: migration005_GenerateCategorySlugs }
    ];

    let ranMigrations = 0;

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        await migration.fn();
        await setMigrationVersion(migration.version);
        ranMigrations++;
      } else {
        log(`⏭️  Skipping migration ${migration.version}: ${migration.name} (already applied)`, 'yellow');
      }
    }

    if (ranMigrations > 0) {
      log(`\n🎉 Migration completed successfully! Ran ${ranMigrations} migrations.`, 'green');
    } else {
      log('\n✅ All migrations are up to date!', 'green');
    }

  } catch (error) {
    log(`💥 Migration failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await connectDB();
    await runMigrations();
  } catch (error) {
    log(`💥 Process failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('\n🔌 Database connection closed', 'yellow');
    process.exit(0);
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('\n📖 Kandukuru Supermarket Database Migration Script', 'magenta');
  log('\nUsage:', 'cyan');
  log('  node migrate.js [options]', 'cyan');
  log('\nOptions:', 'cyan');
  log('  --help, -h     Show this help message', 'cyan');
  log('\nDescription:', 'cyan');
  log('  This script runs database migrations to update the schema', 'cyan');
  log('  and ensure data consistency.', 'cyan');
  process.exit(0);
}

// Run migrations
if (require.main === module) {
  main();
}

module.exports = {
  runMigrations,
  getMigrationVersion,
  setMigrationVersion
};
