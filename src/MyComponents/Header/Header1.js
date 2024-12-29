import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';
import logo from "./1.png";

const menuItems = [
  {
    label: "categories",
    options: [
      { label: "electronics", subOptions: ["TVs", "Laptops", "Gaming", "Smartphones"], },
      { label: "groceries", subOptions: ["vegetables", "fruits", "dry fruits", "special fruits"] },
      { label: "dairy & bakery", subOptions: ["milk & milk products", "toast and khari", "cakes and muffins"] },
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
      <div className="header-top">
        <img src={logo} alt="kukuu" className="logo" />
        <input type="text" placeholder="Search for Products and more" className="search-bar" />
        <button className="search-button">Search</button>
        <button className="login-button"  onClick={() => navigate('/login')}>Login</button>
        <button className="membership-button">Apply For Membership</button>
      </div>
      <div className="dropdown-container">
        {menuItems.map((item, index) => (
          <Dropdown key={index} label={item.label} options={item.options} />
        ))}
      </div>
    </div>
  );
}