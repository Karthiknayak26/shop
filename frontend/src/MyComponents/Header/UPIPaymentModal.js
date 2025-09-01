import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import PaymentService from '../../services/paymentService';
import './UPIPaymentModal.css';

const UPIPaymentModal = ({ open, onClose, amount, orderData, onPaymentSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [upiUrl, setUpiUrl] = useState('');
  const [error, setError] = useState('');

  const steps = [
    'Enter UPI ID',
    'Scan QR Code',
    'Complete Payment',
    'Payment Confirmation'
  ];

  // Validate UPI ID
  const validateUPIId = (id) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(id);
  };

  const handleUPIIdChange = (e) => {
    const value = e.target.value;
    setUpiId(value);

    if (value && !validateUPIId(value)) {
      setUpiIdError('Invalid UPI ID format (e.g., username@bank)');
    } else {
      setUpiIdError('');
    }
  };

  const generateQRCode = async () => {
    if (!validateUPIId(upiId)) {
      setError('Please enter a valid UPI ID');
      return;
    }

    setIsGeneratingQR(true);
    setError('');

    try {
      // Create payment order first
      const paymentOrder = await PaymentService.createPaymentOrder(amount);
      setOrderId(paymentOrder.orderId);

      // Generate QR code
      const qrResponse = await PaymentService.generateUPIQRCode(amount, upiId, paymentOrder.orderId);

      if (qrResponse.success) {
        setQrCodeData(qrResponse.qrCode);
        setUpiUrl(qrResponse.upiUrl);
        setActiveStep(1);
      } else {
        setError('Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      setError(error.message || 'Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyUPIUrl = async () => {
    try {
      await navigator.clipboard.writeText(upiUrl);
      // You can add a toast notification here
    } catch (error) {
      console.error('Failed to copy UPI URL:', error);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) return;

    try {
      const statusResponse = await PaymentService.checkUPIPaymentStatus(orderId);

      if (statusResponse.success) {
        setPaymentStatus(statusResponse.status);

        if (statusResponse.status === 'completed') {
          setStatusMessage('Payment completed successfully!');
          setActiveStep(3);

          // Process the successful payment
          await processSuccessfulPayment();
        } else if (statusResponse.status === 'processing') {
          setStatusMessage('Payment is being processed...');
        } else {
          setStatusMessage('Payment is pending. Please complete the payment in your UPI app.');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      setStatusMessage('Failed to check payment status');
    }
  };

  const processSuccessfulPayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Update order with payment info
      const updatedOrderData = {
        ...orderData,
        paymentInfo: {
          ...orderData.paymentInfo,
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          paymentStatus: 'completed',
          upiId: upiId
        }
      };

      // Create order in database
      const orderResponse = await fetch('https://shop-backend-92zc.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrderData),
      });

      const orderResult = await orderResponse.json();

      if (orderResponse.ok) {
        onPaymentSuccess({
          success: true,
          paymentId: `pay_${Date.now()}`,
          orderId: orderResult.orderId,
          orderData: updatedOrderData,
          upiId: upiId
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setError('Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleProceedToPayment = () => {
    setActiveStep(2);
    // Start checking payment status periodically
    const statusInterval = setInterval(checkPaymentStatus, 3000);

    // Clear interval after 5 minutes
    setTimeout(() => {
      clearInterval(statusInterval);
    }, 300000);
  };

  const handleClose = () => {
    setActiveStep(0);
    setUpiId('');
    setUpiIdError('');
    setQrCodeData(null);
    setPaymentStatus('pending');
    setStatusMessage('');
    setOrderId('');
    setUpiUrl('');
    setError('');
    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your UPI ID to generate a payment QR code
            </Typography>
            <TextField
              fullWidth
              label="UPI ID"
              value={upiId}
              onChange={handleUPIIdChange}
              error={!!upiIdError}
              helperText={upiIdError || "Format: username@bank (e.g., john@icici)"}
              placeholder="username@bank"
              sx={{ mb: 2 }}
            />
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Supported UPI Apps:</strong> Google Pay, PhonePe, Paytm, BHIM, and other UPI-enabled apps
              </Typography>
            </Alert>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>🧪 Demo Mode:</strong> This is a test payment. No real money will be charged.
              </Typography>
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Scan QR Code to Pay ₹{amount}
            </Typography>
            {qrCodeData ? (
              <Card sx={{ maxWidth: 350, mx: 'auto', mb: 2 }}>
                <CardContent>
                  <img
                    src={qrCodeData}
                    alt="UPI QR Code"
                    style={{ width: '100%', maxWidth: 300 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Amount: ₹{amount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    UPI ID: {upiId}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <CircularProgress />
            )}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={copyUPIUrl}
                sx={{ mr: 1 }}
              >
                Copy UPI Link
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={generateQRCode}
                disabled={isGeneratingQR}
              >
                Regenerate QR
              </Button>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                1. Open your UPI app (Google Pay, PhonePe, etc.)<br />
                2. Scan the QR code or use the UPI link<br />
                3. Confirm the payment details<br />
                4. Complete the payment
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              {paymentStatus === 'completed' ? (
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 48 }} />
              ) : paymentStatus === 'processing' ? (
                <CircularProgress size={48} />
              ) : (
                <PaymentIcon sx={{ color: 'primary.main', fontSize: 48 }} />
              )}
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {statusMessage || 'Waiting for payment confirmation...'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={checkPaymentStatus}
              sx={{ mr: 1 }}
            >
              Check Status
            </Button>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Please complete the payment in your UPI app. The status will update automatically.
              </Typography>
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 64, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your payment of ₹{amount} has been processed successfully.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Order ID: {orderId}<br />
              UPI ID: {upiId}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={false}
      disableBackdropClick={false}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <QrCodeIcon sx={{ mr: 1 }} />
          UPI Payment
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={generateQRCode}
              variant="contained"
              disabled={!upiId || !!upiIdError || isGeneratingQR}
              startIcon={isGeneratingQR ? <CircularProgress size={16} /> : <QrCodeIcon />}
            >
              {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)}>Back</Button>
            <Button
              onClick={handleProceedToPayment}
              variant="contained"
            >
              Proceed to Payment
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Button onClick={() => setActiveStep(1)}>Back</Button>
            <Button
              onClick={checkPaymentStatus}
              variant="outlined"
            >
              Check Status
            </Button>
          </>
        )}

        {activeStep === 3 && (
          <Button
            onClick={handleClose}
            variant="contained"
            color="success"
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UPIPaymentModal;
