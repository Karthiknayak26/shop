import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registor.css';
import { Home } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('https://shop-backend-92zc.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Registration successful!');
        setError('');
        navigate('/login'); // Redirect to login page
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Failed to connect to the server. Please try again later.');
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="fab-home"
        aria-label="Go back to home"
      >
        <Home className="h-6 w-6" />
      </button>
      <div className="register-page">
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="registration-form">
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <span
            className="login-link"
            onClick={() => navigate('/login')}
            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
