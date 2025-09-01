import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardPayment from '../../MyComponents/Header/CardPayment';
import PaymentService from '../../services/paymentService';

// Mock the PaymentService
jest.mock('../../services/paymentService', () => ({
  createOrder: jest.fn(),
}));

// Mock Razorpay
const mockRazorpay = jest.fn();
window.Razorpay = mockRazorpay;

describe('Card Payment Component', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    amount: 1000,
    orderData: { id: 'order123', items: [{ name: 'Test Product', price: 1000 }] },
    onPaymentSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders card payment modal', () => {
    render(<CardPayment {...mockProps} />);
    
    // Check if the modal title is rendered
    expect(screen.getByText(/Card Payment/i)).toBeInTheDocument();
    
    // Check if payment instructions are displayed
    expect(screen.getByText(/You will be redirected to the payment gateway/i)).toBeInTheDocument();
    
    // Check if proceed button is rendered
    expect(screen.getByText(/Proceed to Payment/i)).toBeInTheDocument();
  });

  test('creates order and initializes Razorpay on proceed', async () => {
    // Mock successful order creation
    PaymentService.createOrder.mockResolvedValueOnce({
      success: true,
      orderId: 'razorpay_order_123',
      amount: 100000,
      currency: 'INR'
    });

    // Mock Razorpay instance
    const mockRazorpayInstance = {
      open: jest.fn()
    };
    mockRazorpay.mockReturnValueOnce(mockRazorpayInstance);

    render(<CardPayment {...mockProps} />);
    
    // Click proceed button
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    
    // Wait for order creation
    await waitFor(() => {
      expect(PaymentService.createOrder).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'INR',
        receipt: expect.any(String),
        customerDetails: expect.any(Object)
      });
    });
    
    // Check if Razorpay was initialized with correct options
    await waitFor(() => {
      expect(mockRazorpay).toHaveBeenCalledWith(expect.objectContaining({
        key: expect.any(String),
        amount: 100000,
        currency: 'INR',
        name: 'Kandukuru Supermarket',
        order_id: 'razorpay_order_123',
        handler: expect.any(Function)
      }));
    });
    
    // Check if Razorpay.open was called
    expect(mockRazorpayInstance.open).toHaveBeenCalled();
  });

  test('handles order creation failure', async () => {
    // Mock failed order creation
    PaymentService.createOrder.mockResolvedValueOnce({
      success: false,
      error: 'Failed to create payment order'
    });

    render(<CardPayment {...mockProps} />);
    
    // Click proceed button
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to create payment order/i)).toBeInTheDocument();
    });
    
    // Razorpay should not be initialized
    expect(mockRazorpay).not.toHaveBeenCalled();
  });

  test('handles payment success', async () => {
    // Mock successful order creation
    PaymentService.createOrder.mockResolvedValueOnce({
      success: true,
      orderId: 'razorpay_order_123',
      amount: 100000,
      currency: 'INR'
    });

    // Mock Razorpay instance and capture the handler
    let paymentSuccessHandler;
    const mockRazorpayInstance = {
      open: jest.fn()
    };
    mockRazorpay.mockImplementationOnce((options) => {
      paymentSuccessHandler = options.handler;
      return mockRazorpayInstance;
    });

    render(<CardPayment {...mockProps} />);
    
    // Click proceed button
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    
    // Wait for Razorpay to be initialized
    await waitFor(() => {
      expect(mockRazorpay).toHaveBeenCalled();
    });
    
    // Simulate payment success by calling the handler
    paymentSuccessHandler({
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'razorpay_order_123',
      razorpay_signature: 'signature_123'
    });
    
    // Check if onPaymentSuccess callback was called
    expect(mockProps.onPaymentSuccess).toHaveBeenCalledWith({
      paymentId: 'pay_123',
      orderId: 'razorpay_order_123',
      signature: 'signature_123'
    });
  });
});