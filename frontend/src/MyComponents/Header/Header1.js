import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';
import Search from '../../Components/search/index';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline } from "react-icons/io5";
import { User, Bell, Mail, Settings, Clock, LogOut } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import Navigation from './Navigation/Navigation';
import logo from './1.png'

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
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setDropdownOpen(false);
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

  return (
    <div className="header-container">
      <div className="header-top flex items-center">
        <Link to={"/"}>
          <img src={logo} alt="kukuu" className="logo" />
        </Link>

        <Search />

        <div className="header-icons">
          {/* <Tooltip title="Notifications">
            <IconButton className="header-icon">
              <StyledBadge badgeContent={2} color="secondary">
                <Bell size={20} />
              </StyledBadge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Messages">
            <IconButton className="header-icon">
              <StyledBadge badgeContent={1} color="secondary">
                <Mail size={20} />
              </StyledBadge>
            </IconButton>
          </Tooltip> */}

          <Tooltip title="cart">
            <IconButton aria-label="cart" onClick={handleCartClick} className="header-icon">
              <StyledBadge badgeContent={4} color="secondary">
                <IoCartOutline />
              </StyledBadge>
            </IconButton>
          </Tooltip>
        </div>

        <div className="user-section" ref={dropdownRef}>
          {user ? (
            <>
              <div
                className="user-profile-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={24} />
                </div>
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      <User size={40} />
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.id}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </Link>
                  <Link to="/activity" className="dropdown-item">
                    <Clock size={16} />
                    <span>Activity Log</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
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
      <Navigation />
    </div>
  );
}