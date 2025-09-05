import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import QuantitySelector from '../Header/QuantitySelector';
import './grocery-deals.css';
import { useLocation } from 'react-router-dom';

const API_URL = "https://script.google.com/macros/s/AKfycbyK3-QR1T1wHfxqfmVUroEEN4K5IyNGXHVVmRvx1SivCcrTCgz82ropyDabjXjtt_J4/exec"; // <-- Replace YOUR_SCRIPT_ID

// 📌 Grocery Categories Component (No changes here)
const GroceryCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'Chocolates, Biscuits & Sweets',
      name: "Chocolates, Biscuits & Sweets",
      img: require("./snacks and drinks.png"),
    },
    {
      id: 'Pickles, chutneys, sauces, and spreads',
      name: "Pickles, chutneys, sauces, and spreads",
      img: require("./cookingessentinals.png"),
    },
    {
      id: 'Ready-to-cook and eat',
      name: "Ready-to-cook and eat",
      img: require("./flours and pulses.png"),
    },

    {
      id: 'Semolina & Vermicelli',
      name: "Semolina & Vermicelli",
      img: require("./flours and pulses.png"),
    },

    {
      id: 'drinks and jucies',
      name: "Drinks and Jucies",
      img: require("./flours and pulses.png"),
    },

  ];

  return (
    <div className="grocery-categories">
      <header>
        <h1>Biscuits, drinks, and packaged foods</h1>
      </header>
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/groceries/products/${category.id}`)}
            className="category-card hover-effect"
          >
            <div className="category-image">
              <img src={category.img} alt={category.name} />
            </div>
            <div className="category-content">
              <p>{category.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 📌 Grocery Products Component (Updated for performance)
const GroceryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [allProducts, setAllProducts] = useState([]); // State to hold ALL products
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const categories = [
    { id: 'Chocolates, Biscuits & Sweets', name: 'Chocolates, Biscuits & Sweets' },
    { id: 'Pickles, chutneys, sauces, and spreads', name: 'Pickles, chutneys, sauces, and spreads' },
    { id: 'Ready-to-cook and eat', name: 'Ready-to-cook and eat' },
  ];

  // ✅ Fetch ALL products only ONCE when the component mounts
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL); // Fetch without category parameter
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('API did not return an array.');
        }

        const formatted = data.map((item, index) => ({
          id: item.id || `${item.name}-${index}`,
          name: item.name,
          price: parseFloat(item.price),
          img: item.img,
          category: item.category,
        }));

        setAllProducts(formatted); // Store all products
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching sheet data', err);
        setFetchError('Failed to fetch products from Google Sheet API.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []); // Empty dependency array means this runs only once

  // This effect now only handles updating the URL
  useEffect(() => {
    const path = activeCategory ? `/groceries/products/${activeCategory}` : '/groceries/products';
    navigate(path, { replace: true });
  }, [activeCategory, navigate]);

  // Filter products on the client-side from the 'allProducts' state
  const filteredProducts = activeCategory
    ? allProducts.filter((product) => product.category === activeCategory)
    : allProducts;

  const searchedProducts = searchQuery
    ? filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : filteredProducts;

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleQuantityAddToCart = (productWithQuantity) => {
    addToCart(productWithQuantity);
    setSuccessMessage(
      `${productWithQuantity.name} (${productWithQuantity.quantity}) added to cart!`
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000); // Disappear after 2 seconds
  };

  const handleCloseQuantitySelector = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="grocery-products">
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={16} />
        <span onClick={() => navigate('/groceries')} style={{ cursor: 'pointer' }}>Groceries</span>
        {activeCategory && (
          <>
            <ChevronRight size={16} />
            <span className="active-category">
              {categories.find((c) => c.id === activeCategory)?.name}
            </span>
          </>
        )}
      </div>

      {fetchError && (
        <div style={{ color: 'red', margin: '1em 0' }}>
          {fetchError}
        </div>
      )}

      <div className="category-filters">
        <button
          onClick={() => setActiveCategory(undefined)}
          className={!activeCategory ? 'active' : ''}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={activeCategory === category.id ? 'active' : ''}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {loading ? (
        <div className="loader">Loading products...</div>
      ) : (
        <div id="grocery-products-grid" className="products-grid">
          {searchedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.img} alt={product.name} />
              <div className="product-content">
                <h3>{product.name}</h3>
                <p>₹{product.price}</p>
                <button
                  className="add-to-cart"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searchedProducts.length === 0 && (
        <div className="no-products">No products found</div>
      )}

      {selectedProduct && (
        <QuantitySelector
          product={selectedProduct}
          onAddToCart={handleQuantityAddToCart}
          onClose={handleCloseQuantitySelector}
        />
      )}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
};

// 📌 Combined Export (No changes here)
const GroceryDeals = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/groceries/products')) {
    return <GroceryProducts />;
  }
  return <GroceryCategories />;
};

export default GroceryDeals;
export { GroceryCategories, GroceryProducts };