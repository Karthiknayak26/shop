import React, { useState, useEffect } from 'react';
import { useUser } from './Header/UserContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useUser();
  const userData = user?.user || {};
  const [name, setName] = useState(userData.name || '');
  const [email, setEmail] = useState(userData.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressError, setAddressError] = useState('');

  // Load shipping address on component mount
  useEffect(() => {
    const loadShippingAddress = async () => {
      if (userData.id) {
        setAddressLoading(true);
        try {
          const response = await fetch(`http:/\/localhost:5000/api/auth/${userData.id}/shipping-address`);
          if (response.ok) {
            const data = await response.json();
            if (data.shippingAddress) {
              setShippingAddress(data.shippingAddress);
            }
          }
        } catch (error) {
          console.error('Error loading shipping address:', error);
        } finally {
          setAddressLoading(false);
        }
      }
    };

    loadShippingAddress();
  }, [userData.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const response = await fetch(`http:/\/localhost:5000/api/auth/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data.user); // Update context
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressSuccess('');
    setAddressError('');
    try {
      const response = await fetch(`http:/\/localhost:5000/api/auth/${userData.id}/shipping-address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shippingAddress }),
      });
      const data = await response.json();
      if (response.ok) {
        setAddressSuccess('Shipping address saved successfully!');
      } else {
        setAddressError(data.message || 'Failed to save shipping address');
      }
    } catch (err) {
      setAddressError('An error occurred while saving address.');
    } finally {
      setAddressLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-grid">
        {/* Profile Information */}
        <div className="profile-card">
          <h3 className="card-title">Profile Information</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label><strong>Name:</strong></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label><strong>Email:</strong></label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <strong>User ID:</strong> <span>{userData.id}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="save-button profile-save"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        {/* Shipping Address */}
        <div className="profile-card">
          <h3 className="card-title">Shipping Address</h3>
          {addressLoading && <div className="loading-message">Loading address...</div>}
          <form onSubmit={handleSaveAddress}>
            <div className="form-group">
              <label><strong>Full Name:</strong></label>
              <input
                type="text"
                name="name"
                value={shippingAddress.name}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label><strong>Email:</strong></label>
              <input
                type="email"
                name="email"
                value={shippingAddress.email}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label><strong>Address:</strong></label>
              <textarea
                name="address"
                value={shippingAddress.address}
                onChange={handleAddressChange}
                className="form-textarea"
                placeholder="Enter your full address"
              />
            </div>
            <div className="form-group">
              <label><strong>City:</strong></label>
              <input
                type="text"
                name="city"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label><strong>Postal Code:</strong></label>
              <input
                type="text"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label><strong>Phone Number:</strong></label>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <button
              type="submit"
              disabled={addressLoading}
              className="save-button address-save"
            >
              {addressLoading ? 'Saving...' : 'Save Address'}
            </button>
            {addressSuccess && <div className="success-message">{addressSuccess}</div>}
            {addressError && <div className="error-message">{addressError}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 