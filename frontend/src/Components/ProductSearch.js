import React, { useState, useEffect } from "react";
import { useCart } from "../MyComponents/Header/CartContext";
import QuantitySelector from "../MyComponents/Header/QuantitySelector";
import { getOptimizedImageProps } from "../utils/imageOptimizer";
import "./ProductSearch.css";

const API_URL = "https:/\/script.google.com/macros/s/AKfycbytjEMd87XgeQiYYO_5Jrc3-Xg1LOUW1ybIshCwJMr0FRpaBbbPC3Stg_ULYe7d3Fom/exec";

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFiltered([]);
    } else {
      setFiltered(
        products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, products]);

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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
      {loading && <div className="loading-indicator">Loading...</div>}
      {filtered.length > 0 && (
        <ul className="search-results-list">
          {filtered.map(product => {
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
