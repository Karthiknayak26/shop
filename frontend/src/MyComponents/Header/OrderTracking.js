import React, { useState } from 'react';
import './OrderTracking.css';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaTruck } from "react-icons/fa";

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderDetails(null);

    try {
      // Replace this URL with your backend endpoint for order tracking
      const response = await fetch(`http:/\/localhost:5000/api/orders/track/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found. Please check your Order ID.');
      }
      const data = await response.json();
      setOrderDetails(data);
      console.log('Order Details:', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="fab-home"
        aria-label="Go back to home"
      >
        <Home className="h-6 w-6" />
      </button>
      <div className="order-tracking">
        <h1>Track Your Order</h1>
        <form onSubmit={handleTrackOrder} className="tracking-form">
          <label htmlFor="order-id">Enter your Order ID:</label>
          <input
            type="text"
            id="order-id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {orderDetails && (
          <div className="order-details">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
            <p><strong>Status:</strong> {orderDetails.status}</p>
            <p><strong>Items:</strong></p>
            <ul>
              {orderDetails.items.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.quantity} x ₹{item.price}
                </li>
              ))}
            </ul>
            <p><strong>Total Amount:</strong> ₹{orderDetails.totalAmount}</p>
            <p>
              <strong>Expected Delivery:</strong>{' '}
              {orderDetails.expectedDelivery
                ? new Date(orderDetails.expectedDelivery).toLocaleDateString()
                : orderDetails.status === 'Out for Delivery' && orderDetails.outForDeliveryDate
                  ? new Date(orderDetails.outForDeliveryDate).toLocaleDateString()
                  : orderDetails.deliveryDate
                    ? new Date(orderDetails.deliveryDate).toLocaleDateString()
                    : 'N/A'}
            </p>
          </div>
        )}
        {orderDetails && (
          <div className="order-tracking-container" style={{ margin: "2rem 0" }}>
            <div style={{ display: "flex", alignItems: "center", position: "relative", height: 60 }}>
              {/* Progress Bar */}
              <div style={{
                position: "absolute",
                top: 28,
                left: 40,
                right: 40,
                height: 6,
                background: "#e0e0e0",
                borderRadius: 3,
                zIndex: 1
              }} />
              {/* Stages */}
              <div style={{ display: "flex", width: "100%", justifyContent: "space-between", zIndex: 2 }}>
                <div style={{ textAlign: "center", width: "50%" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: orderDetails.status === "Pending" || orderDetails.status === "Out for Delivery" ? "#4caf50" : "#e0e0e0",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
                  }}>1</div>
                  <div>Order Placed</div>
                </div>
                <div style={{ textAlign: "center", width: "50%" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: orderDetails.status === "Out for Delivery" ? "#4caf50" : "#e0e0e0",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
                  }}>2</div>
                  <div>Out for Delivery</div>
                </div>
              </div>
              {/* Truck Icon */}
              <FaTruck
                size={36}
                style={{
                  position: "absolute",
                  top: 10,
                  left: orderDetails.status === "Pending" ? 40 : "calc(100% - 76px)",
                  color: "#2196f3",
                  transition: "left 0.7s cubic-bezier(.4,2.08,.55,.44)"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
