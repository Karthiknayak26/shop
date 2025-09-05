import React, { useEffect, useState } from 'react';
import './order-history.css';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';



const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null); // For details modal
  const [modalOpen, setModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const navigate = useNavigate();

  // Assume user info is stored in localStorage after login
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) {
      setError('You must be logged in to view your order history.');
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await fetch(`https://shop-backend-92zc.onrender.com/api/orders/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const handleFilterChange = (e) => setFilter(e.target.value);

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(order => order.status === filter);

  const openModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCanceling(true);
    try {
      const response = await fetch(`https://shop-backend-92zc.onrender.com/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to cancel order');
      // Update order status in UI
      setOrders(orders => orders.map(order =>
        order._id === orderId ? { ...order, status: 'Cancelled' } : order
      ));
      closeModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <div>Loading order history...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="table-responsive-wrapper">
      <div className="order-history-container">
        <button
          onClick={() => navigate('/')}
          className="fab-home"
          aria-label="Go back to home"
        >
          <Home className="h-6 w-6" />
        </button>
        <h2 className="order-history-title">Order History</h2>
        <div className="filter-container">
          <label>Status Filter: </label>
          <select value={filter} onChange={handleFilterChange} className="filter-select">
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        {filteredOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td>{order.orderId ? order.orderId : 'ORD-UNKNOWN'}</td>
                  <td>{new Date(order.orderDate).toLocaleString()}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>{order.status}</td>
                  <td>
                    <button onClick={() => openModal(order)}>View Details</button>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button
                        className="button-margin"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={canceling}
                      >
                        {canceling ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Order Details Modal */}
        {modalOpen && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Order Details</h3>
              <p><b>Order ID:</b> {selectedOrder.orderId ? selectedOrder.orderId : 'ORD-UNKNOWN'}</p>
              <p><b>Order Date:</b> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
              <p><b>Status:</b> {selectedOrder.status}</p>
              <p><b>Total Amount:</b> ₹{selectedOrder.totalAmount}</p>
              <p><b>Shipping Address:</b><br />
                {selectedOrder.shippingAddress.name}, {selectedOrder.shippingAddress.email}<br />
                {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                Phone: {selectedOrder.shippingAddress.phone}
              </p>
              <p><b>Payment Method:</b> {selectedOrder.paymentMethod}</p>
              <div>
                <b>Items:</b>
                <ul>
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>{item.name} x {item.quantity} (₹{item.price} each)</li>
                  ))}
                </ul>
              </div>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;