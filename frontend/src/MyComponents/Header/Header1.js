import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';
// import Search from '../../Components/search/index';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline } from "react-icons/io5";
import { User, Bell, Mail, Settings, Clock, LogOut, ChevronRight, Edit, Lock, Shield, Image, History, Menu, X } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import Navigation from './Navigation/Navigation';
import logo from './1.png';
import './Header1.css';
import { useCart } from './CartContext';
import ProductSearch from '../../Components/ProductSearch';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default function Header1() {
  const { user, setUser } = useUser();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('main');
  const dropdownRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  // Debug: Log user object
  console.log('User in Header1:', user);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch order count when user changes
  useEffect(() => {
    const fetchOrderCount = async () => {
      if (user && user.email) {
        try {
          const response = await fetch(`https://shop-backend-92zc.onrender.com/api/orders/count?email=${user.email}`);
          const data = await response.json();
          setOrderCount(data.count || 0);
        } catch (error) {
          console.error('Error fetching order count:', error);
        }
      }
    };

    fetchOrderCount();
  }, [user]);

  const toggleDropdown = () => {
    if (dropdownOpen) {
      closeDropdown();
    } else {
      setDropdownOpen(true);
      setActivePanel('main');
    }
  };

  const closeDropdown = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setDropdownOpen(false);
      setIsAnimating(false);
      setActivePanel('main');
    }, 200);
  };

  const handleLogout = () => {
    setUser(null); // Clear user context and kandukuru_user/authToken
    clearCart();   // Clear cart context and kandukuru_cart
    localStorage.removeItem('user'); // Remove extra user info
    localStorage.removeItem('kandukuru_cart'); // Remove cart
    localStorage.removeItem('kandukuru_cart_sync'); // Remove cart sync info
    closeDropdown();
    navigate('/login');
  };

  const handleCartClick = () => {
    if (!user) {
      alert('Please login to view your cart');
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const handleOrderHistoryClick = () => {
    if (!user) {
      alert('Please login to view your order history');
      navigate('/login');
    } else {
      navigate('/order-history');
      closeDropdown();
    }
  };

  const navigateTo = (path) => {
    navigate(path);
    closeDropdown();
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'profile':
        return (
          <div className="dropdown-panel">
            <div className="panel-header" onClick={() => setActivePanel('main')}>
              <ChevronRight className="back-icon" />
              <h3>Profile Settings</h3>
            </div>
            <div className="dropdown-item" onClick={() => navigateTo('/profile/edit')}>
              <Edit size={16} />
              <span>Edit Profile</span>
            </div>
            <div className="dropdown-item" onClick={() => navigateTo('/profile/picture')}>
              <Image size={16} />
              <span>Update Photo</span>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="dropdown-panel">
            <div className="panel-header" onClick={() => setActivePanel('main')}>
              <ChevronRight className="back-icon" />
              <h3>Security Settings</h3>
            </div>
            <div className="dropdown-item" onClick={() => navigateTo('/settings/password')}>
              <Lock size={16} />
              <span>Change Password</span>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="dropdown-panel">
            <div className="panel-header" onClick={() => setActivePanel('main')}>
              <ChevronRight className="back-icon" />
              <h3>Preferences</h3>
            </div>
            <div className="dropdown-item" onClick={() => navigateTo('/settings/notifications')}>
              <Bell size={16} />
              <span>Notification Settings</span>
            </div>
            <div className="dropdown-item" onClick={() => navigateTo('/settings/privacy')}>
              <Shield size={16} />
              <span>Privacy Settings</span>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="dropdown-header">
              <div className="user-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.user?.name || user.user?.email || user.user?.id}</div>
                <div className="user-email">{user.user?.email || user.user?.id}</div>
              </div>
              <button
                className="edit-profile-btn"
                onClick={() => navigateTo('/profile')}
              >
                <Edit size={14} />
              </button>
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-item" onClick={() => navigateTo('/profile')}>
              <User size={16} />
              <span>My Profile</span>
            </div>

            <div className="dropdown-item" onClick={handleOrderHistoryClick}>
              <History size={16} />
              <span>My Orders</span>
              {orderCount > 0 && (
                <span className="order-badge">{orderCount}</span>
              )}
            </div>

            {/* Remove the Profile Settings dropdown item */}
            {/* <div className="dropdown-item" onClick={() => setActivePanel('profile')}>
              <Settings size={16} />
              <span>Profile Settings</span>
              <ChevronRight size={16} className="arrow" />
            </div> */}

            <div className="dropdown-item" onClick={() => setActivePanel('security')}>
              <Lock size={16} />
              <span>Security</span>
              <ChevronRight size={16} className="arrow" />
            </div>

            <div className="dropdown-item" onClick={() => setActivePanel('preferences')}>
              <Settings size={16} />
              <span>Preferences</span>
              <ChevronRight size={16} className="arrow" />
            </div>

            <div className="dropdown-divider" />

            <button onClick={handleLogout} className="dropdown-item logout">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </>
        );
    }
  };

  return (
    <div className="header-container">
      <div className="header-top flex items-center">
        <Link to={"/"}>
          <img src={logo} alt="kukuu" className="logo" />
        </Link>

        {/* Mobile menu toggle */}
        <div className="mobile-menu-toggle md:hidden">
          <IconButton
            aria-label="menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="menu-icon"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </IconButton>
        </div>

        <div className="search-wrapper" style={{ padding: '10px 0', zIndex: 20, flex: 1, minWidth: 0 }}>
          <ProductSearch />
        </div>

        <div className={`header-actions ${mobileMenuOpen ? 'mobile-open' : ''} hidden md:flex`}>

          {mobileMenuOpen && (
            <button
              className="mobile-back-button"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back
            </button>
          )}
          <div className="header-icons">
            <Tooltip title="Order History">
              <IconButton
                aria-label="orders"
                onClick={handleOrderHistoryClick}
                className="header-icon"
              >
                <StyledBadge badgeContent={orderCount} color="secondary">
                  <History size={30} />
                </StyledBadge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Cart">
              <IconButton
                aria-label="cart"
                onClick={handleCartClick}
                className="header-icon"
              >
                <StyledBadge badgeContent={cartItems.length} color="secondary">
                  <IoCartOutline size={30} />
                </StyledBadge>
              </IconButton>
            </Tooltip>
          </div>

          <div className="user-section" ref={dropdownRef}>
            {user ? (
              <>
                <div
                  className={`user-profile-button ${dropdownOpen ? 'active' : ''}`}
                  onClick={toggleDropdown}
                >
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                </div>

                {dropdownOpen && (
                  <div className={`user-dropdown ${isAnimating ? 'closing' : ''} ${activePanel !== 'main' ? 'expanded' : ''}`}>
                    {renderPanel()}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="login-button"
              >
                Login
              </button>
            )}
          </div>
          <button className="membership-button">Apply For Membership</button>
        </div>
      </div>
      <Navigation />
    </div>
  );
}