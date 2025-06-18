// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { useUser } from './UserContext';
// import { Link } from 'react-router-dom';
// import Search from '../../Components/search/index';
// import Badge from '@mui/material/Badge';
// import { styled } from '@mui/material/styles';
// import IconButton from '@mui/material/IconButton';
// import { IoCartOutline } from "react-icons/io5";
// import { User, Bell, Mail, Settings, Clock, LogOut } from 'lucide-react';
// import Tooltip from '@mui/material/Tooltip';
// import Navigation from './Navigation/Navigation';
// import logo from './1.png'
// import './Header1.css'; // Import your CSS file for styling

// const StyledBadge = styled(Badge)(({ theme }) => ({
//   '& .MuiBadge-badge': {
//     right: -3,
//     top: 13,
//     border: `2px solid ${theme.palette.background.paper}`,
//     padding: '0 4px',
//   },
// }));

// export default function Header1() {
//   const { user, setUser } = useUser();
//   const navigate = useNavigate();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     setUser(null);
//     setDropdownOpen(false);
//     navigate('/login');
//   };

//   const handleCartClick = () => {
//     if (!user) {
//       alert('Please login to view your cart');
//       navigate('/login');
//     } else {
//       navigate('/cart');
//     }
//   };

//   return (
//     <div className="header-container">
//       <div className="header-top flex items-center">
//         <Link to={"/"}>
//           <img src={logo} alt="kukuu" className="logo" />
//         </Link>

//         <Search />

//         <div className="header-icons">
//           <Tooltip title="Notifications">
//             <IconButton className="header-icon">
//               <StyledBadge badgeContent={2} color="secondary">
//                 <Bell size={20} />
//               </StyledBadge>
//             </IconButton>
//           </Tooltip>

//           <Tooltip title="Messages">
//             <IconButton className="header-icon">
//               <StyledBadge badgeContent={1} color="secondary">
//                 <Mail size={20} />
//               </StyledBadge>
//             </IconButton>
//           </Tooltip>

//           <Tooltip title="cart">
//             <IconButton aria-label="cart" onClick={handleCartClick} className="header-icon">
//               <StyledBadge badgeContent={4} color="secondary">
//                 <IoCartOutline />
//               </StyledBadge>
//             </IconButton>
//           </Tooltip>
//         </div>

//         <div className="user-section" ref={dropdownRef}>
//           {user ? (
//             <>
//               <div
//                 className="user-profile-button"
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//               >
//                 <div className="user-avatar">
//                   <User size={24} />
//                 </div>
//               </div>
//               {dropdownOpen && (
//                 <div className="user-dropdown">
//                   <div className="dropdown-header">
//                     <div className="user-avatar-large">
//                       <User size={40} />
//                     </div>
//                     <div className="user-info">
//                       <div className="user-name">{user.name}</div>
//                       <div className="user-email">{user.id}</div>
//                     </div>
//                   </div>
//                   <div className="dropdown-divider" />
//                   <Link to="/profile" className="dropdown-item">
//                     <User size={16} />
//                     <span>My Profile</span>
//                   </Link>
//                   <Link to="/settings" className="dropdown-item">
//                     <Settings size={16} />
//                     <span>Account Settings</span>
//                   </Link>
//                   <Link to="/activity" className="dropdown-item">
//                     <Clock size={16} />
//                     <span>Activity Log</span>
//                   </Link>
//                   <div className="dropdown-divider" />
//                   <button onClick={handleLogout} className="dropdown-item logout">
//                     <LogOut size={16} />
//                     <span>Sign Out</span>
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <button
//               onClick={() => navigate('/login')}
//               className="login-button"
//             >
//               Login
//             </button>
//           )}
//         </div>
//         <button className="membership-button">Apply For Membership</button>
//       </div>
//       <Navigation />
//     </div>
//   );
// }

// 2nd edited
// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { useUser } from './UserContext';
// import { Link } from 'react-router-dom';
// import Search from '../../Components/search/index';
// import Badge from '@mui/material/Badge';
// import { styled } from '@mui/material/styles';
// import IconButton from '@mui/material/IconButton';
// import { IoCartOutline } from "react-icons/io5";
// import { User, Bell, Mail, Settings, Clock, LogOut, ChevronRight } from 'lucide-react';
// import Tooltip from '@mui/material/Tooltip';
// import Navigation from './Navigation/Navigation';
// import logo from './1.png'
// import './Header1.css';

// const StyledBadge = styled(Badge)(({ theme }) => ({
//   '& .MuiBadge-badge': {
//     right: -3,
//     top: 13,
//     border: `2px solid ${theme.palette.background.paper}`,
//     padding: '0 4px',
//   },
// }));

// export default function Header1() {
//   const { user, setUser } = useUser();
//   const navigate = useNavigate();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const [activeSubmenu, setActiveSubmenu] = useState(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//         setActiveSubmenu(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     setUser(null);
//     setDropdownOpen(false);
//     navigate('/login');
//   };

//   const handleCartClick = () => {
//     if (!user) {
//       alert('Please login to view your cart');
//       navigate('/login');
//     } else {
//       navigate('/cart');
//     }
//   };

//   const toggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//     if (!dropdownOpen) {
//       setActiveSubmenu(null);
//     }
//   };

//   const handleProfileNavigation = (path) => {
//     navigate(path);
//     setDropdownOpen(false);
//     setActiveSubmenu(null);
//   };

//   const toggleSubmenu = (menu) => {
//     setActiveSubmenu(activeSubmenu === menu ? null : menu);
//   };

//   return (
//     <div className="header-container">
//       <div className="header-top flex items-center">
//         <Link to={"/"}>
//           <img src={logo} alt="kukuu" className="logo" />
//         </Link>

//         <Search />

//         <div className="header-icons">
//           <Tooltip title="cart">
//             <IconButton aria-label="cart" onClick={handleCartClick} className="header-icon">
//               <StyledBadge badgeContent={4} color="secondary">
//                 <IoCartOutline />
//               </StyledBadge>
//             </IconButton>
//           </Tooltip>
//         </div>

//         <div className="user-section" ref={dropdownRef}>
//           {user ? (
//             <>
//               <div
//                 className="user-profile-button"
//                 onClick={toggleDropdown}
//               >
//                 <div className="user-avatar">
//                   {user.avatar ? (
//                     <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full" />
//                   ) : (
//                     <User size={24} />
//                   )}
//                 </div>
//               </div>

//               {dropdownOpen && (
//                 <div className="user-dropdown">
//                   <div className="dropdown-header">
//                     <div className="user-avatar-large">
//                       {user.avatar ? (
//                         <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full" />
//                       ) : (
//                         <User size={40} />
//                       )}
//                     </div>
//                     <div className="user-info">
//                       <div className="user-name">{user.name}</div>
//                       <div className="user-email">{user.email || user.id}</div>
//                     </div>
//                   </div>

//                   <div className="dropdown-divider" />

//                   <div
//                     className="dropdown-item"
//                     onClick={() => handleProfileNavigation('/profile')}
//                   >
//                     <User size={16} />
//                     <span>My Profile</span>
//                   </div>

//                   <div className="menu-item-wrapper">
//                     <div
//                       className="dropdown-item with-submenu"
//                       onClick={() => toggleSubmenu('account')}
//                     >
//                       <Settings size={16} />
//                       <span>Account Settings</span>
//                       <ChevronRight size={16} className="arrow" />
//                     </div>

//                     {activeSubmenu === 'account' && (
//                       <div className="submenu">
//                         <div
//                           className="dropdown-item"
//                           onClick={() => handleProfileNavigation('/settings/profile')}
//                         >
//                           <span>Edit Profile</span>
//                         </div>
//                         <div
//                           className="dropdown-item"
//                           onClick={() => handleProfileNavigation('/settings/password')}
//                         >
//                           <span>Change Password</span>
//                         </div>
//                         <div
//                           className="dropdown-item"
//                           onClick={() => handleProfileNavigation('/settings/privacy')}
//                         >
//                           <span>Privacy Settings</span>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div
//                     className="dropdown-item"
//                     onClick={() => handleProfileNavigation('/activity')}
//                   >
//                     <Clock size={16} />
//                     <span>Activity Log</span>
//                   </div>

//                   <div className="dropdown-divider" />

//                   <button
//                     onClick={handleLogout}
//                     className="dropdown-item logout"
//                   >
//                     <LogOut size={16} />
//                     <span>Sign Out</span>
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <button
//               onClick={() => navigate('/login')}
//               className="login-button"
//             >
//               Login
//             </button>
//           )}
//         </div>
//         <button className="membership-button">Apply For Membership</button>
//       </div>
//       <Navigation />
//     </div>
//   );
// }

// Header1.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';
import Search from '../../Components/search/index';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline } from "react-icons/io5";
import { User, Bell, Mail, Settings, Clock, LogOut, ChevronRight, Edit, Lock, Shield, Image } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import Navigation from './Navigation/Navigation';
import logo from './1.png';
import './Header1.css';

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
  const [activePanel, setActivePanel] = useState('main'); // 'main', 'profile', 'security', 'preferences'
  const dropdownRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setUser(null);
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
            <div className="dropdown-item" onClick={() => navigateTo('/settings/2fa')}>
              <Shield size={16} />
              <span>Two-Factor Auth</span>
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
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email || user.id}</div>
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

            <div className="dropdown-item" onClick={() => setActivePanel('profile')}>
              <Settings size={16} />
              <span>Profile Settings</span>
              <ChevronRight size={16} className="arrow" />
            </div>

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

        <Search />

        <div className="header-icons">
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
      <Navigation />
    </div>
  );
}