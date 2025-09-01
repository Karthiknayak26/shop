const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Product = require('../../models/Product');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/dotenv');

describe('Product Controller', () => {
  let testProducts = [];
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin-test@example.com',
      password: 'AdminPassword123!',
      phone: '9876543210',
      role: 'admin'
    });
    
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user-test@example.com',
      password: 'UserPassword123!',
      phone: '9876543211',
      role: 'user'
    });
    
    // Generate tokens
    adminToken = jwt.sign({ id: adminUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: regularUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
    
    // Create test products
    const productData = [
      {
        name: 'Rice',
        price: 100,
        description: 'Premium quality rice',
        imageUrl: '/images/rice.jpg',
        category: 'Grains',
        stock: 50
      },
      {
        name: 'Dal',
        price: 80,
        description: 'Fresh dal',
        imageUrl: '/images/dal.jpg',
        category: 'Pulses',
        stock: 30
      },
      {
        name: 'Sugar',
        price: 40,
        description: 'Refined sugar',
        imageUrl: '/images/sugar.jpg',
        category: 'Essentials',
        stock: 100
      }
    ];
    
    for (const product of productData) {
      testProducts.push(await Product.create(product));
    }
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Product.deleteMany({});
    
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    test('should get all products', async () => {
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(3);
      expect(response.body.products[0]).toHaveProperty('name');
      expect(response.body.products[0]).toHaveProperty('price');
      expect(response.body.products[0]).toHaveProperty('description');
    });

    test('should filter products by category', async () => {
      const response = await request(app).get('/api/products?category=Grains');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].name).toBe('Rice');
    });

    test('should search products by name', async () => {
      const response = await request(app).get('/api/products?search=rice');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].name).toBe('Rice');
    });

    test('should sort products by price ascending', async () => {
      const response = await request(app).get('/api/products?sort=price');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products[0].name).toBe('Sugar');
      expect(response.body.products[1].name).toBe('Dal');
      expect(response.body.products[2].name).toBe('Rice');
    });

    test('should sort products by price descending', async () => {
      const response = await request(app).get('/api/products?sort=-price');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products[0].name).toBe('Rice');
      expect(response.body.products[1].name).toBe('Dal');
      expect(response.body.products[2].name).toBe('Sugar');
    });

    test('should paginate products', async () => {
      const response = await request(app).get('/api/products?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(2);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.totalProducts).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get product by ID', async () => {
      const productId = testProducts[0]._id;
      const response = await request(app).get(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product._id.toString()).toBe(productId.toString());
      expect(response.body.product.name).toBe('Rice');
    });

    test('should return 404 for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Product not found');
    });

    test('should return 400 for invalid product ID', async () => {
      const response = await request(app).get('/api/products/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid product ID');
    });
  });

  describe('POST /api/admin/products', () => {
    test('should create a new product when admin', async () => {
      const newProduct = {
        name: 'Test Product',
        price: 150,
        description: 'Test product description',
        imageUrl: '/images/test-product.jpg',
        category: 'Test',
        stock: 25
      };
      
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toHaveProperty('name', 'Test Product');
      expect(response.body.product).toHaveProperty('price', 150);
      
      // Verify product was actually created in database
      const createdProduct = await Product.findById(response.body.product._id);
      expect(createdProduct).not.toBeNull();
      expect(createdProduct.name).toBe('Test Product');
    });

    test('should reject product creation for non-admin users', async () => {
      const newProduct = {
        name: 'Unauthorized Product',
        price: 200,
        description: 'This should not be created',
        imageUrl: '/images/unauthorized.jpg',
        category: 'Test',
        stock: 10
      };
      
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProduct);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized as an admin');
    });

    test('should validate required fields for product creation', async () => {
      const incompleteProduct = {
        name: 'Incomplete Product',
        // Missing price and other required fields
      };
      
      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteProduct);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('PUT /api/admin/products/:id', () => {
    test('should update a product when admin', async () => {
      const productId = testProducts[0]._id;
      const updateData = {
        price: 120,
        stock: 40,
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.price).toBe(120);
      expect(response.body.product.stock).toBe(40);
      expect(response.body.product.description).toBe('Updated description');
      
      // Verify product was actually updated in database
      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.price).toBe(120);
      expect(updatedProduct.stock).toBe(40);
    });

    test('should reject product update for non-admin users', async () => {
      const productId = testProducts[0]._id;
      const updateData = {
        price: 150
      };
      
      const response = await request(app)
        .put(`/api/admin/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/products/:id', () => {
    test('should delete a product when admin', async () => {
      // Create a product to delete
      const productToDelete = await Product.create({
        name: 'Product to Delete',
        price: 50,
        description: 'This product will be deleted',
        imageUrl: '/images/delete-me.jpg',
        category: 'Test',
        stock: 5
      });
      
      const response = await request(app)
        .delete(`/api/admin/products/${productToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify product was actually deleted from database
      const deletedProduct = await Product.findById(productToDelete._id);
      expect(deletedProduct).toBeNull();
    });

    test('should reject product deletion for non-admin users', async () => {
      const productId = testProducts[1]._id;
      
      const response = await request(app)
        .delete(`/api/admin/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      
      // Verify product still exists in database
      const product = await Product.findById(productId);
      expect(product).not.toBeNull();
    });
  });
});