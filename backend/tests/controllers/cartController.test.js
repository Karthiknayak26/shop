const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Cart = require('../../models/cartModel');
const Product = require('../../models/Product');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/dotenv');

describe('Cart Controller', () => {
  let testUser;
  let authToken;
  let testProduct;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Create test user
    testUser = await User.create({
      name: 'Cart Test User',
      email: 'cart-test@example.com',
      password: 'Password123!',
      phone: '9876543210'
    });
    
    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
    
    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      price: 100,
      description: 'Test product description',
      imageUrl: '/images/test-product.jpg',
      category: 'Test Category',
      stock: 50
    });
    
    // Clear cart collection
    await Cart.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('GET /api/cart', () => {
    test('should get empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.cart).toHaveProperty('items');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalPrice).toBe(0);
      expect(response.body.cart.itemCount).toBe(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cart');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/cart/add', () => {
    test('should add item to cart', async () => {
      const addItemData = {
        productId: testProduct._id,
        quantity: 2
      };
      
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addItemData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('added to cart');
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].productId.toString()).toBe(testProduct._id.toString());
      expect(response.body.cart.items[0].quantity).toBe(2);
      expect(response.body.cart.items[0].price).toBe(testProduct.price);
      expect(response.body.cart.totalPrice).toBe(testProduct.price * 2);
      expect(response.body.cart.itemCount).toBe(2);
    });

    test('should increase quantity when adding existing item', async () => {
      const addItemData = {
        productId: testProduct._id,
        quantity: 1
      };
      
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addItemData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(3); // 2 + 1
      expect(response.body.cart.totalPrice).toBe(testProduct.price * 3);
      expect(response.body.cart.itemCount).toBe(3);
    });

    test('should return 404 for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const addItemData = {
        productId: nonExistentId,
        quantity: 1
      };
      
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addItemData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/cart/update', () => {
    test('should update cart item quantity', async () => {
      const updateItemData = {
        productId: testProduct._id,
        quantity: 5
      };
      
      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateItemData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated successfully');
      expect(response.body.cart.items[0].quantity).toBe(5);
      expect(response.body.cart.totalPrice).toBe(testProduct.price * 5);
      expect(response.body.cart.itemCount).toBe(5);
    });

    test('should return 400 for invalid quantity', async () => {
      const invalidQuantityData = {
        productId: testProduct._id,
        quantity: 0 // Invalid quantity
      };
      
      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidQuantityData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 1');
    });

    test('should return 404 for item not in cart', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateItemData = {
        productId: nonExistentId,
        quantity: 3
      };
      
      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateItemData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found in cart');
    });
  });

  describe('DELETE /api/cart/remove/:productId', () => {
    test('should remove item from cart', async () => {
      const response = await request(app)
        .delete(`/api/cart/remove/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed from cart');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalPrice).toBe(0);
      expect(response.body.cart.itemCount).toBe(0);
    });

    test('should return 404 for item not in cart', async () => {
      // Cart is now empty from previous test
      const response = await request(app)
        .delete(`/api/cart/remove/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found in cart');
    });
  });

  describe('DELETE /api/cart/clear', () => {
    test('should clear cart', async () => {
      // First add an item to the cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct._id, quantity: 2 });
      
      // Then clear the cart
      const response = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cleared successfully');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.totalPrice).toBe(0);
      expect(response.body.cart.itemCount).toBe(0);
    });
  });
});