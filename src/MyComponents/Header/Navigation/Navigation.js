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

  return (
    <div className="center-container">
      <li className="list-item">
        <Link to="/" className="link">
          <button className="link-button">Category</button>
        </Link>
        <div className="submenu">
          <ul>
            {/* Buiscut */}
            <li
              className="list-none w-full relative"
              onMouseEnter={() => handleMouseEnter("buiscut")}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/" className="link">
                <Button className="w-full">Buiscut</Button>
              </Link>
              {openSubmenu === "buiscut" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/cream" className="w-full">
                        <Button className="w-full">Cream</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/nuts" className="w-full">
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
              <Link to="/" className="link">
                <Button className="w-full">Household</Button>
              </Link>
              {openSubmenu === "household" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/dryer" className="w-full">
                        <Button className="w-full">Dryer</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/cleaning" className="w-full">
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
              <Link to="/" className="link">
                <Button className="w-full">Kids</Button>
              </Link>
              {openSubmenu === "kids" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/toys" className="w-full">
                        <Button className="w-full">Toys</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/clothes" className="w-full">
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
              <Link to="/" className="link">
                <Button className="w-full">Electronics</Button>
              </Link>
              {openSubmenu === "electronics" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/phones" className="w-full">
                        <Button className="w-full">Mobile Phones</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/laptops" className="w-full">
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
