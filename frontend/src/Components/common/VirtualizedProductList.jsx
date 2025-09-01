import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import OptimizedImage from './OptimizedImage';

const VirtualizedProductList = ({
  products = [],
  itemHeight = 200,
  itemWidth = 300,
  className = '',
  onProductClick,
  renderProduct,
  emptyMessage = 'No products found',
  loading = false,
  error = null
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Memoize the product data to prevent unnecessary re-renders
  const memoizedProducts = useMemo(() => products, [products]);

  // Handle product selection
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Default product renderer
  const defaultProductRenderer = ({ product, style }) => (
    <div
      className={`virtualized-product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
      style={style}
      onClick={() => handleProductClick(product)}
    >
      <div className="product-image-container">
        <OptimizedImage
          src={product.imageUrl || product.image || '/placeholder-product.jpg'}
          alt={product.name}
          width={200}
          height={150}
          className="product-image"
          placeholderSrc="/placeholder-product.jpg"
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description?.substring(0, 100)}
          {product.description?.length > 100 ? '...' : ''}
        </p>

        <div className="product-price-container">
          <span className="product-price">₹{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="product-mrp">₹{product.mrp}</span>
          )}
          {product.discount && (
            <span className="product-discount">{product.discount}% OFF</span>
          )}
        </div>

        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );

  // Custom product renderer
  const renderProductItem = ({ index, style }) => {
    const product = memoizedProducts[index];

    if (!product) {
      return (
        <div style={style} className="virtualized-product-item empty">
          <span>Product not found</span>
        </div>
      );
    }

    if (renderProduct) {
      return renderProduct({ product, style, index });
    }

    return defaultProductRenderer({ product, style });
  };

  // Loading state
  if (loading) {
    return (
      <div className={`virtualized-product-list loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`virtualized-product-list error ${className}`}>
        <div className="error-message">
          <h3>Error loading products</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!memoizedProducts || memoizedProducts.length === 0) {
    return (
      <div className={`virtualized-product-list empty ${className}`}>
        <div className="empty-message">
          <h3>No products available</h3>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Virtualized list
  return (
    <div className={`virtualized-product-list ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={memoizedProducts.length}
            itemSize={itemHeight}
            width={width}
            itemData={memoizedProducts}
          >
            {renderProductItem}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedProductList;
