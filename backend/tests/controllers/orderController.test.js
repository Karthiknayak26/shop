const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');
const jwt = require('jsonwebtoken');
const config = require('../../config/dotenv');

describe('Order Controller', () => {
  let user1;
  let user2;
  let user1Token;
  let user2Token;
  let adminToken;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Create users
    user1 = await User.create({
      name: 'Order Test User 1',
      email: 'order-test-1@example.com',
      password: 'Password123!',
      phone: '9876543210'
    });
    
    user2 = await User.create({
      name: 'Order Test User 2',
      email: 'order-test-2@example.com',
      password: 'Password123!',
      phone: '9876543211'
    });
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin-order-test@example.com',
      password: 'AdminPassword123!',
      phone: '9876543212',
      role: 'admin'
    });
    
    // Generate tokens
    user1Token = jwt.sign({ id: user1._id }, config.JWT_SECRET, { expiresIn: '1h' });
    user2Token = jwt.sign({ id: user2._id }, config.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: admin._id }, config.JWT_SECRET, { expiresIn: '1h' });
    
    // Create test product
    testProduct = await Product.create({
      name: 'Test Product for Orders',
      price: 100,
      description: 'Test product for order tests',
      imageUrl: '/images/test-product.jpg',
      category: 'Test',
      stock: 50
    });
    
    // Create test order
    testOrder = await Order.create({
      user: user1._id,
      items: [{ product: testProduct._id, quantity: 2, price: 100 }],
      totalAmount: 200,
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

  describe('POST /api/orders/create', () => {
    test('should create a new order', async () => {
      const orderData = {
        items: [
          { product: testProduct._id, quantity: 1, price: 100 }
        ],
        totalAmount: 100,
        shippingAddress: {
          street: 'New Order Street',
          city: 'New Order City',
          state: 'New Order State',
          zipCode: '654321'
        },
        paymentMethod: 'cod'
      };
      
      const response = await request(app)
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(orderData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.order).toHaveProperty('_id');
      expect(response.body.order.user.toString()).toBe(user1._id.toString());
      expect(response.body.order.totalAmount).toBe(100);
      expect(response.body.order.status).toBe('pending');
      
      // Verify order was created in database
      const createdOrder = await Order.findById(response.body.order._id);
      expect(createdOrder).not.toBeNull();
      expect(createdOrder.items.length).toBe(1);
    });

    test('should validate required fields for order creation', async () => {
      const incompleteOrderData = {
        // Missing items and other required fields
        totalAmount: 100
      };
      
      const response = await request(app)
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(incompleteOrderData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('should require authentication for order creation', async () => {
      const orderData = {
        items: [
          { product: testProduct._id, quantity: 1, price: 100 }
        ],
        totalAmount: 100,
        shippingAddress: {
          street: 'New Order Street',
          city: 'New Order City',
          state: 'New Order State',
          zipCode: '654321'
        },
        paymentMethod: 'cod'
      };
      
      const response = await request(app)
        .post('/api/orders/create')
        .send(orderData);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders', () => {
    test('should get all orders for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
      
      // Verify all orders belong to the authenticated user
      response.body.orders.forEach(order => {
        expect(order.user.toString()).toBe(user1._id.toString());
      });
    });

    test('should not return orders of other users', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${user2Token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // User2 should not see user1's orders
      response.body.orders.forEach(order => {
        expect(order.user.toString()).not.toBe(user1._id.toString());
      });
    });

    test('should allow admin to see all orders', async () => {
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orders.length).toBeGreaterThan(0);
      
      // Admin should see orders from all users
      const hasUser1Orders = response.body.orders.some(order => 
        order.user.toString() === user1._id.toString()
      );
      expect(hasUser1Orders).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should get order by ID for the owner', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order._id.toString()).toBe(testOrder._id.toString());
      expect(response.body.order.user.toString()).toBe(user1._id.toString());
    });

    test('should not allow access to order of another user', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${user2Token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not authorized');
    });

    test('should allow admin to access any order', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order._id.toString()).toBe(testOrder._id.toString());
    });

    test('should return 404 for non-existent order', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/orders/${nonExistentId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Order not found');
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    test('should allow user to cancel their own order', async () => {
      // Create a new order to cancel
      const orderToCancel = await Order.create({
        user: user1._id,
        items: [{ product: testProduct._id, quantity: 1, price: 100 }],
        totalAmount: 100,
        status: 'pending',
        shippingAddress: {
          street: 'Cancel Order Street',
          city: 'Cancel Order City',
          state: 'Cancel Order State',
          zipCode: '111111'
        }
      });
      
      const response = await request(app)
        .put(`/api/orders/${orderToCancel._id}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('cancelled');
      
      // Verify order was updated in database
      const updatedOrder = await Order.findById(orderToCancel._id);
      expect(updatedOrder.status).toBe('cancelled');
    });

    test('should not allow cancellation of already shipped orders', async () => {
      // Create a shipped order
      const shippedOrder = await Order.create({
        user: user1._id,
        items: [{ product: testProduct._id, quantity: 1, price: 100 }],
        totalAmount: 100,
        status: 'shipped',
        shippingAddress: {
          street: 'Shipped Order Street',
          city: 'Shipped Order City',
          state: 'Shipped Order State',
          zipCode: '222222'
        }
      });
      
      const response = await request(app)
        .put(`/api/orders/${shippedOrder._id}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cannot be cancelled');
      
      // Verify order status was not changed
      const unchangedOrder = await Order.findById(shippedOrder._id);
      expect(unchangedOrder.status).toBe('shipped');
    });
  });

  describe('PUT /api/admin/orders/:id/status', () => {
    test('should allow admin to update order status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('processing');
      
      // Verify order was updated in database
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.status).toBe('processing');
    });

    test('should not allow regular users to update order status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ status: 'shipped' });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should validate status values', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-status' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
    });
  });
});