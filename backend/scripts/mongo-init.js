// MongoDB Initialization Script for Kandukuru Supermarket
// This script runs when MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('kandukuru-supermarket');

// Create application user with read/write permissions
db.createUser({
  user: 'kandukuru_user',
  pwd: 'kandukuru_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'kandukuru-supermarket'
    }
  ]
});

// Create collections with validation rules
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price', 'description', 'category', 'stock', 'unit', 'unitSize'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Product name is required and must be a string'
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Price must be a positive number'
        },
        stock: {
          bsonType: 'number',
          minimum: 0,
          description: 'Stock must be a non-negative number'
        },
        isActive: {
          bsonType: 'bool',
          description: 'isActive must be a boolean'
        }
      }
    }
  }
});

db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Category name is required and must be a string'
        },
        slug: {
          bsonType: 'string',
          description: 'Slug must be a string'
        },
        isActive: {
          bsonType: 'bool',
          description: 'isActive must be a boolean'
        }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Name is required and must be a string'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          description: 'Password is required and must be a string'
        }
      }
    }
  }
});

db.createCollection('admin', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'fullName', 'role'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username is required and must be a string'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        role: {
          bsonType: 'string',
          enum: ['super_admin', 'admin', 'manager', 'staff'],
          description: 'Role must be one of the predefined values'
        }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['items', 'user', 'totalAmount', 'orderId'],
      properties: {
        totalAmount: {
          bsonType: 'number',
          minimum: 0,
          description: 'Total amount must be a positive number'
        },
        orderId: {
          bsonType: 'string',
          description: 'Order ID is required and must be a string'
        },
        status: {
          bsonType: 'string',
          enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
          description: 'Status must be one of the predefined values'
        }
      }
    }
  }
});

// Create indexes for better performance
// Product indexes
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' });
db.products.createIndex({ category: 1, isActive: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ stock: 1 });
db.products.createIndex({ 'ratings.average': -1 });
db.products.createIndex({ createdAt: -1 });
db.products.createIndex({ isFeatured: 1 });

// Category indexes
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parentCategory: 1 });
db.categories.createIndex({ isActive: 1 });

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Admin indexes
db.admin.createIndex({ email: 1 }, { unique: true });
db.admin.createIndex({ username: 1 }, { unique: true });
db.admin.createIndex({ role: 1, isActive: 1 });

// Order indexes
db.orders.createIndex({ orderId: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ orderDate: -1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ 'paymentInfo.paymentStatus': 1 });

// Cart indexes
db.carts.createIndex({ user: 1 });
db.carts.createIndex({ updatedAt: -1 });

// Feedback indexes
db.feedbacks.createIndex({ createdAt: -1 });
db.feedbacks.createIndex({ orderId: 1 });

print('✅ Kandukuru Supermarket database initialized successfully!');
print('📊 Collections created with validation rules');
print('🔍 Indexes created for optimal performance');
print('👤 Application user created with appropriate permissions');
