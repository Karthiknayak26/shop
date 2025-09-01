import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../MyComponents/Header/Header';

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { name: 'Bhopal', address: 'Misrod', city: 'Bhopal', state: 'MP' },
      { name: 'Hyderabad', address: 'Gachibowli', city: 'Hyderabad', state: 'Telangana' }
    ])
  })
);

// Mock component to avoid network status issues in tests
jest.mock('../../MyComponents/Header/NetworkStatus', () => {
  return function MockNetworkStatus() {
    return <div data-testid="network-status">Network Status</div>;
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders header with logo and navigation', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if the logo is rendered
    expect(screen.getByAltText(/kandukuru supermarket/i)).toBeInTheDocument();
    
    // Check if location dropdown is rendered
    await waitFor(() => {
      expect(screen.getByText(/Bhopal, Misrod/i)).toBeInTheDocument();
    });
    
    // Check if navigation links are rendered
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Grocery/i)).toBeInTheDocument();
    expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
  });

  test('fetches locations on component mount', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Verify that fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://shop-backend-92zc.onrender.com/api/locations');
    
    // Wait for locations to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Bhopal, Misrod/i)).toBeInTheDocument();
    });
  });
});