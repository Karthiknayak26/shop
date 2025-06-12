import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OrderConfirmationPage.css";
import { Button, Typography, Divider, Box } from "@mui/material";
import { ShoppingBag, Home } from "@mui/icons-material";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const data = location.state?.orderData || JSON.parse(localStorage.getItem("orderData"));
    if (data) {
      setOrderData(data);
    } else {
      navigate("/"); // If no data, redirect to home
    }
  }, [location, navigate]);

  if (!orderData) return null;

  const orderId = `ORD${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

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
            <Typography variant="body2">Order ID: {orderId}</Typography>
            <Typography variant="body2">Placed on: {formatDate(orderData.orderDate)}</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
            <Typography variant="body1">{orderData.shippingAddress.name}</Typography>
            <Typography variant="body2">{orderData.shippingAddress.email}</Typography>
            <Typography variant="body2">{orderData.shippingAddress.address}</Typography>
            <Typography variant="body2">{orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}</Typography>
            <Typography variant="body2">Phone: {orderData.shippingAddress.phone}</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Payment Method</Typography>
            <Typography variant="body1">
              {orderData.paymentMethod.replace(/([A-Z])/g, " $1").trim()}
            </Typography>
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
                    <p>₹{item.price} x {item.quantity}</p>
                  </div>
                </div>
                <p className="item-total">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row"><span>Subtotal:</span><span>₹{orderData.totalAmount}</span></div>
            <div className="total-row"><span>Shipping:</span><span>Free</span></div>
            <div className="total-row grand-total"><span>Total:</span><span>₹{orderData.totalAmount}</span></div>
          </div>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", mt: 4 }}>
            <Button variant="contained" startIcon={<Home />} onClick={() => navigate("/")} fullWidth>
              Return Home
            </Button>
            <Button variant="outlined" startIcon={<ShoppingBag />} onClick={() => navigate("/products")} fullWidth>
              Continue Shopping
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
