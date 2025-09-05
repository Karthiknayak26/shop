import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import './Home.css';
import { useLocation } from 'react-router-dom';

const API_URL = "https://script.google.com/macros/s/AKfycbyK3-QR1T1wHfxqfmVUroEEN4K5IyNGXHVVmRvx1SivCcrTCgz82ropyDabjXjtt_J4/exec";
// <-- Replace with your Apps Script deployment URL

// 📌 Home & Lifestyle Categories Component
const HomelifestylesCategories = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 'Baby-Care-Products', name: 'Baby Care', img: require('./baby care.png') },
    { id: 'decor', name: 'Shampoos and Soaps', img: require('./sampoos and saops.png') },
    { id: 'kitchen', name: 'Creams and Lotions', img: require('./creams and lotions.png') },
  ];

  return (
    <div className="homelifestyles-categories">
      <header>
        <h1>Best Deals On Home & Lifestyle</h1>
      </header>
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/homelifestyles/products/${category.id}`)}
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

// 📌 Home & Lifestyle Products Component (Dynamic)
const HomelifestylesProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [products, setProducts] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const categories = [
    { id: 'Baby-Care-Products', name: 'Baby Care' },
    { id: 'decor', name: 'Shampoos and Soaps' },
    { id: 'kitchen', name: 'Creams and Lotions' },
  ];

  // ✅ Fetch products from Google Sheet API (server-side filtering)
  useEffect(() => {
    const fetchProducts = async () => {
      let url = API_URL;
      if (activeCategory) {
        url += `?category=${encodeURIComponent(activeCategory)}`;
      }

      // If cached, use cache
      if (cache[activeCategory || 'all']) {
        setProducts(cache[activeCategory || 'all']);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) {
          setFetchError('API did not return an array.');
          setProducts([]);
          setLoading(false);
          return;
        }

        const formatted = data.map((item, index) => ({
          id: item.id || `${item.name}-${index}`,
          name: item.name,
          price: parseFloat(item.price),
          img: item.img,
          category: item.category,
        }));

        setProducts(formatted);
        setCache((prev) => ({ ...prev, [activeCategory || 'all']: formatted }));
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching sheet data', err);
        setFetchError('Failed to fetch products from Google Sheet API.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, cache]);

  useEffect(() => {
    if (activeCategory) {
      navigate(`/homelifestyles/products/${activeCategory}`, { replace: true });
    } else {
      navigate('/homelifestyles/products', { replace: true });
    }
  }, [activeCategory, navigate]);

  const searchedProducts = searchQuery
    ? products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : products;

  const handleAddToCart = (product) => {
    addToCart(product);
    setSuccessMessage(`${product.name} added to cart!`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <div className="homelifestyles-products">
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={16} />
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home & Lifestyle</span>
        {activeCategory && (
          <>
            <ChevronRight size={16} />
            <span className="active-category">
              {categories.find((c) => c.id === activeCategory)?.name}
            </span>
          </>
        )}
      </div>

      {fetchError && <div style={{ color: 'red', margin: '1em 0' }}>{fetchError}</div>}

      <div className="category-filters">
        <button
          onClick={() => setActiveCategory(null)}
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

      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        style={{ margin: '1em 0', padding: '0.5em', width: '100%' }}
      />

      {loading ? (
        <div className="loader">Loading products...</div>
      ) : (
        <div id="homestyle-products-grid" className="products-grid">
          {searchedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.img || 'https:/\/via.placeholder.com/150?text=No+Image'}
                alt={product.name}
              />
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

      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

// 📌 Combined Export
const Homelifestyles = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/homelifestyles/products')) {
    return <HomelifestylesProducts />;
  }
  return <HomelifestylesCategories />;
};

export default Homelifestyles;
export { HomelifestylesCategories, HomelifestylesProducts };
