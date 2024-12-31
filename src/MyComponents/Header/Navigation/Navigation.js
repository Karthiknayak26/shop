import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navigation.css";
import Button from "@mui/material/Button";

const Navigation = () => {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleSubmenuToggle = (submenu) => {
    setOpenSubmenu((prev) => (prev === submenu ? null : submenu));
  };

  return (
    <div className="center-container">
      <li className="list-item">
        <Link to="/" className="link">
          <button className="link-button">Category</button>
        </Link>
        <div className="submenu">
          <ul>

            <li className="list-none w-full relative">
              <Link to="/" className="link">
                <Button
                  className="w-full"
                  onClick={() => handleSubmenuToggle("buiscut")}
                >
                  busicut
                </Button>
              </Link>
              {openSubmenu === "buiscut" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/cream" className="w-full">
                        <Button className="w-full">cream </Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/nuts" className="w-full">
                        <Button className="w-full">nuts</Button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>


            <li className="list-none w-full relative">
              <Link to="/" className="link">
                <Button
                  className="w-full"
                  onClick={() => handleSubmenuToggle("household")}
                >
                  household
                </Button>
              </Link>
              {openSubmenu === "household" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/dryer" className="w-full">
                        <Button className="w-full">dryer</Button>
                      </Link>
                    </li>
                    <li className="list-none w-full relative">
                      <Link to="/household" className="w-full">
                        <Button className="w-full">household</Button>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* Kids */}
            <li className="list-none w-full relative">
              <Link to="/" className="link">
                <Button
                  className="w-full"
                  onClick={() => handleSubmenuToggle("kids")}
                >
                  Kids
                </Button>
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
            <li className="list-none w-full relative">
              <Link to="/" className="link">
                <Button
                  className="w-full"
                  onClick={() => handleSubmenuToggle("electronics")}
                >
                  Electronics
                </Button>
              </Link>
              {openSubmenu === "electronics" && (
                <div className="submenu">
                  <ul>
                    <li className="list-none w-full relative">
                      <Link to="/phoones" className="w-full">
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
