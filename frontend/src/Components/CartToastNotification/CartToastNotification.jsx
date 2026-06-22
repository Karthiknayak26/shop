import React, { memo } from 'react';
import { useCart } from '../../MyComponents/Header/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartToastNotification.css';

const CartToastNotification = () => {
  const { toastInfo, hideCartToast } = useCart();
  const navigate = useNavigate();

  if (!toastInfo?.show) {
    return null;
  }

  const handleGoToCart = () => {
    hideCartToast();
    navigate('/cart');
  };

  return (
    <div className="cart-toast-overlay" onClick={hideCartToast}>
      <div className="cart-toast-container slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="cart-toast-message">
          <span className="success-icon">✓</span>
          {toastInfo.message || 'Product Added To Cart'}
        </div>
        <div className="cart-toast-actions">
          <button className="continue-btn" onClick={hideCartToast}>
            Continue Shopping
          </button>
          <button className="go-cart-btn" onClick={handleGoToCart}>
            Go To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CartToastNotification);
