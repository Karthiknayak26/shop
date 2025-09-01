#!/usr/bin/env node

/**
 * Database Backup Script for Kandukuru Supermarket
 * Creates backups of the MongoDB database
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
 * Create backup directory if it doesn't exist
 */
function ensureBackupDirectory() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    log(`📁 Created backup directory: ${backupDir}`, 'cyan');
  }
  return backupDir;
}

/**
 * Backup a collection to JSON file
 */
async function backupCollection(collectionName, backupDir, timestamp) {
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    const filename = `${collectionName}_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(documents, null, 2));

    log(`  ✓ Backed up ${documents.length} documents from ${collectionName}`, 'cyan');
    return { collection: collectionName, count: documents.length, file: filename };
  } catch (error) {
    log(`  ❌ Failed to backup ${collectionName}: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Create database backup
 */
async function createBackup() {
  try {
    log('🗄️  Starting database backup...', 'blue');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupDir = ensureBackupDirectory();

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    log(`📊 Found ${collectionNames.length} collections to backup`, 'cyan');

    const backupResults = [];

    // Backup each collection
    for (const collectionName of collectionNames) {
      const result = await backupCollection(collectionName, backupDir, timestamp);
      backupResults.push(result);
    }

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      database: 'kandukuru-supermarket',
      totalCollections: backupResults.length,
      totalDocuments: backupResults.reduce((sum, result) => sum + result.count, 0),
      collections: backupResults,
      environment: config.NODE_ENV,
      backupVersion: '1.0.0'
    };

    const metadataFilename = `backup_metadata_${timestamp}.json`;
    const metadataFilepath = path.join(backupDir, metadataFilename);
    fs.writeFileSync(metadataFilepath, JSON.stringify(metadata, null, 2));

    log('\n🎉 Backup completed successfully!', 'green');
    log(`📊 Backup Summary:`, 'magenta');
    log(`  Collections: ${metadata.totalCollections}`, 'cyan');
    log(`  Total Documents: ${metadata.totalDocuments}`, 'cyan');
    log(`  Backup Directory: ${backupDir}`, 'cyan');
    log(`  Metadata File: ${metadataFilename}`, 'cyan');

    // Show collection details
    log(`\n📋 Collection Details:`, 'magenta');
    backupResults.forEach(result => {
      log(`  ${result.collection}: ${result.count} documents → ${result.file}`, 'cyan');
    });

    return metadata;

  } catch (error) {
    log(`❌ Backup failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Restore database from backup
 */
async function restoreBackup(backupTimestamp) {
  try {
    log(`🔄 Starting database restore from backup: ${backupTimestamp}`, 'blue');

    const backupDir = path.join(__dirname, '..', 'backups');
    const metadataFile = `backup_metadata_${backupTimestamp}.json`;
    const metadataPath = path.join(backupDir, metadataFile);

    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Backup metadata file not found: ${metadataFile}`);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    log(`📊 Restoring backup from ${metadata.timestamp}`, 'cyan');
    log(`  Collections: ${metadata.totalCollections}`, 'cyan');
    log(`  Total Documents: ${metadata.totalDocuments}`, 'cyan');

    // Ask for confirmation in production
    if (config.isProduction()) {
      log('⚠️  WARNING: You are about to restore the database in PRODUCTION!', 'red');
      log('⚠️  This will overwrite existing data!', 'red');
      // In a real scenario, you'd want to add confirmation prompt here
    }

    let restoredCollections = 0;
    let restoredDocuments = 0;

    // Restore each collection
    for (const collectionInfo of metadata.collections) {
      const collectionFile = path.join(backupDir, collectionInfo.file);

      if (!fs.existsSync(collectionFile)) {
        log(`  ⚠️  Collection file not found: ${collectionInfo.file}`, 'yellow');
        continue;
      }

      const documents = JSON.parse(fs.readFileSync(collectionFile, 'utf8'));
      const collection = mongoose.connection.db.collection(collectionInfo.collection);

      // Clear existing collection
      await collection.deleteMany({});

      // Insert backup documents
      if (documents.length > 0) {
        await collection.insertMany(documents);
      }

      log(`  ✓ Restored ${documents.length} documents to ${collectionInfo.collection}`, 'cyan');
      restoredCollections++;
      restoredDocuments += documents.length;
    }

    log('\n🎉 Database restore completed successfully!', 'green');
    log(`📊 Restore Summary:`, 'magenta');
    log(`  Collections Restored: ${restoredCollections}`, 'cyan');
    log(`  Documents Restored: ${restoredDocuments}`, 'cyan');

    return { restoredCollections, restoredDocuments };

  } catch (error) {
    log(`❌ Restore failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * List available backups
 */
function listBackups() {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');

    if (!fs.existsSync(backupDir)) {
      log('📁 No backup directory found', 'yellow');
      return [];
    }

    const files = fs.readdirSync(backupDir);
    const metadataFiles = files.filter(file => file.startsWith('backup_metadata_'));

    if (metadataFiles.length === 0) {
      log('📁 No backup files found', 'yellow');
      return [];
    }

    log('📋 Available Backups:', 'magenta');

    const backups = metadataFiles.map(file => {
      const metadataPath = path.join(backupDir, file);
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      const timestamp = file.replace('backup_metadata_', '').replace('.json', '');

      log(`  ${timestamp}`, 'cyan');
      log(`    Date: ${new Date(metadata.timestamp).toLocaleString()}`, 'cyan');
      log(`    Collections: ${metadata.totalCollections}`, 'cyan');
      log(`    Documents: ${metadata.totalDocuments}`, 'cyan');
      log(`    Environment: ${metadata.environment}`, 'cyan');
      log('', 'cyan');

      return { timestamp, metadata };
    });

    return backups;

  } catch (error) {
    log(`❌ Failed to list backups: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Clean old backups (keep only last N backups)
 */
function cleanOldBackups(keepCount = 5) {
  try {
    log(`🧹 Cleaning old backups (keeping last ${keepCount})...`, 'blue');

    const backupDir = path.join(__dirname, '..', 'backups');

    if (!fs.existsSync(backupDir)) {
      log('📁 No backup directory found', 'yellow');
      return;
    }

    const files = fs.readdirSync(backupDir);
    const metadataFiles = files
      .filter(file => file.startsWith('backup_metadata_'))
      .sort()
      .reverse(); // Most recent first

    if (metadataFiles.length <= keepCount) {
      log(`✅ Only ${metadataFiles.length} backups found, no cleanup needed`, 'green');
      return;
    }

    const filesToDelete = metadataFiles.slice(keepCount);
    let deletedCount = 0;

    for (const metadataFile of filesToDelete) {
      const timestamp = metadataFile.replace('backup_metadata_', '').replace('.json', '');

      // Delete metadata file
      fs.unlinkSync(path.join(backupDir, metadataFile));

      // Delete collection backup files
      const collectionFiles = files.filter(file =>
        file.includes(timestamp) && file !== metadataFile
      );

      for (const collectionFile of collectionFiles) {
        fs.unlinkSync(path.join(backupDir, collectionFile));
      }

      log(`  🗑️  Deleted backup: ${timestamp}`, 'cyan');
      deletedCount++;
    }

    log(`✅ Cleaned ${deletedCount} old backups`, 'green');

  } catch (error) {
    log(`❌ Failed to clean old backups: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await connectDB();

    switch (command) {
      case 'create':
      case 'backup':
        await createBackup();
        break;

      case 'restore':
        const backupTimestamp = args[1];
        if (!backupTimestamp) {
          log('❌ Please provide backup timestamp for restore', 'red');
          log('Usage: node backup.js restore <timestamp>', 'cyan');
          process.exit(1);
        }
        await restoreBackup(backupTimestamp);
        break;

      case 'list':
        listBackups();
        break;

      case 'clean':
        const keepCount = parseInt(args[1]) || 5;
        cleanOldBackups(keepCount);
        break;

      default:
        log('📖 Kandukuru Supermarket Database Backup Script', 'magenta');
        log('\nUsage:', 'cyan');
        log('  node backup.js <command> [options]', 'cyan');
        log('\nCommands:', 'cyan');
        log('  create, backup     Create a new backup', 'cyan');
        log('  restore <timestamp> Restore from backup', 'cyan');
        log('  list              List available backups', 'cyan');
        log('  clean [count]     Clean old backups (default: keep 5)', 'cyan');
        log('\nExamples:', 'cyan');
        log('  node backup.js create', 'cyan');
        log('  node backup.js list', 'cyan');
        log('  node backup.js restore 2024-01-15T10-30-00', 'cyan');
        log('  node backup.js clean 3', 'cyan');
        break;
    }

  } catch (error) {
    log(`💥 Process failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('\n🔌 Database connection closed', 'yellow');
    }
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  cleanOldBackups
};
