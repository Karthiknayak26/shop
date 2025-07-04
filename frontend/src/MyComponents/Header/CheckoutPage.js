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
} from "@mui/material";
import { useCart } from './CartContext';

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

  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const validateForm = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  };

  const handlePlaceOrder = async () => {
    if (validateForm()) {
      const orderData = {
        items: cartItems,
        shippingAddress,
        paymentMethod,
        totalAmount: calculateTotal(),
        orderDate: new Date().toISOString(),
      };

      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        const result = await response.json(); // Parse the JSON response

        if (response.ok) {
          // Pass both orderData and the MongoDB _id to the confirmation page
          navigate("/order-confirmation", {
            state: {
              orderData,
              orderId: result.orderId // Assuming backend returns { orderId: _id }
            }
          });
        } else {
          console.error('❌ Failed to place order:', result.error);
          alert(`Order failed: ${result.error || 'Try again.'}`);
        }
      } catch (err) {
        console.error('❌ Network error:', err);
        alert("Order failed due to network error.");
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

            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup name="paymentMethod" value={paymentMethod} onChange={handlePaymentChange}>
                <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" />
                <FormControlLabel value="debitCard" control={<Radio />} label="Debit Card" />
                <FormControlLabel value="upi" control={<Radio />} label="UPI" />
              </RadioGroup>
            </FormControl>
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
            <Button variant="contained" color="primary" onClick={handlePlaceOrder} fullWidth size="large">
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;