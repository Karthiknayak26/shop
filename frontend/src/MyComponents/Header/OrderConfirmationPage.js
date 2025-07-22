import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OrderConfirmationPage.css";
import { Button, Typography, Divider, Box } from "@mui/material";
import { ShoppingBag, Home } from "@mui/icons-material";
import { useCart } from "./CartContext";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const data = location.state?.orderData || JSON.parse(localStorage.getItem("orderData"));
    const payment = location.state?.paymentId;

    if (data) {
      setOrderData(data);
      setPaymentId(payment);
      // Clear the cart when order confirmation page is displayed
      clearCart();
    } else {
      navigate("/"); // If no data, redirect to home
    }
  }, [location, navigate, clearCart]);

  if (!orderData) return null;

  // Use the MongoDB _id for a consistent Order ID display
  const getOrderId = () => {
    if (orderData.orderId) {
      return orderData.orderId;
    }
    return "ORD-UNKNOWN";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="checkout-container">
      <h2>Order Confirmation</h2>
      <div className="checkout-grid">
        <div className="shipping-form">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Order Details</Typography>
            <Typography variant="body1" color="success.main" gutterBottom>
              Thank you for your purchase!
            </Typography>
            <Typography variant="body2">Order ID: {getOrderId()}</Typography>
            <Typography variant="body2">Placed on: {formatDate(orderData.orderDate)}</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
            <Typography variant="body1">{orderData.shippingAddress.name}</Typography>
            <Typography variant="body2">{orderData.shippingAddress.email}</Typography>
            <Typography variant="body2">{orderData.shippingAddress.address}</Typography>
            <Typography variant="body2">
              {orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}
            </Typography>
            <Typography variant="body2">Phone: {orderData.shippingAddress.phone}</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Payment Method</Typography>
            <Typography variant="body1">
              {orderData.paymentMethod === 'cod' ? (
                <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
                  💳 Cash on Delivery (COD)
                </span>
              ) : orderData.paymentMethod === 'creditCard' ? (
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  💳 Credit Card
                </span>
              ) : orderData.paymentMethod === 'debitCard' ? (
                <span style={{ color: '#2196f3', fontWeight: 'bold' }}>
                  💳 Debit Card
                </span>
              ) : orderData.paymentMethod === 'upi' ? (
                <span style={{ color: '#9c27b0', fontWeight: 'bold' }}>
                  📱 UPI Payment
                </span>
              ) : (
                orderData.paymentMethod.replace(/([A-Z])/g, " $1").trim()
              )}
            </Typography>
            {orderData.paymentMethod === 'cod' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please have the exact amount ready when your order is delivered.
              </Typography>
            )}
            {orderData.paymentInfo && orderData.paymentMethod !== 'cod' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {orderData.paymentMethod === 'upi' && orderData.paymentInfo.upiId && (
                  <>UPI ID: {orderData.paymentInfo.upiId}</>
                )}
                {(orderData.paymentMethod === 'creditCard' || orderData.paymentMethod === 'debitCard') && orderData.paymentInfo.cardNumber && (
                  <>Card ending in {orderData.paymentInfo.cardNumber}</>
                )}
                {paymentId && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Payment ID:</strong> {paymentId}
                  </div>
                )}
                {orderData.paymentInfo.paymentStatus && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Status:</strong>
                    <span style={{
                      color: orderData.paymentInfo.paymentStatus === 'completed' ? '#4caf50' : '#ff9800',
                      marginLeft: '4px'
                    }}>
                      {orderData.paymentInfo.paymentStatus.charAt(0).toUpperCase() + orderData.paymentInfo.paymentStatus.slice(1)}
                    </span>
                  </div>
                )}
              </Typography>
            )}
          </Box>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-items">
            {orderData.items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <img src={item.img} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
                <p className="item-total">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{orderData.totalAmount}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>₹{orderData.totalAmount}</span>
            </div>
          </div>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate("/")}
              fullWidth
            >
              Return Home
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShoppingBag />}
              onClick={() => navigate("/")}
              fullWidth
            >
              Continue Shopping
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;