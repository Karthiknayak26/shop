const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Feedback = require('../../models/Feedback');

describe('Feedback Controller', () => {
  let testFeedbackId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Clear feedback collection before tests
    await Feedback.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('POST /api/feedback', () => {
    test('should create a new feedback with valid data', async () => {
      const feedbackData = {
        name: 'Test User',
        email: 'test@example.com',
        orderId: '12345',
        message: 'This is a test feedback message'
      };
      
      const response = await request(app)
        .post('/api/feedback')
        .send(feedbackData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('submitted successfully');
      
      // Verify feedback was created in database
      const createdFeedback = await Feedback.findOne({ email: feedbackData.email });
      expect(createdFeedback).not.toBeNull();
      expect(createdFeedback.name).toBe(feedbackData.name);
      expect(createdFeedback.message).toBe(feedbackData.message);
      
      // Save feedback ID for later tests
      testFeedbackId = createdFeedback._id;
    });

    test('should not create feedback with missing required fields', async () => {
      const incompleteFeedbackData = {
        name: 'Incomplete Feedback',
        // Missing email and message
        orderId: '67890'
      };
      
      const response = await request(app)
        .post('/api/feedback')
        .send(incompleteFeedbackData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/feedback', () => {
    test('should get all feedbacks', async () => {
      // Create another feedback for testing
      await Feedback.create({
        name: 'Another User',
        email: 'another@example.com',
        message: 'Another test feedback'
      });
      
      const response = await request(app)
        .get('/api/feedback');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Verify the response contains the expected feedback data
      const testFeedback = response.body.find(f => f.email === 'test@example.com');
      expect(testFeedback).toBeDefined();
      expect(testFeedback.name).toBe('Test User');
      expect(testFeedback.message).toBe('This is a test feedback message');
    });
  });

  describe('DELETE /api/feedback/:id', () => {
    test('should delete feedback by ID', async () => {
      const response = await request(app)
        .delete(`/api/feedback/${testFeedbackId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify feedback was deleted from database
      const deletedFeedback = await Feedback.findById(testFeedbackId);
      expect(deletedFeedback).toBeNull();
    });

    test('should return 404 for non-existent feedback ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/feedback/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });
});