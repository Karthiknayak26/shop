import React from "react";
import "./Footer.css";
import googlePlayLogo from './1.png';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo"  >
          <img src="./Header/1.png" alt="" className="logo-image" />
          <span className="logo-text">KANDUKURU SUPERMARKET</span>
        </div>
        <div className="footer-links">
          <div>
            <h4>About</h4>
            <ul>
              <li>Overview</li>
              <li>Business Segments</li>
              <li>Our Brands</li>
              <li>Corporate Information</li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li>FAQs</li>
            </ul>
          </div>
          <div>
            <h4>Policies</h4>
            <ul>
              <li>Payment</li>
              <li>Shipping</li>
              <li>Returns</li>
              <li>Member Registration</li>
              <li>Privacy Policy</li>
              <li>Terms of Use</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="app-section">
          <h4>All items in your hand</h4>
          <a
            href="https://play.google.com/store/apps/details?id=com.yourapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={googlePlayLogo}
              alt="Google Play"
              className="google-play-button"
            />
          </a>
        </div>
        <div className="delivery-modes">
          <h4>Delivery Modes</h4>
          <ul>
            <li>Instore Pickup</li>
            <li>Doorstep Delivery</li>
          </ul>
        </div>
        <div className="payment-solutions">
          <h4>Payment Solutions</h4>
          <ul>
            <li>Net Banking</li>
            <li>Credit & Debit Card</li>
            <li>Cash Pickup</li>
          </ul>
        </div>
        <div className="company-info">
          <p>FSSAI License No.: 10014 011 00 1901</p>
          <p>KANDUKURU SUPERMARKET</p>
          <p>Mantralaya</p>
          <p>Andra pradesh</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
