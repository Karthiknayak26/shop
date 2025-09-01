import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../MyComponents/Header/Login';
import { UserProvider } from '../../MyComponents/Header/UserContext';

// Mock the fetch API
global.fetch = jest.fn();

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  test('renders login form with email and password fields', () => {
    render(
      <BrowserRouter>
        <UserProvider>
          <LoginPage />
        </UserProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    // Mock successful login response
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
        token: 'fake-token-123'
      })
    });

    render(
      <BrowserRouter>
        <UserProvider>
          <LoginPage />
        </UserProvider>
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for the API call to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http:/\/localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });
    
    // Check if user was stored in localStorage
    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser).toEqual({ id: '123', name: 'Test User', email: 'test@example.com' });
    });
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles login failure', async () => {
    // Mock failed login response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    render(
      <BrowserRouter>
        <UserProvider>
          <LoginPage />
        </UserProvider>
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    
    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('redirects to register page when account not found', async () => {
    // Mock account not found response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'User not found' })
    });

    render(
      <BrowserRouter>
        <UserProvider>
          <LoginPage />
        </UserProvider>
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'nonexistent@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/No account found. Please sign up./i)).toBeInTheDocument();
    });
    
    // Wait for navigation to register page (after timeout)
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });
});