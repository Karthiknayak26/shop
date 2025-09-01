import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../MyComponents/Footer';

describe('Footer Component', () => {
  test('renders footer with logo and links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    // Check if the logo text is rendered
    expect(screen.getByText(/KANDUKURU SUPERMARKET/i)).toBeInTheDocument();
    
    // Check if section headings are rendered
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Help/i)).toBeInTheDocument();
    expect(screen.getByText(/Policies/i)).toBeInTheDocument();
    
    // Check if links are rendered
    expect(screen.getByText(/FAQs/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Shipping/i)).toBeInTheDocument();
    expect(screen.getByText(/Returns/i)).toBeInTheDocument();
  });

  test('shows policy details when clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    // Initially, policy details should not be visible
    expect(screen.queryByText(/We accept credit/debit cards/i)).not.toBeInTheDocument();
    
    // Click on Payment policy
    fireEvent.click(screen.getByText(/Payment/i));
    
    // Now payment details should be visible
    expect(screen.getByText(/We accept credit/debit cards, net banking, and cash on delivery/i)).toBeInTheDocument();
    
    // Click on Shipping policy
    fireEvent.click(screen.getByText(/Shipping/i));
    
    // Payment details should be hidden, shipping details should be visible
    expect(screen.queryByText(/We accept credit/debit cards/i)).not.toBeInTheDocument();
    expect(screen.getByText(/We offer doorstep delivery and in-store pickup/i)).toBeInTheDocument();
  });
});