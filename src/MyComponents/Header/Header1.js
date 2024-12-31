import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';
import logo from "./1.png";
import logo1 from "./2.png";
import { Link } from 'react-router-dom';
import Search from '../../Components/search/index';
import Badge, { BadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline } from "react-icons/io5";
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Navigation from './Navigation/Navigation';





const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));




const menuItems = [
  {
    label: "categories",
    options: [
      { label: "electronics", subOptions: ["TVs", "Laptops", "Gaming", "Smartphones"], },
      { label: "groceries", subOptions: ["vegetables", "fruits", "dry fruits", "special fruits"] },
      { label: "home essential", subOptions: ["milk & milk products", "toast and khari", "cakes and muffins"] },
    ],
  },
  {
    label: "buety products",
    options: [
      { label: "skin care", subOptions: ["meloni", "dazler", "ponds", "facecreams"] },
      { label: "electronic products", subOptions: ["hair dryer", "makeup kits", "face cleaner"] },
    ],
  },
  {
    label: "Gift",
    options: ["Tech Gifts", "Home Appliances", "Outdoor & Sports"],
  },
  {
    label: "",
    options: ["Laptops", "Smartphones", "Accessories"],
  },
];

const SubMenuItem = ({ item }) => {
  const [showSubMenu, setShowSubMenu] = useState(false);

  if (typeof item === "string") {
    return <div className="menu-item">{item}</div>;
  }

  return (
    <div
      className="menu-item-wrapper"
      onMouseEnter={() => setShowSubMenu(true)}
      onMouseLeave={() => setShowSubMenu(false)}
    >
      <div className="menu-item with-submenu">
        {item.label}
        <span className="arrow">›</span>
      </div>
      {showSubMenu && (
        <div className="submenu">
          {item.subOptions.map((subOption, idx) => (
            <div key={idx} className="menu-item">
              {subOption}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dropdown = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="dropdown-button">{label}</button>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option, index) => (
            <SubMenuItem key={index} item={option} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Header1() {
  const navigate = useNavigate();
  return (
    <div className="header-container">
      <div className="header-top flex items-center">
        <Link to={"/"}> <img src={logo} alt="kukuu" className="logo" /></Link>

        <Search />
        <li className='no-underline'>
          <Tooltip title="cart">
            <IconButton aria-label="cart">
              <StyledBadge badgeContent={4} color="secondary">
                <IoCartOutline />
              </StyledBadge>
            </IconButton>
          </Tooltip>
        </li>


        <button className="login-button" onClick={() => navigate('/login')}>Login | <Link to="/registor" >registor</Link></button>
        <button className="membership-button">Apply For Membership</button>
      </div>
      <Navigation />
    </div >
  );
}