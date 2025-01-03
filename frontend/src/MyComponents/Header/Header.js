import React, { useState, useEffect } from 'react';
import './Header.css';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';



export default function Header() {
  // State to manage selected address
  const [selectedAddress, setSelectedAddress] = useState('Bhopal, Misrod');
  const [addresses, setAddresses] = useState([]); // State for locations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state


  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetching location data from backend API
        const response = await fetch('http://localhost:5000/api/locations'); // Correct the URL if needed
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Log the fetched data (for debugging)
        console.log('Fetched locations:', data);

        // Map through the locations and extract city, state
        setAddresses(data.map(location => `${location.city}, ${location.state}`));

      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Error loading locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations(); // Calling the function to fetch locations on component mount
  }, []); // Empty dependency array means this effect runs only once (on mount)

  // Handle address change when user selects a new address from the dropdown
  const handleAddressChange = (address) => {
    setSelectedAddress(address); // This updates the selected address
  };

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container className="d-flex justify-content-between align-items-center">
        {/* Dropdown with locations */}
        <NavDropdown title={selectedAddress} id="location-dropdown" className="location-dropdown">
          {loading ? (
            <NavDropdown.Item>Loading locations...</NavDropdown.Item>
          ) : error ? (
            <NavDropdown.Item>{error}</NavDropdown.Item>
          ) : addresses.length > 0 ? (
            addresses.map((address, index) => (
              <NavDropdown.Item key={index} className="d-flex align-items-center">
                <input
                  type="radio"
                  name="address"
                  value={address}
                  checked={selectedAddress === address}
                  onChange={() => handleAddressChange(address)}
                  style={{ marginRight: '10px' }}
                />
                {address}
              </NavDropdown.Item>
            ))
          ) : (
            <NavDropdown.Item>No locations available</NavDropdown.Item>
          )}
        </NavDropdown>

        {/* Center Brand */}
        <Navbar.Brand href="#home" className="text-center">
          KANDUKURU SUPERMARKET
        </Navbar.Brand>

        {/* Right-Aligned Content */}
        <div className="d-flex align-items-center">
          <div className='col2 flex items-center justify-between w-100'>
            <ul className='flex items-center gap-4 custom-list'>
              <li>
                <Link to="/help-center" className='no-underline'>Help Center</Link>
              </li>
              <li>
                <Link to="/order-tracking" className='no-underline'>Order Tracking</Link>
              </li>
            </ul>
            <div className='ml-8'>
              <Link to="/download-app" className='no-underline'>Download App</Link>
            </div>
          </div>
        </div>
      </Container>
    </Navbar>
  );
}