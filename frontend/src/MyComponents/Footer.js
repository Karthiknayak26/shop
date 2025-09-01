import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./Footer.css";
import googlePlayLogo from './Header/GOOGLE PLAY STORE.png';
import logo from './Header/1.png';
const policyDetails = {
  Payment: "We accept credit/debit cards, net banking, and cash on delivery. All payments are secure.",
  Shipping: "We offer doorstep delivery and in-store pickup. Delivery times vary by location.",
  Returns: "Returns are accepted within 7 days of delivery. Please keep the invoice for reference."
};
const Footer = () => {
  const [openPolicy, setOpenPolicy] = useState(null);
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          <img src={logo} alt="" className="logo-image" />
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
              <li><Link to="/help-center" style={{ color: 'inherit', textDecoration: 'none' }}>FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4>Policies</h4>
            <ul>
              {['Payment', 'Shipping', 'Returns'].map((policy) => (
                <li key={policy} style={{ position: 'relative' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}
                    onClick={() => setOpenPolicy(openPolicy === policy ? null : policy)}
                  >
                    {policy}
                  </button>
                  {openPolicy === policy && policyDetails[policy] && (
                    <div style={{ color: 'white', background: '#18376a', borderRadius: '4px', padding: '8px', marginTop: '4px', fontSize: '0.95em', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      {policyDetails[policy]}
                    </div>
                  )}
                </li>
              ))}
              <li><Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="app-section">
          <h4>All items in your hand</h4>
          <a
            href="https:/\/play.google.com/store/apps/details?id=com.yourapp"
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
