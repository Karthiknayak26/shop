const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Location = require('../../models/location');

describe('Location Controller', () => {
  let testLocationId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Clear location collection before tests
    await Location.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('POST /api/locations', () => {
    test('should create a new location with valid data', async () => {
      const locationData = {
        name: 'Test Store',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        latitude: 12.9716,
        longitude: 77.5946
      };
      
      const response = await request(app)
        .post('/api/locations')
        .send(locationData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(locationData.name);
      expect(response.body.address).toBe(locationData.address);
      expect(response.body.city).toBe(locationData.city);
      expect(response.body.state).toBe(locationData.state);
      expect(response.body.latitude).toBe(locationData.latitude);
      expect(response.body.longitude).toBe(locationData.longitude);
      
      // Save ID for later tests
      testLocationId = response.body._id;
    });

    test('should return 400 for missing required fields', async () => {
      const invalidData = {
        name: 'Invalid Location',
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/locations')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Error creating location');
    });
  });

  describe('GET /api/locations', () => {
    test('should get all locations', async () => {
      const response = await request(app)
        .get('/api/locations');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('address');
    });
  });

  describe('GET /api/locations/address/:address', () => {
    test('should get location by address', async () => {
      const response = await request(app)
        .get('/api/locations/address/123 Test Street');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.address).toBe('123 Test Street');
    });

    test('should return 404 for non-existent address', async () => {
      const response = await request(app)
        .get('/api/locations/address/NonExistentAddress');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/locations/:id', () => {
    test('should delete location by ID', async () => {
      const response = await request(app)
        .delete(`/api/locations/${testLocationId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Location deleted');
      
      // Verify location was deleted
      const deletedLocation = await Location.findById(testLocationId);
      expect(deletedLocation).toBeNull();
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/locations/invalidid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});