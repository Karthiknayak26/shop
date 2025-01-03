import React from "react";
import { useNavigate } from "react-router-dom";
import "./OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  // Example order details (you would typically fetch this from your backend or context)
  const orderDetails = {
    orderId: "ORD123456",
    cartItems: [
      { id: 1, name: "Product 1", price: 100, quantity: 1 },
      { id: 2, name: "Product 2", price: 200, quantity: 2 },
    ],
    shippingAddress: {
      name: "John Doe",
      email: "johndoe@example.com",
      address: "123 Main St, City, Country",
      postalCode: "12345",
    },
    paymentMethod: "Credit Card",
    totalPrice: 500,
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="confirmation-container">
      <h2>Thank You for Your Order!</h2>
      <p>Your order has been successfully placed. You will receive an email confirmation shortly.</p>

      <div className="order-summary">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> {orderDetails.orderId}</p>

        <h4>Items Purchased</h4>
        <ul>
          {orderDetails.cartItems.map(item => (
            <li key={item.id}>
              {item.name} - ${item.price} x {item.quantity}
            </li>
          ))}
        </ul>

        <p><strong>Shipping Address:</strong></p>
        <p>{orderDetails.shippingAddress.name}</p>
        <p>{orderDetails.shippingAddress.email}</p>
        <p>{orderDetails.shippingAddress.address}</p>
        <p>{orderDetails.shippingAddress.postalCode}</p>

        <p><strong>Payment Method:</strong> {orderDetails.paymentMethod}</p>

        <p><strong>Total Price:</strong> ${orderDetails.totalPrice}</p>
      </div>

      <div className="confirmation-buttons">
        <button className="return-button" onClick={handleReturnHome}>
          Return to Homepage
        </button>
        <button className="shop-more-button" onClick={() => navigate("/")} >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
