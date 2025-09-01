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
  <link href="https:/\/fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"></link>

};

export default Navigation;
