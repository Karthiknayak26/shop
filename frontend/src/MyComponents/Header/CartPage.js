import React from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { IoTrashOutline } from "react-icons/io5";
import { Button } from "@mui/material";
import { useCart } from './CartContext';
import { IoArrowBack } from "react-icons/io5";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button
          className="back-button"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          <IoArrowBack />
        </button>
        <h2>Your Cart</h2>
      </div>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>Your cart is empty!</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <img
                  src={item.img}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price}</p>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="item-total">Total: ₹{item.price * item.quantity}</p>
                </div>
              </div>
              <button
                className="remove-button"
                onClick={() => handleRemoveItem(item.id)}
                aria-label="Remove item"
              >
                <IoTrashOutline />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <div className="summary-details">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{getTotalPrice()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{getTotalPrice()}</span>
          </div>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/checkout')}
          fullWidth
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartPage;