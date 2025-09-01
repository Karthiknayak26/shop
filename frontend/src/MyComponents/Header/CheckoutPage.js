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
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import { useCart } from './CartContext';
import { useUser } from './UserContext';
import PaymentService from '../../services/paymentService';
import UPIPaymentModal from './UPIPaymentModal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useUser();
  const [errors, setErrors] = useState({});
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);

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
  const [showUPIModal, setShowUPIModal] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Load user's saved shipping address if logged in
  useEffect(() => {
    const loadUserAddress = async () => {
      if (user?.user?.id) {
        setIsLoadingAddress(true);
        try {
          const response = await fetch(`https://shop-backend-92zc.onrender.com/api/auth/${user.user.id}/shipping-address`);
          if (response.ok) {
            const data = await response.json();
            if (data.shippingAddress && Object.values(data.shippingAddress).some(value => value)) {
              setShippingAddress(data.shippingAddress);
            }
          } else {
            console.warn('Failed to load user address:', response.status);
          }
        } catch (error) {
          console.error('Error loading user address:', error);
        } finally {
          setIsLoadingAddress(false);
        }
      }
    };

    loadUserAddress();
  }, [user]);

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

      // Save shipping address if user is logged in and checkbox is checked
      if (user?.id && saveAddress) {
        try {
          const response = await fetch(`https://shop-backend-92zc.onrender.com/api/auth/${user.id}/shipping-address`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shippingAddress }),
          });

          if (!response.ok) {
            console.warn('Failed to save shipping address:', response.status);
          }
        } catch (error) {
          console.error('Error saving shipping address:', error);
        }
      }

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

          const response = await fetch('https://shop-backend-92zc.onrender.com/api/orders', {
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
                orderData: result.order, // Use the order object returned from backend
                orderId: result.order._id // Pass the real order ID
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
            // Show UPI payment modal instead of direct processing
            setShowUPIModal(true);
            setIsProcessingPayment(false); // Reset processing state
            return;
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

  // Handle UPI payment success
  const handleUPIPaymentSuccess = (paymentResult) => {
    if (paymentResult.success) {
      if (paymentResult.demo) {
        alert("🧪 Demo UPI Payment processed successfully! Your order has been placed. (This was a demo payment - no real money was charged)");
      } else {
        alert("UPI Payment processed successfully! Your order has been placed.");
      }
      navigate("/order-confirmation", {
        state: {
          orderData: paymentResult.orderData,
          orderId: paymentResult.orderId,
          paymentId: paymentResult.paymentId,
          upiId: paymentResult.upiId
        }
      });
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
            {isLoadingAddress && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
                <CircularProgress size={20} style={{ marginRight: '10px' }} />
                <span>Loading your saved address...</span>
              </div>
            )}
            {user?.user?.id && !isLoadingAddress && (
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '6px' }}>
                <strong>✅ Logged in as {user.user.name}</strong>
                <div style={{ fontSize: '14px', color: '#2e7d32', marginTop: '4px' }}>
                  Your saved shipping information has been auto-filled. You can modify it below or save changes for future orders.
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    Manage Addresses
                  </Button>
                </div>
              </div>
            )}
            <TextField fullWidth margin="normal" label="Full Name" name="name" value={shippingAddress.name} onChange={handleAddressChange} error={!!errors.name} helperText={errors.name} />
            <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={shippingAddress.email} onChange={handleAddressChange} error={!!errors.email} helperText={errors.email} />
            <TextField fullWidth margin="normal" label="Address" name="address" value={shippingAddress.address} onChange={handleAddressChange} error={!!errors.address} helperText={errors.address} />
            <TextField fullWidth margin="normal" label="City" name="city" value={shippingAddress.city} onChange={handleAddressChange} error={!!errors.city} helperText={errors.city} />
            <TextField fullWidth margin="normal" label="Postal Code" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} error={!!errors.postalCode} helperText={errors.postalCode} />
            <TextField fullWidth margin="normal" label="Phone Number" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} error={!!errors.phone} helperText={errors.phone} />

            {user?.user?.id && (
              <div className="save-address-checkbox">
                <MuiFormControlLabel
                  control={
                    <Checkbox
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Save this address for future orders"
                />
              </div>
            )}

            {/* Payment Method Section */}
            <div className="payment-section">
              <FormControl component="fieldset" margin="normal" className="payment-method-radio">
                <FormLabel component="legend">
                  Payment Method
                </FormLabel>
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
            </div>

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
                  📱 UPI Payment
                  <span style={{
                    fontSize: '12px',
                    color: '#e67e22',
                    marginLeft: '10px',
                    backgroundColor: '#fff3cd',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    🔒 Real UPI Integration
                  </span>
                </h4>
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#e8f5e8',
                  border: '1px solid #4caf50',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#2e7d32'
                }}>
                  <strong>📱 Enhanced UPI Payment:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Real UPI ID validation</li>
                    <li>QR code generation for easy payment</li>
                    <li>Live payment status tracking</li>
                    <li>Support for all UPI apps (Google Pay, PhonePe, Paytm, etc.)</li>
                  </ul>
                  Click "Place Order" to open the UPI payment interface.
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
              style={{ marginBottom: '10px' }}
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

      {/* UPI Payment Modal */}
      <UPIPaymentModal
        open={showUPIModal}
        onClose={() => setShowUPIModal(false)}
        amount={calculateTotal()}
        orderData={{
          items: cartItems,
          shippingAddress,
          paymentMethod,
          paymentInfo: { upiId: '' },
          totalAmount: calculateTotal(),
          orderDate: new Date().toISOString(),
          user: user?.user?.id
        }}
        onPaymentSuccess={handleUPIPaymentSuccess}
      />


    </div>
  );
};

export default CheckoutPage;
