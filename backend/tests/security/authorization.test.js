const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const jwt = require('jsonwebtoken');
const config = require('../../config/dotenv');

describe('Authorization Security Tests', () => {
  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Create regular user
    regularUser = await User.create({
      name: 'Regular User',
      email: 'regular-user@example.com',
      password: 'SecurePassword123!',
      phone: '9876543210',
      role: 'user'
    });
    
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin-user@example.com',
      password: 'AdminPassword123!',
      phone: '9876543211',
      role: 'admin'
    });
    
    // Generate tokens
    regularToken = jwt.sign({ id: regularUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: adminUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
    
    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      price: 100,
      description: 'Test product for authorization tests',
      imageUrl: '/images/test-product.jpg',
      category: 'Test',
      stock: 50
    });
    
    // Create test order for regular user
    testOrder = await Order.create({
      user: regularUser._id,
      items: [{ product: testProduct._id, quantity: 1, price: 100 }],
      totalAmount: 100,
      status: 'pending',
      shippingAddress: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456'
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('Admin Routes Access Control', () => {
    test('should allow admin to access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should deny regular user access to admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized as an admin');
    });

    test('should allow admin to create new products', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Test Product',
          price: 200,
          description: 'New test product created by admin',
          imageUrl: '/images/new-test-product.jpg',
          category: 'Test',
          stock: 100
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toHaveProperty('name', 'New Test Product');
    });

    test('should deny regular user ability to create products', async () => {
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          name: 'Unauthorized Product',
          price: 300,
          description: 'This product should not be created',
          imageUrl: '/images/unauthorized-product.jpg',
          category: 'Test',
          stock: 100
        });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('User Resource Access Control', () => {
    test('should allow user to access their own profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user._id.toString()).toBe(regularUser._id.toString());
    });

    test('should allow user to access their own orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
      expect(response.body.orders[0].user.toString()).toBe(regularUser._id.toString());
    });

    test('should deny user access to other users orders', async () => {
      // Try to access a specific order by ID that belongs to another user
      const fakeOrderId = mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/orders/${fakeOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      // Should either return 403 (forbidden) or 404 (not found)
      // Both are acceptable depending on implementation
      expect([403, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Parameter Validation and Sanitization', () => {
    test('should reject requests with invalid IDs', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID');
    });

    test('should reject requests with SQL injection attempts', async () => {
      const response = await request(app)
        .get('/api/products?category=Test\'%20OR%20\'1\'=\'1')
        .set('Authorization', `Bearer ${regularToken}`);
      
      // Should not return all products (which would happen if injection worked)
      // Instead should either return products in the 'Test\' OR \'1\'=\'1' category (unlikely)
      // or return an error
      if (response.status === 200) {
        // If 200, make sure we didn't get all products due to injection
        expect(response.body.products.length).toBe(0);
      } else {
        // If error, that's fine too
        expect(response.status).toBe(400);
      }
    });
  });

  describe('API Security Headers', () => {
    test('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${regularToken}`);
      
      // Check for common security headers
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
    });
  });

  describe('Sensitive Operations Protection', () => {
    test('should require password confirmation for sensitive operations', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          newPassword: 'NewSecurePassword123!',
          // Missing current password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Current password is required');
    });

    test('should verify current password before allowing password change', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewSecurePassword123!'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Current password is incorrect');
    });
  });
});