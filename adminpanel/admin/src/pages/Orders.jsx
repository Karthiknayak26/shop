import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import OrderBill from '../components/OrderBill';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="orders-container fade-in">
      <div className="orders-header slide-up">
        <h2 className="orders-title">Recent Orders</h2>
      </div>

      {loading && <p className="loading-state">Loading...</p>}
      {error && <p className="error-state">{error}</p>}

      {!loading && !error && (
        <div className="orders-table-container slide-up">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Shipping Address</th>
                <th>Items (Qty)</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Out for Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr
                    className="interactive-element"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <td><span className="order-id">{order.orderId ? order.orderId : 'ORD-UNKNOWN'}</span></td>
                    <td><span className="customer-info">{order.shippingAddress?.name || 'N/A'}</span></td>
                    <td>
                      <div className="shipping-address">
                        {order.shippingAddress ? (
                          <>
                            <div className="address-line">{order.shippingAddress.address}</div>
                            <div className="address-line">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                            <div className="contact-info">Phone: {order.shippingAddress.phone}</div>
                          </>
                        ) : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="items-list">
                        {order.items?.slice(0, 2).map(item => (
                          <div key={item.id} className="item-row">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="more-items">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>
                    <td><span className="amount">₹{order.totalAmount}</span></td>
                    <td>
                      {order.paymentMethod === 'cod' ? (
                        <span className="payment-badge cod">
                          💳 COD
                        </span>
                      ) : order.paymentMethod === 'creditCard' ? (
                        <span className="payment-badge credit">
                          💳 Credit
                        </span>
                      ) : order.paymentMethod === 'debitCard' ? (
                        <span className="payment-badge debit">
                          💳 Debit
                        </span>
                      ) : order.paymentMethod === 'upi' ? (
                        <span className="payment-badge upi">
                          📱 UPI
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {order.paymentMethod || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${order.status === 'Delivered'
                          ? 'delivered'
                          : order.status === 'Pending'
                            ? 'pending'
                            : 'processing'
                          }`}
                      >
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td><span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span></td>
                    <td>
                      <input
                        type="checkbox"
                        className="delivery-checkbox"
                        checked={order.status === 'Out for Delivery'}
                        disabled={order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Cancelled'}
                        onChange={async (e) => {
                          e.stopPropagation();
                          if (order.status !== 'Out for Delivery') {
                            try {
                              const res = await api.put(`/orders/${order._id}/out-for-delivery`);
                              setOrders((prev) => prev.map(o =>
                                o._id === order._id ? { ...o, ...res.data } : o
                              ));
                            } catch {
                              alert('Failed to update order status');
                            }
                          }
                        }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderForBill(order);
                        }}
                        className="action-button"
                      >
                        🖨️ Print Bill
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr className="expanded-order">
                      <td colSpan="10">
                        <div className="expanded-content">
                          <div className="expanded-section">
                            <h3>Order Items</h3>
                            <div className="order-items-grid">
                              {order.items?.map(item => (
                                <div key={item.id} className="order-item-card">
                                  <div className="flex items-start">
                                    {item.img && (
                                      <img
                                        src={item.img}
                                        alt={item.name}
                                        className="item-image"
                                      />
                                    )}
                                    <div className="item-details">
                                      <h4>{item.name}</h4>
                                      <div className="flex justify-between mt-1">
                                        <span className="item-price">Price: ₹{item.price}</span>
                                        <span className="item-quantity">Qty: {item.quantity}</span>
                                      </div>
                                      <div className="mt-1 item-total">
                                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="expanded-section">
                            <h3>Shipping Details</h3>
                            <div className="shipping-details">
                              {order.shippingAddress ? (
                                <div>
                                  <div><span className="label">Name:</span> <span className="value">{order.shippingAddress.name}</span></div>
                                  <div><span className="label">Email:</span> <span className="value">{order.shippingAddress.email}</span></div>
                                  <div><span className="label">Phone:</span> <span className="value">{order.shippingAddress.phone}</span></div>
                                  <div><span className="label">Address:</span> <span className="value">{order.shippingAddress.address}</span></div>
                                  <div><span className="label">City:</span> <span className="value">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</span></div>
                                </div>
                              ) : (
                                <p>No shipping information available</p>
                              )}
                            </div>
                            <div className="payment-info">
                              <h4 className="font-medium mb-2">Payment Method</h4>
                              <div className="payment-method-badge">
                                {order.paymentMethod === 'cod' ? (
                                  <span className="payment-badge cod">
                                    💳 Cash on Delivery (COD)
                                  </span>
                                ) : order.paymentMethod === 'creditCard' ? (
                                  <span className="payment-badge credit">
                                    💳 Credit Card
                                  </span>
                                ) : order.paymentMethod === 'debitCard' ? (
                                  <span className="payment-badge debit">
                                    💳 Debit Card
                                  </span>
                                ) : order.paymentMethod === 'upi' ? (
                                  <span className="payment-badge upi">
                                    📱 UPI Payment
                                  </span>
                                ) : (
                                  order.paymentMethod || 'Not specified'
                                )}
                              </div>
                              {order.paymentMethod === 'cod' && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Customer will pay in cash upon delivery
                                </p>
                              )}
                              {order.paymentInfo && order.paymentMethod !== 'cod' && (
                                <div className="payment-details">
                                  {order.paymentMethod === 'upi' && order.paymentInfo.upiId && (
                                    <p>UPI ID: {order.paymentInfo.upiId}</p>
                                  )}
                                  {(order.paymentMethod === 'creditCard' || order.paymentMethod === 'debitCard') && order.paymentInfo.cardNumber && (
                                    <p>Card ending in {order.paymentInfo.cardNumber}</p>
                                  )}
                                  {(order.paymentMethod === 'creditCard' || order.paymentMethod === 'debitCard') && order.paymentInfo.cardHolderName && (
                                    <p>Card Holder: {order.paymentInfo.cardHolderName}</p>
                                  )}
                                  {order.paymentInfo.razorpayPaymentId && (
                                    <p>Payment ID: {order.paymentInfo.razorpayPaymentId}</p>
                                  )}
                                  {order.paymentInfo.paymentStatus && (
                                    <p>Payment Status:
                                      <span className={`ml-1 px-2 py-1 rounded text-xs ${order.paymentInfo.paymentStatus === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.paymentInfo.paymentStatus}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="10" className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p>No orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Modal */}
      {selectedOrderForBill && (
        <OrderBill
          order={selectedOrderForBill}
          onClose={() => setSelectedOrderForBill(null)}
        />
      )}
    </div>
  );
};

export default Orders;