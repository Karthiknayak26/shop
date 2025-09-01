import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import QuantitySelector from '../Header/QuantitySelector';
import './electronics.css';
import { useLocation } from 'react-router-dom';

const API_URL = "https:/\/script.google.com/macros/s/AKfycbyWg9bxMA2QIFnvdO_3eBaavqvMLzTYw5dUDdB1Tazapi8VxC5ZjVb82tlmQNGpbZ5u/exec";
// <-- Replace with your Apps Script deployment URL

// 📌 Electronics Categories Component
const ElectronicsCategories = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 'Air_Freshners', name: 'Air Freshners', img: require('./airfreshners.png') },
    { id: 'Pooja items', name: 'Pooja Items', img: require('./pojjaitems.png') },
    { id: 'Cleaning essentials', name: 'Cleaning Essentials', img: require('./cleaning essentials.png') },
    { id: 'miscellineous', name: 'Miscellineous', img: require('./miss.png') }
  ];

  return (
    <div className="electronics-categories">
      <header>
        <h1>Home Essentials</h1>
      </header>
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/electronics/products/${category.id}`)}
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

// 📌 Electronics Products Component (Dynamic)
const ElectronicsProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [products, setProducts] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const categories = [
    { id: 'Air_Freshners', name: 'Air Freshners' },
    { id: 'Pooja items', name: 'Pooja Items' },
    { id: 'Cleaning essentials', name: 'Cleaning Essentials' },
    { id: 'miscellineous', name: 'Miscellineous' }
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
      navigate(`/electronics/products/${activeCategory}`, { replace: true });
    } else {
      navigate('/electronics/products', { replace: true });
    }
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
    setSuccessMessage(`${productWithQuantity.name} (${productWithQuantity.quantity}) added to cart!`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleCloseQuantitySelector = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="electronics-products">
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={16} />
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Electronics</span>
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

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search products in this category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      {loading ? (
        <div className="loader">Loading products...</div>
      ) : (
        <div id="electronics-products-grid" className="products-grid">
          {searchedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.img} alt={product.name} />
              <div className="product-content">
                <h3>{product.name}</h3>
                <p>₹{product.price}</p>
                <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
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

      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

// 📌 Combined Export
const Electronics = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/electronics/products')) {
    return <ElectronicsProducts />;
  }
  return <ElectronicsCategories />;
};

export default Electronics;
export { ElectronicsCategories, ElectronicsProducts };
