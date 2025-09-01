import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../../Components/ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    name: 'Test Product',
    price: '₹199',
    description: 'This is a test product description',
    image: '/test-image.jpg',
    stock_status: 'In Stock',
    link: 'https:/\/example.com/product'
  };

  test('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Check if product details are rendered
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹199')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    
    // Check if image is rendered with correct attributes
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  test('handles missing product data gracefully', () => {
    render(<ProductCard product={null} />);
    expect(screen.getByText('Invalid Product Data')).toBeInTheDocument();
  });

  test('displays fallback for missing price', () => {
    const productWithoutPrice = { ...mockProduct, price: undefined };
    render(<ProductCard product={productWithoutPrice} />);
    expect(screen.getByText('Price not available')).toBeInTheDocument();
  });

  test('displays out of stock status correctly', () => {
    const outOfStockProduct = { ...mockProduct, stock_status: 'Out of Stock' };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});