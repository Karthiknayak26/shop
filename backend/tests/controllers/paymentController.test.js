const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/dotenv');

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => {
    return {
      orders: {
        create: jest.fn().mockResolvedValue({
          id: 'order_test123',
          amount: 100000,
          currency: 'INR'
        })
      },
      payments: {
        fetch: jest.fn().mockResolvedValue({
          id: 'pay_test123',
          order_id: 'order_test123',
          amount: 100000,
          status: 'captured'
        })
      }
    };
  });
});

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQRCodeData')
}));

describe('Payment Controller', () => {
  let authToken;
  let testUser;
  let testOrder;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kandukuru-test');
    
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'payment-test@example.com',
      password: 'password123',
      phone: '9876543210'
    });
    
    // Create test order
    testOrder = await Order.create({
      user: testUser._id,
      items: [{ product: 'test-product-id', quantity: 2, price: 500 }],
      totalAmount: 1000,
      status: 'pending',
      shippingAddress: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456'
      }
    });
    
    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, config.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('POST /api/payments/create-order', () => {
    test('should create a payment order successfully', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          currency: 'INR',
          receipt: `test_receipt_${Date.now()}`,
          customerDetails: {
            name: 'Test User',
            email: 'payment-test@example.com',
            phone: '9876543210'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orderId).toBe('order_test123');
      expect(response.body.amount).toBe(100000);
      expect(response.body.currency).toBe('INR');
    });

    test('should handle errors when creating payment order', async () => {
      // Mock Razorpay to throw an error
      require('razorpay').mockImplementationOnce(() => ({
        orders: {
          create: jest.fn().mockRejectedValue(new Error('Payment gateway error'))
        }
      }));

      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          currency: 'INR',
          receipt: `test_receipt_${Date.now()}`,
          customerDetails: {
            name: 'Test User',
            email: 'payment-test@example.com',
            phone: '9876543210'
          }
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to create payment order');
    });
  });

  describe('POST /api/payments/generate-upi-qr', () => {
    test('should generate UPI QR code successfully', async () => {
      const response = await request(app)
        .post('/api/payments/generate-upi-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          upiId: 'test@upi',
          orderId: testOrder._id.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.qrCodeData).toBe('data:image/png;base64,mockQRCodeData');
      expect(response.body.upiUrl).toContain('upi://pay');
      expect(response.body.upiUrl).toContain('pa=test@upi');
    });

    test('should validate UPI ID format', async () => {
      const response = await request(app)
        .post('/api/payments/generate-upi-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          upiId: 'invalid-upi',
          orderId: testOrder._id.toString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid UPI ID format');
    });
  });

  describe('POST /api/payments/verify', () => {
    test('should verify payment successfully', async () => {
      // Create a test payment
      await Payment.create({
        orderId: testOrder._id,
        paymentId: 'pay_test123',
        amount: 1000,
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder._id.toString(),
          paymentId: 'pay_test123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('completed');
      
      // Check if order status was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.status).toBe('paid');
    });

    test('should handle payment verification failure', async () => {
      // Mock Razorpay to return failed payment
      require('razorpay').mockImplementationOnce(() => ({
        payments: {
          fetch: jest.fn().mockResolvedValue({
            id: 'pay_test_failed',
            order_id: 'order_test_failed',
            amount: 100000,
            status: 'failed'
          })
        }
      }));

      const response = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder._id.toString(),
          paymentId: 'pay_test_failed'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Payment verification failed');
    });
  });
});