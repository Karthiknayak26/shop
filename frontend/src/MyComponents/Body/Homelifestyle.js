import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import './Home.css';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import ProductSkeleton from '../../Components/Skeletons/ProductSkeleton';
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
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const categories = [
    { id: 'Baby-Care-Products', name: 'Baby Care' },
    { id: 'decor', name: 'Shampoos and Soaps' },
    { id: 'kitchen', name: 'Creams and Lotions' },
  ];

  const { data: products = [], isLoading: loading, error: fetchError } = useQuery(
    ['homelifestyles', activeCategory],
    ({ signal }) => api.getProducts({ category: activeCategory, signal }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const handlePrefetch = (categoryId) => {
    queryClient.prefetchQuery(['homelifestyles', categoryId], ({ signal }) => 
      api.getProducts({ category: categoryId, signal })
    );
  };

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
            onMouseEnter={() => handlePrefetch(category.id)}
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
        <div id="homestyle-products-grid" className="products-grid">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
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
