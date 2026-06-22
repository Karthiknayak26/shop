import React from 'react';
import './ProductSkeleton.css';

const ProductSkeleton = () => {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="product-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="category-card skeleton-card">
      <div className="skeleton-img-circle"></div>
      <div className="skeleton-text"></div>
    </div>
  );
};

export default ProductSkeleton;
