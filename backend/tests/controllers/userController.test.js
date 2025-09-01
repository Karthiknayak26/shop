const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('User Controller', () => {
  let testUser;
  let testUserId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Clear users collection before tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('POST /api/users/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      const response = await request(app)
        .post('/api/users/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify user was created in database
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser).not.toBeNull();
      expect(createdUser.name).toBe(userData.name);
      
      // Save user ID for later tests
      testUserId = createdUser._id;
    });

    test('should not register a user with missing required fields', async () => {
      const incompleteUserData = {
        name: 'Incomplete User',
        // Missing email and password
      };
      
      const response = await request(app)
        .post('/api/users/register')
        .send(incompleteUserData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should not register a user with an existing email', async () => {
      const duplicateUserData = {
        name: 'Duplicate User',
        email: 'test@example.com', // Already used in previous test
        password: 'Password123!'
      };
      
      const response = await request(app)
        .post('/api/users/register')
        .send(duplicateUserData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/users/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should not login with non-existent email', async () => {
      const nonExistentLoginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };
      
      const response = await request(app)
        .post('/api/users/login')
        .send(nonExistentLoginData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No account found');
    });

    test('should not login with incorrect password', async () => {
      const incorrectPasswordData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };
      
      const response = await request(app)
        .post('/api/users/login')
        .send(incorrectPasswordData);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid password');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Updated Test User',
        email: 'updated-test@example.com'
      };
      
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.email).toBe(updateData.email);
      
      // Verify user was updated in database
      const updatedUser = await User.findById(testUserId);
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(updateData.email);
    });

    test('should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Non-existent User',
        email: 'nonexistent@example.com'
      };
      
      const response = await request(app)
        .put(`/api/users/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/users/change-password', () => {
    test('should change password with valid current password', async () => {
      const passwordChangeData = {
        userId: testUserId,
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!'
      };
      
      const response = await request(app)
        .post('/api/users/change-password')
        .send(passwordChangeData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed successfully');
      
      // Verify password was changed in database
      const updatedUser = await User.findById(testUserId);
      const isNewPasswordValid = await bcrypt.compare('NewPassword123!', updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    test('should not change password with incorrect current password', async () => {
      const incorrectPasswordChangeData = {
        userId: testUserId,
        currentPassword: 'WrongPassword123!',
        newPassword: 'AnotherPassword123!'
      };
      
      const response = await request(app)
        .post('/api/users/change-password')
        .send(incorrectPasswordChangeData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    test('should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const passwordChangeData = {
        userId: nonExistentId,
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!'
      };
      
      const response = await request(app)
        .post('/api/users/change-password')
        .send(passwordChangeData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/users/:id/shipping-address', () => {
    test('should get shipping address for existing user', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/shipping-address`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shippingAddress');
    });

    test('should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/users/${nonExistentId}/shipping-address`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/users/:id/shipping-address', () => {
    test('should update shipping address with valid data', async () => {
      const shippingAddressData = {
        shippingAddress: {
          name: 'Test Recipient',
          email: 'recipient@example.com',
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          phone: '9876543210'
        }
      };
      
      const response = await request(app)
        .put(`/api/users/${testUserId}/shipping-address`)
        .send(shippingAddressData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated successfully');
      expect(response.body.shippingAddress).toEqual(shippingAddressData.shippingAddress);
      
      // Verify shipping address was updated in database
      const updatedUser = await User.findById(testUserId);
      expect(updatedUser.shippingAddress.name).toBe(shippingAddressData.shippingAddress.name);
      expect(updatedUser.shippingAddress.address).toBe(shippingAddressData.shippingAddress.address);
      expect(updatedUser.shippingAddress.city).toBe(shippingAddressData.shippingAddress.city);
    });

    test('should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const shippingAddressData = {
        shippingAddress: {
          name: 'Non-existent Recipient',
          address: '456 Fake Street',
          city: 'Fake City',
          postalCode: '54321',
          phone: '0123456789'
        }
      };
      
      const response = await request(app)
        .put(`/api/users/${nonExistentId}/shipping-address`)
        .send(shippingAddressData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});