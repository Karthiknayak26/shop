import React from 'react';
import './OrderBill.css';

const OrderBill = ({ order, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    // Add print class to body for better print styling
    document.body.classList.add('printing');

    // Use a more robust print method
    const printWindow = window.open('', '_blank');
    const billContent = document.getElementById('bill-content');

    if (printWindow && billContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Order Bill - ${order.orderId || 'ORD-' + order._id.slice(-8)}</title>
          <style>
            @media print {
              @page {
                margin: 0.3cm;
                size: A4 portrait;
              }
              body {
                font-family: Arial, sans-serif;
                line-height: 1.2;
                color: black;
                background: white;
                font-size: 14px;
                margin: 0;
                padding: 0;
              }
              .bill-content {
                padding: 6px;
                max-width: none;
                width: 100%;
                margin: 0;
                height: auto;
                max-height: none;
                page-break-after: avoid;
                page-break-before: avoid;
              }
              .company-header {
                text-align: center;
                margin-bottom: 8px;
                padding: 4px;
                border-bottom: 1px solid #000;
                page-break-inside: avoid;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              .company-tagline, .company-location, .company-contact {
                font-size: 14px;
                margin-bottom: 1px;
              }
              .order-details-grid {
                display: block;
                margin-bottom: 8px;
                page-break-inside: avoid;
              }
              .order-details-section {
                margin-bottom: 4px;
                padding: 3px;
                border: 1px solid #000;
                page-break-inside: avoid;
              }
              .order-details-title {
                font-size: 16px;
                margin-bottom: 3px;
                padding-bottom: 1px;
                border-bottom: 1px solid #000;
                font-weight: bold;
              }
              .order-details-row {
                margin-bottom: 2px;
                padding: 1px 0;
              }
              .order-details-label, .order-details-value {
                font-size: 13px;
              }
              .items-section {
                margin-bottom: 8px;
                page-break-inside: avoid;
              }
              .items-title {
                font-size: 16px;
                margin-bottom: 3px;
                padding-bottom: 1px;
                border-bottom: 1px solid #000;
                font-weight: bold;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 8px;
                font-size: 13px;
                page-break-inside: avoid;
              }
              .items-table th,
              .items-table td {
                border: 1px solid #000;
                padding: 2px 4px;
                text-align: left;
                page-break-inside: avoid;
              }
              .items-table th {
                background-color: #f0f0f0;
                font-weight: bold;
                font-size: 14px;
              }
              .item-image {
                max-width: 20px;
                max-height: 20px;
              }
              .item-name {
                font-weight: 600;
              }
              .item-price, .item-total {
                font-weight: bold;
              }
              .payment-section {
                margin-bottom: 8px;
                page-break-inside: avoid;
              }
              .payment-title {
                font-size: 16px;
                margin-bottom: 3px;
                padding-bottom: 1px;
                border-bottom: 1px solid #000;
                font-weight: bold;
              }
              .payment-container {
                padding: 3px;
              }
              .payment-info-row {
                font-size: 13px;
                margin-bottom: 1px;
              }
              .total-section {
                border-top: 2px solid #000;
                padding: 4px 0;
                margin: 8px 0;
                page-break-inside: avoid;
              }
              .total-label {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              .cod-note {
                font-size: 13px;
              }
              .bill-footer {
                margin-top: 8px;
                padding: 4px;
                border-top: 1px solid #000;
                text-align: center;
                page-break-inside: avoid;
              }
              .footer-thanks, .footer-contact, .footer-note {
                font-size: 13px;
                margin-bottom: 1px;
              }
              .status-badge {
                background: #333;
                color: white;
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: bold;
              }
              img {
                max-width: 20px;
                max-height: 20px;
              }
              * {
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          ${billContent.outerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
      };
    } else {
      // Fallback to regular print if popup is blocked
      window.print();
    }

    // Remove print class
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 1000);
  };

  // Combine items with same name and calculate total quantity
  const getCombinedItems = () => {
    if (!order.items) return [];

    const itemMap = new Map();

    order.items.forEach(item => {
      const key = item.name || item.id;
      if (itemMap.has(key)) {
        const existingItem = itemMap.get(key);
        existingItem.quantity += item.quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        itemMap.set(key, {
          ...item,
          totalPrice: item.price * item.quantity
        });
      }
    });

    return Array.from(itemMap.values());
  };

  return (
    <div className="order-bill-modal">
      <div className="order-bill-container">
        {/* Header */}
        <div className="order-bill-header">
          <h2 className="order-bill-title">Order Bill</h2>
          <div className="order-bill-actions">
            <button
              onClick={handlePrint}
              className="print-button"
            >
              🖨️ Print Bill
            </button>
            <button
              onClick={onClose}
              className="close-button"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="bill-content" id="bill-content">
          {/* Company Header */}
          <div className="company-header">
            <h1 className="company-name">Kandukuru Supermarket</h1>
            <p className="company-tagline">Your Trusted Shopping Destination</p>
            <p className="company-location">📍 Kandukuru, Andhra Pradesh</p>
            <p className="company-contact">📞 +91 98765 43210 | 📧 info@kandukurusupermarket.com</p>
          </div>

          {/* Order Details */}
          <div className="order-details-grid">
            <div className="order-details-section">
              <h3 className="order-details-title">Order Information</h3>
              <div className="order-details-content">
                <div className="order-details-row">
                  <span className="order-details-label">Order ID:</span>
                  <span className="order-details-value">{order.orderId || 'ORD-' + order._id.slice(-8)}</span>
                </div>
                <div className="order-details-row">
                  <span className="order-details-label">Order Date:</span>
                  <span className="order-details-value">{formatDate(order.orderDate)}</span>
                </div>
                <div className="order-details-row">
                  <span className="order-details-label">Status:</span>
                  <span className={`status-badge ${order.status === 'Delivered' ? 'delivered' :
                    order.status === 'Pending' ? 'pending' :
                      order.status === 'Out for Delivery' ? 'out-for-delivery' :
                        'processing'
                    }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="order-details-row">
                  <span className="order-details-label">Payment Method:</span>
                  <span className="order-details-value capitalize">{order.paymentMethod || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="order-details-section">
              <h3 className="order-details-title">Customer Information</h3>
              <div className="order-details-content">
                {order.shippingAddress ? (
                  <>
                    <div className="order-details-row">
                      <span className="order-details-label">Name:</span>
                      <span className="order-details-value">{order.shippingAddress.name}</span>
                    </div>
                    <div className="order-details-row">
                      <span className="order-details-label">Phone:</span>
                      <span className="order-details-value">{order.shippingAddress.phone}</span>
                    </div>
                    <div className="order-details-row">
                      <span className="order-details-label">Email:</span>
                      <span className="order-details-value">{order.shippingAddress.email}</span>
                    </div>
                    <div className="order-details-row">
                      <span className="order-details-label">Address:</span>
                      <span className="order-details-value address-value">
                        {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="no-customer-info">No customer information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="items-section">
            <h3 className="items-title">Order Items</h3>
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {getCombinedItems().map((item, index) => (
                    <tr key={item.id || index}>
                      <td>
                        <div className="item-details">
                          {item.img && (
                            <img
                              src={item.img}
                              alt={item.name}
                              className="item-image"
                            />
                          )}
                          <span className="item-name">{item.name}</span>
                        </div>
                      </td>
                      <td className="item-quantity">
                        {item.quantity}
                      </td>
                      <td className="item-price">
                        ₹{item.price}
                      </td>
                      <td className="item-total">
                        ₹{item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          {order.paymentInfo && order.paymentMethod !== 'cod' && (
            <div className="payment-section">
              <h3 className="payment-title">Payment Information</h3>
              <div className="payment-container">
                <div className="payment-grid">
                  {order.paymentMethod === 'upi' && order.paymentInfo.upiId && (
                    <div className="payment-info-row">
                      <span className="payment-info-label">UPI ID:</span> {order.paymentInfo.upiId}
                    </div>
                  )}
                  {(order.paymentMethod === 'creditCard' || order.paymentMethod === 'debitCard') && order.paymentInfo.cardNumber && (
                    <div className="payment-info-row">
                      <span className="payment-info-label">Card:</span> **** **** **** {order.paymentInfo.cardNumber}
                    </div>
                  )}
                  {(order.paymentMethod === 'creditCard' || order.paymentMethod === 'debitCard') && order.paymentInfo.cardHolderName && (
                    <div className="payment-info-row">
                      <span className="payment-info-label">Card Holder:</span> {order.paymentInfo.cardHolderName}
                    </div>
                  )}
                  {order.paymentInfo.razorpayPaymentId && (
                    <div className="payment-info-row">
                      <span className="payment-info-label">Payment ID:</span> {order.paymentInfo.razorpayPaymentId}
                    </div>
                  )}
                  {order.paymentInfo.paymentStatus && (
                    <div className="payment-info-row">
                      <span className="payment-info-label">Payment Status:</span>
                      <span className={`payment-status-badge ${order.paymentInfo.paymentStatus === 'completed'
                        ? 'completed'
                        : 'pending'
                        }`}>
                        {order.paymentInfo.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="total-section">
            <div className="total-amount">
              <div className="total-container">
                <div className="total-label">
                  Total Amount: ₹{order.totalAmount}
                </div>
                {order.paymentMethod === 'cod' && (
                  <p className="cod-note">To be paid on delivery</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bill-footer">
            <p className="footer-thanks">Thank you for shopping with Kandukuru Supermarket!</p>
            <p className="footer-contact">For any queries, please contact us at +91 98765 43210</p>
            <p className="footer-note">This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBill; 