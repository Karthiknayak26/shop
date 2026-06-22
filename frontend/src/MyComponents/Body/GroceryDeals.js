import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import QuantitySelector from '../Header/QuantitySelector';
import './grocery-deals.css';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import ProductSkeleton from '../../Components/Skeletons/ProductSkeleton';
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const categories = [
    { id: 'Chocolates, Biscuits & Sweets', name: 'Chocolates, Biscuits & Sweets' },
    { id: 'Pickles, chutneys, sauces, and spreads', name: 'Pickles, chutneys, sauces, and spreads' },
    { id: 'Ready-to-cook and eat', name: 'Ready-to-cook and eat' },
  ];

  const { data: products = [], isLoading: loading, error: fetchError } = useQuery(
    ['groceries', activeCategory],
    ({ signal }) => api.getProducts({ category: activeCategory, signal }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const handlePrefetch = (categoryId) => {
    queryClient.prefetchQuery(['groceries', categoryId], ({ signal }) => 
      api.getProducts({ category: categoryId, signal })
    );
  };

  useEffect(() => {
    const path = activeCategory ? `/groceries/products/${activeCategory}` : '/groceries/products';
    navigate(path, { replace: true });
  }, [activeCategory, navigate]);

  const searchedProducts = searchQuery
    ? products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : products;

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleQuantityAddToCart = (productWithQuantity) => {
    addToCart(productWithQuantity);
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
            onMouseEnter={() => handlePrefetch(category.id)}
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
        <div id="grocery-products-grid" className="products-grid">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
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