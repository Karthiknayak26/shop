import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UPIPaymentModal from '../../MyComponents/Header/UPIPaymentModal';
import PaymentService from '../../services/paymentService';

// Mock the PaymentService
jest.mock('../../services/paymentService', () => ({
  generateUPIQRCode: jest.fn(),
  verifyPayment: jest.fn(),
}));

describe('UPI Payment Modal', () => {
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

  test('renders UPI payment modal with initial step', () => {
    render(<UPIPaymentModal {...mockProps} />);
    
    // Check if the modal title is rendered
    expect(screen.getByText(/UPI Payment/i)).toBeInTheDocument();
    
    // Check if the first step is active
    expect(screen.getByText(/Enter UPI ID/i)).toBeInTheDocument();
    
    // Check if UPI ID input field is rendered
    expect(screen.getByLabelText(/Enter your UPI ID/i)).toBeInTheDocument();
  });

  test('validates UPI ID format', async () => {
    render(<UPIPaymentModal {...mockProps} />);
    
    // Enter invalid UPI ID
    fireEvent.change(screen.getByLabelText(/Enter your UPI ID/i), {
      target: { value: 'invalid-upi' }
    });
    
    // Click generate QR code button
    fireEvent.click(screen.getByText(/Generate QR Code/i));
    
    // Check for validation error
    expect(screen.getByText(/Invalid UPI ID format/i)).toBeInTheDocument();
    
    // Enter valid UPI ID
    fireEvent.change(screen.getByLabelText(/Enter your UPI ID/i), {
      target: { value: 'valid@upi' }
    });
    
    // Click generate QR code button again
    PaymentService.generateUPIQRCode.mockResolvedValueOnce({
      success: true,
      qrCodeData: 'data:image/png;base64,mockQRCodeData',
      upiUrl: 'upi://pay?pa=valid@upi&pn=Kandukuru%20Supermarket&am=1000'
    });
    
    fireEvent.click(screen.getByText(/Generate QR Code/i));
    
    // Wait for QR code generation
    await waitFor(() => {
      expect(PaymentService.generateUPIQRCode).toHaveBeenCalledWith({
        amount: 1000,
        upiId: 'valid@upi',
        orderId: 'order123'
      });
    });
  });

  test('handles QR code generation success', async () => {
    // Mock successful QR code generation
    PaymentService.generateUPIQRCode.mockResolvedValueOnce({
      success: true,
      qrCodeData: 'data:image/png;base64,mockQRCodeData',
      upiUrl: 'upi://pay?pa=test@upi&pn=Kandukuru%20Supermarket&am=1000'
    });

    render(<UPIPaymentModal {...mockProps} />);
    
    // Enter valid UPI ID
    fireEvent.change(screen.getByLabelText(/Enter your UPI ID/i), {
      target: { value: 'test@upi' }
    });
    
    // Click generate QR code button
    fireEvent.click(screen.getByText(/Generate QR Code/i));
    
    // Wait for QR code to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Scan this QR code/i)).toBeInTheDocument();
    });
    
    // Check if the second step is active
    expect(screen.getByText(/Scan QR Code/i)).toBeInTheDocument();
  });

  test('handles QR code generation failure', async () => {
    // Mock failed QR code generation
    PaymentService.generateUPIQRCode.mockResolvedValueOnce({
      success: false,
      error: 'Failed to generate QR code'
    });

    render(<UPIPaymentModal {...mockProps} />);
    
    // Enter valid UPI ID
    fireEvent.change(screen.getByLabelText(/Enter your UPI ID/i), {
      target: { value: 'test@upi' }
    });
    
    // Click generate QR code button
    fireEvent.click(screen.getByText(/Generate QR Code/i));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate QR code/i)).toBeInTheDocument();
    });
  });

  test('handles payment verification', async () => {
    // Mock successful QR code generation
    PaymentService.generateUPIQRCode.mockResolvedValueOnce({
      success: true,
      qrCodeData: 'data:image/png;base64,mockQRCodeData',
      upiUrl: 'upi://pay?pa=test@upi&pn=Kandukuru%20Supermarket&am=1000'
    });
    
    // Mock successful payment verification
    PaymentService.verifyPayment.mockResolvedValueOnce({
      success: true,
      status: 'completed',
      message: 'Payment successful'
    });

    render(<UPIPaymentModal {...mockProps} />);
    
    // Enter valid UPI ID
    fireEvent.change(screen.getByLabelText(/Enter your UPI ID/i), {
      target: { value: 'test@upi' }
    });
    
    // Click generate QR code button
    fireEvent.click(screen.getByText(/Generate QR Code/i));
    
    // Wait for QR code to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Scan this QR code/i)).toBeInTheDocument();
    });
    
    // Click I've made the payment button
    fireEvent.click(screen.getByText(/I've made the payment/i));
    
    // Wait for payment verification
    await waitFor(() => {
      expect(PaymentService.verifyPayment).toHaveBeenCalledWith('order123');
    });
    
    // Check if payment success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Payment successful/i)).toBeInTheDocument();
    });
    
    // Check if onPaymentSuccess callback was called
    expect(mockProps.onPaymentSuccess).toHaveBeenCalled();
  });
});