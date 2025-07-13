import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Order ID</th>
                <th className="text-left px-4 py-2">Customer</th>
                <th className="text-left px-4 py-2">Shipping Address</th>
                <th className="text-left px-4 py-2">Items (Qty)</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Payment</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr
                    className="border-t hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <td className="px-4 py-2">{order._id.substring(0, 8)}...</td>
                    <td className="px-4 py-2">{order.shippingAddress?.name || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs text-sm">
                        {order.shippingAddress ? (
                          <>
                            <div>{order.shippingAddress.address}</div>
                            <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                            <div>Phone: {order.shippingAddress.phone}</div>
                          </>
                        ) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs">
                        {order.items?.slice(0, 2).map(item => (
                          <div key={item.id} className="flex justify-between">
                            <span className="truncate">{item.name}</span>
                            <span className="font-semibold ml-2">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="text-gray-500 text-sm">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">₹{order.totalAmount}</td>
                    <td className="px-4 py-2">
                      {order.paymentMethod === 'cod' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          💳 COD
                        </span>
                      ) : order.paymentMethod === 'creditCard' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          💳 Credit
                        </span>
                      ) : order.paymentMethod === 'debitCard' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          💳 Debit
                        </span>
                      ) : order.paymentMethod === 'upi' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          📱 UPI
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {order.paymentMethod || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 text-sm rounded-full text-white font-medium ${order.status === 'Delivered'
                          ? 'bg-green-500'
                          : order.status === 'Pending'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                          }`}
                      >
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="8" className="px-4 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div className="space-y-4">
                            <h3 className="font-bold text-lg">Order Items</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {order.items?.map(item => (
                                <div key={item.id} className="border p-3 rounded-lg bg-white shadow-sm">
                                  <div className="flex items-start">
                                    {item.img && (
                                      <img
                                        src={item.img}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded mr-3"
                                      />
                                    )}
                                    <div>
                                      <h4 className="font-medium">{item.name}</h4>
                                      <div className="flex justify-between mt-1">
                                        <span>Price: ₹{item.price}</span>
                                        <span className="font-semibold">Qty: {item.quantity}</span>
                                      </div>
                                      <div className="mt-1 font-semibold">
                                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Shipping Details</h3>
                            <div className="bg-white p-4 rounded-lg shadow-sm mt-2">
                              {order.shippingAddress ? (
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Name:</span> {order.shippingAddress.name}
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span> {order.shippingAddress.email}
                                  </div>
                                  <div>
                                    <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
                                  </div>
                                  <div>
                                    <span className="font-medium">Address:</span> {order.shippingAddress.address}
                                  </div>
                                  <div>
                                    <span className="font-medium">City:</span> {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                  </div>
                                </div>
                              ) : (
                                <p>No shipping information available</p>
                              )}
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                              <h4 className="font-medium mb-2">Payment Method</h4>
                              <p>
                                {order.paymentMethod === 'cod' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    💳 Cash on Delivery (COD)
                                  </span>
                                ) : order.paymentMethod === 'creditCard' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    💳 Credit Card
                                  </span>
                                ) : order.paymentMethod === 'debitCard' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    💳 Debit Card
                                  </span>
                                ) : order.paymentMethod === 'upi' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    📱 UPI Payment
                                  </span>
                                ) : (
                                  order.paymentMethod || 'Not specified'
                                )}
                              </p>
                              {order.paymentMethod === 'cod' && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Customer will pay in cash upon delivery
                                </p>
                              )}
                              {order.paymentInfo && order.paymentMethod !== 'cod' && (
                                <div className="mt-2 text-sm text-gray-600">
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
                  <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;