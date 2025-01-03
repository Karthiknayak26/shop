import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { IoTrashOutline } from "react-icons/io5";
import { Button } from "@mui/material";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product 1", price: 100, quantity: 1 },
    { id: 2, name: "Product 2", price: 200, quantity: 2 },
  ]);

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>Your cart is empty!</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <p>{item.name}</p>
                <p>{item.price} x {item.quantity}</p>
              </div>
              <button className="remove-button" onClick={() => handleRemoveItem(item.id)}>
                <IoTrashOutline />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <p>Total: ${getTotalPrice()}</p>
        <Button variant="contained" color="primary" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
