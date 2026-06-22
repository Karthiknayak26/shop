import React, { useEffect, useState, memo } from 'react';
import { useCart } from '../../MyComponents/Header/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import './FloatingCartButton.css';

const FloatingCartButton = () => {
  const { cartItems, getTotalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isBouncing, setIsBouncing] = useState(false);
  const totalItems = getTotalItems();

  const excludedRoutes = ['/checkout', '/payment', '/order-success', '/order-confirmation'];

  useEffect(() => {
    if (totalItems > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (totalItems === 0 || excludedRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      className={`floating-cart-btn ${isBouncing ? 'bounce' : ''}`}
      onClick={() => navigate('/cart')}
      aria-label={`Cart with ${totalItems} items`}
      tabIndex={0}
    >
      <ShoppingCart className="cart-icon" size={24} />
      <span className="cart-badge">{totalItems}</span>
    </button>
  );
};

export default memo(FloatingCartButton);
