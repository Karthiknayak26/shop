import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useCart } from "../MyComponents/Header/CartContext";
import QuantitySelector from "../MyComponents/Header/QuantitySelector";
import { getOptimizedImageProps } from "../utils/imageOptimizer";
import useDebounce from "../utils/useDebounce";
import { api } from "../services/api";
import "./ProductSearch.css";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { data: searchResults = [], isLoading } = useQuery(
    ['searchProducts', debouncedQuery],
    () => api.searchProducts(debouncedQuery),
    {
      enabled: debouncedQuery.trim() !== "",
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleQuantityAddToCart = (productWithQuantity) => {
    // The CartContext expects an id; use name as fallback if no id
    const cartProduct = {
      id: productWithQuantity.id || productWithQuantity.name, // fallback to name if no id
      name: productWithQuantity.name,
      price: productWithQuantity.price,
      img: productWithQuantity.img,
      quantity: productWithQuantity.quantity,
    };
    addToCart(cartProduct);
  };

  const handleCloseQuantitySelector = () => {
    setSelectedProduct(null);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="product-search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search for Products and more"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input"
        />
        <button
          className="search-button"
          disabled
        >
          <span className="search-button-text">SEARCH</span>
        </button>
      </div>
      {isLoading && <div className="loading-indicator">Searching...</div>}
      {searchResults.length > 0 && debouncedQuery.trim() !== "" && (
        <ul className="search-results-list">
          {searchResults.map(product => {
            const imageProps = getOptimizedImageProps(
              product.img,
              product.name,
              {
                width: windowWidth <= 480 ? 30 : 40,
                height: windowWidth <= 480 ? 30 : 40,
                style: { objectFit: "cover", borderRadius: 8, marginRight: 12 }
              }
            );

            return (
              <li key={product.name} className="search-result-item">
                <img {...imageProps} />
                <span className="product-info">
                  {product.name}
                  <span className="product-price">₹{product.price}</span>
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="add-to-cart-button"
                  style={{
                    marginTop: windowWidth <= 480 ? '8px' : '0',
                    marginLeft: window.innerWidth <= 480 ? 'auto' : '0'
                  }}
                >
                  Add to Cart
                </button>
              </li>
            );
          })}

        </ul>
      )}

      {selectedProduct && (
        <QuantitySelector
          product={selectedProduct}
          onAddToCart={handleQuantityAddToCart}
          onClose={handleCloseQuantitySelector}
        />
      )}
    </div>
  );
};

export default ProductSearch;
