const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/dotenv');

describe('Authentication Security Tests', () => {
  let testUser;
  let validToken;
  let expiredToken;
  let invalidToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Create test user
    testUser = await User.create({
      name: 'Security Test User',
      email: 'security-test@example.com',
      password: 'SecurePassword123!',
      phone: '9876543210'
    });
    
    // Generate valid token
    validToken = jwt.sign({ id: testUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
    
    // Generate expired token
    expiredToken = jwt.sign({ id: testUser._id }, config.JWT_SECRET, { expiresIn: '0s' });
    
    // Generate invalid token (wrong signature)
    invalidToken = jwt.sign({ id: testUser._id }, 'wrong-secret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('Login Rate Limiting', () => {
    test('should limit login attempts after multiple failures', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/users/login')
          .send({
            email: 'security-test@example.com',
            password: 'WrongPassword'
          });
      }
      
      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'security-test@example.com',
          password: 'WrongPassword'
        });
      
      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Too many login attempts');
    });
  });

  describe('JWT Token Validation', () => {
    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject access with expired token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Token expired');
    });

    test('should reject access with invalid token signature', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid token');
    });

    test('should reject access with malformed token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer malformed.token.here');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid token');
    });

    test('should reject access with missing token', async () => {
      const response = await request(app)
        .get('/api/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No token provided');
    });
  });

  describe('Password Security', () => {
    test('should reject weak passwords during registration', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Weak Password User',
          email: 'weak-password@example.com',
          password: 'password', // Weak password
          confirmPassword: 'password',
          phone: '9876543210'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Password does not meet security requirements');
    });

    test('should not return password hash in user data', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('CSRF Protection', () => {
    test('should reject requests without CSRF token for state-changing operations', async () => {
      // This test assumes your app has CSRF protection enabled
      // You may need to adjust based on your actual CSRF implementation
      const response = await request(app)
        .post('/api/users/update-profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Updated Name'
        });
      
      // If CSRF is properly implemented, this should fail
      expect(response.status).toBe(403);
    });
  });

  describe('XSS Protection', () => {
    test('should sanitize user input to prevent XSS', async () => {
      // Create a user with potentially malicious name
      const xssResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: '<script>alert("XSS")</script>',
          email: 'xss-test@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          phone: '9876543210'
        });
      
      // If registration succeeds, check that the name was sanitized
      if (xssResponse.status === 201) {
        const loginResponse = await request(app)
          .post('/api/users/login')
          .send({
            email: 'xss-test@example.com',
            password: 'SecurePassword123!'
          });
        
        const token = loginResponse.body.token;
        
        const profileResponse = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`);
        
        // The name should be sanitized
        expect(profileResponse.body.user.name).not.toContain('<script>');
      } else {
        // If registration fails for other reasons, this test can be skipped
        console.log('XSS test skipped due to registration failure');
      }
    });
  });
});