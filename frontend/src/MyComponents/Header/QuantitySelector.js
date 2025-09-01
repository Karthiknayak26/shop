import React, { useState } from 'react';
import './QuantitySelector.css';

const QuantitySelector = ({ product, onAddToCart, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    onClose();
  };

  return (
    <div className="quantity-selector-overlay">
      <div className="quantity-selector-modal">
        <div className="quantity-selector-header">
          <h3>Select Quantity</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="product-info">
          <img src={product.img} alt={product.name} />
          <div>
            <h4>{product.name}</h4>
            <p className="price">₹{product.price}</p>
          </div>
        </div>

        <div className="quantity-controls">
          <label>Quantity:</label>
          <div className="quantity-input-group">
            <button
              className="quantity-btn"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
            <button
              className="quantity-btn"
              onClick={handleIncrement}
            >
              +
            </button>
          </div>
        </div>

        <div className="quantity-selector-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart ({quantity})
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySelector; 