import React, { useState } from 'react';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderDetails(null);

    try {
      // Replace this URL with your backend endpoint for order tracking
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found. Please check your Order ID.');
      }
      const data = await response.json();
      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <p><strong>Order ID:</strong> {orderDetails.id}</p>
          <p><strong>Status:</strong> {orderDetails.status}</p>
          <p><strong>Items:</strong></p>
          <ul>
            {orderDetails.items.map((item, index) => (
              <li key={index}>
                {item.name} - {item.quantity} x ${item.price}
              </li>
            ))}
          </ul>
          <p><strong>Total Amount:</strong> ${orderDetails.total}</p>
          <p><strong>Expected Delivery:</strong> {orderDetails.deliveryDate}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
