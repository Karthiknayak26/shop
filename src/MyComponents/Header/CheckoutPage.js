import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";
import { Button, TextField } from "@mui/material";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product 1", price: 100, quantity: 1 },
    { id: 2, name: "Product 2", price: 200, quantity: 2 },
  ]);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePlaceOrder = () => {
    // Process the order, you can send data to a backend here
    console.log("Order placed:", { shippingAddress, cartItems, paymentMethod });
    navigate("/order-confirmation");
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="order-items">
          {cartItems.map((item) => (
            <div key={item.id} className="order-item">
              <p>{item.name}</p>
              <p>{item.price} x {item.quantity}</p>
            </div>
          ))}
        </div>
        <p>Total: ${getTotalPrice()}</p>
      </div>

      <div className="shipping-info">
        <h3>Shipping Information</h3>
        <TextField
          label="Full Name"
          variant="outlined"
          name="name"
          value={shippingAddress.name}
          onChange={handleAddressChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          name="email"
          value={shippingAddress.email}
          onChange={handleAddressChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Address"
          variant="outlined"
          name="address"
          value={shippingAddress.address}
          onChange={handleAddressChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="City"
          variant="outlined"
          name="city"
          value={shippingAddress.city}
          onChange={handleAddressChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Postal Code"
          variant="outlined"
          name="postalCode"
          value={shippingAddress.postalCode}
          onChange={handleAddressChange}
          fullWidth
          margin="normal"
        />
      </div>

      <div className="payment-method">
        <h3>Payment Method</h3>
        <div>
          <input
            type="radio"
            id="creditCard"
            value="creditCard"
            checked={paymentMethod === "creditCard"}
            onChange={handlePaymentChange}
          />
          <label htmlFor="creditCard">Credit Card</label>
        </div>
        <div>
          <input
            type="radio"
            id="paypal"
            value="paypal"
            checked={paymentMethod === "paypal"}
            onChange={handlePaymentChange}
          />
          <label htmlFor="paypal">PayPal</label>
        </div>
        <div>
          <input
            type="radio"
            id="cashOnDelivery"
            value="cashOnDelivery"
            checked={paymentMethod === "cashOnDelivery"}
            onChange={handlePaymentChange}
          />
          <label htmlFor="cashOnDelivery">Cash on Delivery</label>
        </div>
      </div>

      <div className="checkout-buttons">
        <Button variant="contained" color="primary" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
