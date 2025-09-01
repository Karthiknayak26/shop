const emailService = require('../services/emailService');
const sendEmail = require('../utils/sendEmail');

// Mock the sendEmail utility
jest.mock('../utils/sendEmail', () => jest.fn());

describe('Email Service Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('sendOrderConfirmation should call sendEmail with correct parameters', async () => {
    // Create a mock order
    const mockOrder = {
      _id: 'order123',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      },
      orderItems: [
        { name: 'Test Product', qty: 2, price: 10 }
      ],
      shippingAddress: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'Credit Card',
      totalPrice: 20
    };

    // Call the function
    await emailService.sendOrderConfirmation(mockOrder);

    // Check if sendEmail was called with the right parameters
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Your Order Confirmation - Kandukuru Supermarket',
      text: expect.any(String),
      html: expect.any(String)
    });
  });

  test('sendPasswordReset should call sendEmail with correct parameters', async () => {
    // Create a mock user and token
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com'
    };
    const mockToken = 'test-reset-token';

    // Call the function
    await emailService.sendPasswordReset(mockUser, mockToken);

    // Check if sendEmail was called with the right parameters
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Password Reset - Kandukuru Supermarket',
      text: expect.any(String),
      html: expect.any(String)
    });
    // Verify token is included in the email content
    const emailOptions = sendEmail.mock.calls[0][0];
    expect(emailOptions.text).toContain(mockToken);
    expect(emailOptions.html).toContain(mockToken);
  });

  test('sendNotification should call sendEmail with correct parameters', async () => {
    // Create a mock user and notification content
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com'
    };
    const mockSubject = 'Test Notification';
    const mockMessage = 'This is a test notification message';

    // Call the function
    await emailService.sendNotification(mockUser, mockSubject, mockMessage);

    // Check if sendEmail was called with the right parameters
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Test Notification - Kandukuru Supermarket',
      text: expect.any(String),
      html: expect.any(String)
    });
    // Verify message is included in the email content
    const emailOptions = sendEmail.mock.calls[0][0];
    expect(emailOptions.text).toContain(mockMessage);
    expect(emailOptions.html).toContain(mockMessage);
  });

  test('should handle errors when sendEmail fails', async () => {
    // Setup sendEmail to throw an error
    sendEmail.mockRejectedValueOnce(new Error('Email sending failed'));

    // Create a mock user for notification
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    // Call the function and expect it to reject
    await expect(emailService.sendNotification(
      mockUser, 'Test Subject', 'Test Message'
    )).rejects.toThrow('Email sending failed');
  });
});