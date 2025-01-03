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


export default function Header1() {
  const navigate = useNavigate();
  return (
    <div className="header-container">
      <div className="header-top flex items-center">
        <Link to={"/"}> <img src={logo} alt="kukuu" className="logo" /></Link>

        <Search />
        <li className='no-underline'>
          <Tooltip title="cart">
            <IconButton aria-label="cart" onClick={() => navigate('/cart')}>
              <StyledBadge badgeContent={4} color="secondary">
                <IoCartOutline />
              </StyledBadge>
            </IconButton>
          </Tooltip>
        </li>


        <button className="login-button" onClick={() => navigate('/login')}>Login</button>
        {/* <button className="register-button" onClick={() => navigate('/register')}>Register</button> */}
        <button className="membership-button">Apply For Membership</button>
      </div>
      <Navigation />
    </div >
  );
}