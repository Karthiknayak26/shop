import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="cookie-consent-banner">
      <p>
        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
        By clicking "Accept All", you consent to our use of cookies.
      </p>
      <button onClick={handleAccept}>Accept All</button>
    </div>
  );
};

export default CookieConsent;
