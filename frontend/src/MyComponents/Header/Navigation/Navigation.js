import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navigation.css";
import Button from "@mui/material/Button";

const Navigation = () => {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleMouseEnter = (submenu) => {
    setOpenSubmenu(submenu);
  };

  const handleMouseLeave = () => {
    setOpenSubmenu(null);
  };
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"></link>
  return (
    <div className="center-container">
      <li className="list-item">
        <Link to="/" className="link">
          <button className="link-button">Category</button>
        </Link>
        <div className="submenu">
          <ul>
            {/* Biscuit */}
            <li
              className="list-none w-full relative"
              onMouseEnter={() => handleMouseEnter("biscuit")}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/biscuits" className="link">
                <Button className="w-full">Biscuits</Button>
              </Link>
              {openSubmenu === "biscuit" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/biscuits/cream" className="w-full">
                        <Button className="w-full">Cream</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/biscuits/nuts" className="w-full">
                        <Button className="w-full">Nuts</Button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* Household */}
            <li
              className="list-none w-full relative"
              onMouseEnter={() => handleMouseEnter("household")}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/household" className="link">
                <Button className="w-full">Household</Button>
              </Link>
              {openSubmenu === "household" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/household/dryer" className="w-full">
                        <Button className="w-full">Dryer</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/household/cleaning" className="w-full">
                        <Button className="w-full">Cleaning</Button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* Kids */}
            <li
              className="list-none w-full relative"
              onMouseEnter={() => handleMouseEnter("kids")}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/kids" className="link">
                <Button className="w-full">Kids</Button>
              </Link>
              {openSubmenu === "kids" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/kids/toys" className="w-full">
                        <Button className="w-full">Toys</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/kids/clothes" className="w-full">
                        <Button className="w-full">Clothes</Button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* Electronics */}
            <li
              className="list-none w-full relative"
              onMouseEnter={() => handleMouseEnter("electronics")}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/electronics" className="link">
                <Button className="w-full">Electronics</Button>
              </Link>
              {openSubmenu === "electronics" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/electronics/phones" className="w-full">
                        <Button className="w-full">Mobile Phones</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/electronics/laptops" className="w-full">
                        <Button className="w-full">Laptops</Button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </li>
    </div>
  );
};

export default Navigation;
