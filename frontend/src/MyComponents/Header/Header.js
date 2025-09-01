import React, { useState, useEffect } from 'react';
import './Header.css';
// Replace:
// import Container from 'react-bootstrap/Container';
// import NavDropdown from 'react-bootstrap/NavDropdown';
// import Navbar from 'react-bootstrap/Navbar';

// With:
import { Container, NavDropdown, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NetworkStatus from './NetworkStatus';


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
        const response = await fetch('http:/\/localhost:5000/api/locations');
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // DETAILED DEBUGGING - Log everything
        console.log('=== DEBUG INFO ===');
        console.log('Raw API Response:', data);
        console.log('Is data an array?', Array.isArray(data));
        console.log('Data length:', data?.length);

        if (data && data.length > 0) {
          console.log('First location object:', data[0]);
          console.log('First location keys:', Object.keys(data[0]));

          // Check each location's properties
          data.forEach((location, index) => {
            console.log(`Location ${index}:`, {
              name: location.name,
              address: location.address,
              city: location.city,
              state: location.state,
              hasCity: location.hasOwnProperty('city'),
              hasState: location.hasOwnProperty('state')
            });
          });
        }

        // Try different mapping strategies
        let mappedAddresses;

        if (data && data.length > 0) {
          // Strategy 1: Try city, state (your original approach)
          if (data[0].city && data[0].state) {
            mappedAddresses = data.map(location => `${location.city}, ${location.state}`);
            console.log('Using city, state strategy');
          }
          // Strategy 2: Try name, address
          else if (data[0].name && data[0].address) {
            mappedAddresses = data.map(location => `${location.name} - ${location.address}`);
            console.log('Using name, address strategy');
          }
          // Strategy 3: Just use address
          else if (data[0].address) {
            mappedAddresses = data.map(location => location.address);
            console.log('Using address only strategy');
          }
          // Strategy 4: Just use name
          else if (data[0].name) {
            mappedAddresses = data.map(location => location.name);
            console.log('Using name only strategy');
          }
          else {
            // Fallback: show what we have
            mappedAddresses = data.map((location, index) => `Location ${index + 1}`);
            console.log('Using fallback strategy');
          }

          console.log('Final mapped addresses:', mappedAddresses);
          setAddresses(mappedAddresses);
        } else {
          console.log('No data received or empty array');
          setAddresses([]);
        }

      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(`Error loading locations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Helper: Try to detect user location and set selected address
    const detectAndSetLocation = async () => {
      if (!('geolocation' in navigator)) return;
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https:/\/nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
          const state = data.address.state;
          if (city && state) {
            const detected = `${city}, ${state}`;
            setSelectedAddress(detected);
            setAddresses(prev => {
              // Only add if not already present
              if (prev.includes(detected)) return prev;
              return [detected, ...prev];
            });
          }
        } catch (e) {
          // Ignore geolocation errors
        }
      }, (err) => {
        // Ignore geolocation errors
      });
    };

    // Fetch locations, then try to detect user location
    fetchLocations().then(() => {
      // Use a timeout to ensure addresses state is updated
      setTimeout(() => {
        detectAndSetLocation();
      }, 500);
    });
  }, []);

  // Handle address change when user selects a new address from the dropdown
  const handleAddressChange = (address) => {
    setSelectedAddress(address);
  };

  return (
    <>
      <NetworkStatus />
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
              <NavDropdown.Item>No locations available (addresses.length: {addresses.length})</NavDropdown.Item>
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
                <li>
                  <Link to="/order-history" className='no-underline'>Order History</Link>
                </li>
              </ul>
              <div className='ml-8'>
                <Link to="/download-app" className='no-underline'>Download App</Link>
              </div>
            </div>
          </div>
        </Container>
      </Navbar>

    </>
  );
}