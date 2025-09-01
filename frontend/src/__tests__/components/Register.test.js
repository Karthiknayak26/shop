import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../MyComponents/Header/Register';

// Mock the fetch API
global.fetch = jest.fn();

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Register Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test('renders registration form with all required fields', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for validation error
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();

    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });

    // Submit form with mismatched passwords
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for password mismatch error
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    // Mock successful registration response
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ message: 'Registration successful' })
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in the form correctly
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Wait for the API call to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://shop-backend-92zc.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }),
      });
    });

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Check if navigation to login page occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('handles registration failure', async () => {
    // Mock failed registration response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Email already exists' })
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});