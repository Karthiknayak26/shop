import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/material";
import { useCart } from './CartContext';
import PaymentService from '../../services/paymentService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [errors, setErrors] = useState({});

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  const [paymentErrors, setPaymentErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const validateForm = () => {
    const newErrors = {};
    const newPaymentErrors = {};

    // Shipping address validation
    if (!shippingAddress.name.trim()) {
      newErrors.name = "Name is required";
    } else if (shippingAddress.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shippingAddress.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(shippingAddress.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!shippingAddress.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = "City is required";
    }

    const postalCodeRegex = /^\d{6}$/;
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (!postalCodeRegex.test(shippingAddress.postalCode)) {
      newErrors.postalCode = "Invalid postal code";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(shippingAddress.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    // Payment method validation
    if (paymentMethod !== "cod") {
      if (paymentMethod === "creditCard" || paymentMethod === "debitCard") {
        // Card validation
        const cardNumberRegex = /^\d{16}$/;
        if (!paymentDetails.cardNumber.trim()) {
          newPaymentErrors.cardNumber = "Card number is required";
        } else if (!cardNumberRegex.test(paymentDetails.cardNumber.replace(/\s/g, ""))) {
          newPaymentErrors.cardNumber = "Invalid card number (16 digits)";
        }

        if (!paymentDetails.cardHolderName.trim()) {
          newPaymentErrors.cardHolderName = "Card holder name is required";
        } else if (paymentDetails.cardHolderName.length < 2) {
          newPaymentErrors.cardHolderName = "Card holder name must be at least 2 characters";
        }

        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!paymentDetails.expiryDate.trim()) {
          newPaymentErrors.expiryDate = "Expiry date is required";
        } else if (!expiryRegex.test(paymentDetails.expiryDate)) {
          newPaymentErrors.expiryDate = "Invalid expiry date (MM/YY)";
        }

        const cvvRegex = /^\d{3,4}$/;
        if (!paymentDetails.cvv.trim()) {
          newPaymentErrors.cvv = "CVV is required";
        } else if (!cvvRegex.test(paymentDetails.cvv)) {
          newPaymentErrors.cvv = "Invalid CVV (3-4 digits)";
        }
      } else if (paymentMethod === "upi") {
        // UPI validation
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        if (!paymentDetails.upiId.trim()) {
          newPaymentErrors.upiId = "UPI ID is required";
        } else if (!upiRegex.test(paymentDetails.upiId)) {
          newPaymentErrors.upiId = "Invalid UPI ID format (e.g., name@bank)";
        }
      }
    }

    setErrors(newErrors);
    setPaymentErrors(newPaymentErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newPaymentErrors).length === 0;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
    // Clear payment errors when changing payment method
    setPaymentErrors({});
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
    if (paymentErrors[name]) {
      setPaymentErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePlaceOrder = async () => {
    if (validateForm()) {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user ? user.id : null;

      // Prepare payment information based on method
      let paymentInfo = {};
      if (paymentMethod === "creditCard" || paymentMethod === "debitCard") {
        paymentInfo = {
          cardNumber: paymentDetails.cardNumber.replace(/\s/g, "").slice(-4), // Only last 4 digits
          cardHolderName: paymentDetails.cardHolderName,
          cardType: paymentMethod === "creditCard" ? "Credit Card" : "Debit Card"
        };
      } else if (paymentMethod === "upi") {
        paymentInfo = {
          upiId: paymentDetails.upiId
        };
      }

      const orderData = {
        items: cartItems,
        shippingAddress,
        paymentMethod,
        paymentInfo,
        totalAmount: calculateTotal(),
        orderDate: new Date().toISOString(),
        user: userId
      };

      try {
        if (paymentMethod === "cod") {
          // Handle COD order
          setIsProcessingPayment(true);

          const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });

          const result = await response.json();

          if (response.ok) {
            navigate("/order-confirmation", {
              state: {
                orderData,
                orderId: result.orderId
              }
            });
          } else {
            console.error('❌ Failed to place order:', result.error);
            alert(`Order failed: ${result.error || 'Try again.'}`);
          }
        } else {
          // Handle real payment processing
          setIsProcessingPayment(true);

          let paymentResult;

          if (paymentMethod === "creditCard" || paymentMethod === "debitCard") {
            paymentResult = await PaymentService.processCardPayment(calculateTotal(), orderData);
          } else if (paymentMethod === "upi") {
            paymentResult = await PaymentService.processUPIPayment(calculateTotal(), orderData);
          }

          if (paymentResult && paymentResult.success) {
            if (paymentResult.demo) {
              alert("🧪 Demo Payment processed successfully! Your order has been placed. (This was a demo payment - no real money was charged)");
            } else {
              alert("Payment processed successfully! Your order has been placed.");
            }
            navigate("/order-confirmation", {
              state: {
                orderData: paymentResult.orderData,
                orderId: paymentResult.orderId,
                paymentId: paymentResult.paymentId
              }
            });
          }
        }
      } catch (err) {
        console.error('❌ Payment/Order error:', err);
        alert(err.message || "Payment failed. Please try again.");
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };
  return (
    <div className="checkout-container">
      <div className="navigation-buttons">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/cart")}
          className="return-to-cart"
        >
          Back to Cart
        </Button>
      </div>
      <div className="checkout-container">
        <h2>Checkout</h2>
        <div className="checkout-grid">
          <div className="shipping-form">
            <h3>Shipping Information</h3>
            <TextField fullWidth margin="normal" label="Full Name" name="name" value={shippingAddress.name} onChange={handleAddressChange} error={!!errors.name} helperText={errors.name} />
            <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={shippingAddress.email} onChange={handleAddressChange} error={!!errors.email} helperText={errors.email} />
            <TextField fullWidth margin="normal" label="Address" name="address" value={shippingAddress.address} onChange={handleAddressChange} error={!!errors.address} helperText={errors.address} />
            <TextField fullWidth margin="normal" label="City" name="city" value={shippingAddress.city} onChange={handleAddressChange} error={!!errors.city} helperText={errors.city} />
            <TextField fullWidth margin="normal" label="Postal Code" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} error={!!errors.postalCode} helperText={errors.postalCode} />
            <TextField fullWidth margin="normal" label="Phone Number" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} error={!!errors.phone} helperText={errors.phone} />

            <FormControl component="fieldset" margin="normal" className="payment-method-radio">
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup name="paymentMethod" value={paymentMethod} onChange={handlePaymentChange}>
                <FormControlLabel
                  value="cod"
                  control={<Radio />}
                  label={
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#e67e22' }}>Cash on Delivery (COD)</span>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Pay when you receive your order
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="creditCard"
                  control={<Radio />}
                  label={
                    <div>
                      <span>Credit Card</span>
                      <span className="secure-payment-badge">🔒 Secure</span>
                    </div>
                  }
                />
                <FormControlLabel
                  value="debitCard"
                  control={<Radio />}
                  label={
                    <div>
                      <span>Debit Card</span>
                      <span className="secure-payment-badge">🔒 Secure</span>
                    </div>
                  }
                />
                <FormControlLabel
                  value="upi"
                  control={<Radio />}
                  label={
                    <div>
                      <span>UPI</span>
                      <span className="upi-payment-badge">📱 Instant</span>
                    </div>
                  }
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "cod" && (
              <div className="cod-payment-note">
                <strong>💳 Cash on Delivery:</strong> You can pay with cash when your order is delivered.
                Please have the exact amount ready for a smooth delivery experience.
              </div>
            )}

            {(paymentMethod === "creditCard" || paymentMethod === "debitCard") && (
              <div className="card-payment-form">
                <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#2c3e50' }}>
                  {paymentMethod === "creditCard" ? "💳 Credit Card Details" : "💳 Debit Card Details"}
                  <span style={{
                    fontSize: '12px',
                    color: '#e67e22',
                    marginLeft: '10px',
                    backgroundColor: '#fff3cd',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    🧪 Demo Mode
                  </span>
                </h4>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Card Number"
                  name="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setPaymentDetails(prev => ({ ...prev, cardNumber: formatted }));
                  }}
                  error={!!paymentErrors.cardNumber}
                  helperText={paymentErrors.cardNumber}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Card Holder Name"
                  name="cardHolderName"
                  value={paymentDetails.cardHolderName}
                  onChange={handlePaymentDetailsChange}
                  error={!!paymentErrors.cardHolderName}
                  helperText={paymentErrors.cardHolderName}
                  placeholder="John Doe"
                />
                <div style={{ display: 'flex', gap: '15px' }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Expiry Date"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setPaymentDetails(prev => ({ ...prev, expiryDate: formatted }));
                    }}
                    error={!!paymentErrors.expiryDate}
                    helperText={paymentErrors.expiryDate}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="CVV"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handlePaymentDetailsChange}
                    error={!!paymentErrors.cvv}
                    helperText={paymentErrors.cvv}
                    placeholder="123"
                    inputProps={{ maxLength: 4, type: 'password' }}
                  />
                </div>
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#e8f5e8',
                  border: '1px solid #4caf50',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#2e7d32'
                }}>
                  <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and secure.
                  We use industry-standard SSL encryption to protect your data.
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="upi-payment-form">
                <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#2c3e50' }}>
                  📱 UPI Payment Details
                  <span style={{
                    fontSize: '12px',
                    color: '#e67e22',
                    marginLeft: '10px',
                    backgroundColor: '#fff3cd',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    🧪 Demo Mode
                  </span>
                </h4>
                <TextField
                  fullWidth
                  margin="normal"
                  label="UPI ID"
                  name="upiId"
                  value={paymentDetails.upiId}
                  onChange={handlePaymentDetailsChange}
                  error={!!paymentErrors.upiId}
                  helperText={paymentErrors.upiId}
                  placeholder="username@bank"
                />
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1565c0'
                }}>
                  <strong>📱 UPI Payment:</strong> You'll receive a payment request on your UPI app.
                  Please complete the payment to confirm your order.
                </div>
              </div>
            )}
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <img src={item.img} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="item-total">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row"><span>Subtotal:</span><span>₹{calculateTotal()}</span></div>
              <div className="total-row"><span>Shipping:</span><span>Free</span></div>
              <div className="total-row grand-total"><span>Total:</span><span>₹{calculateTotal()}</span></div>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlaceOrder}
              fullWidth
              size="large"
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <CircularProgress size={20} style={{ marginRight: 8, color: 'white' }} />
                  Processing Payment...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;