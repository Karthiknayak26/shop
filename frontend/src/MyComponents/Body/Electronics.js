import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import QuantitySelector from '../Header/QuantitySelector';
import './electronics.css';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import ProductSkeleton from '../../Components/Skeletons/ProductSkeleton';
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  const categories = [
    { id: 'Air_Freshners', name: 'Air Freshners' },
    { id: 'Pooja items', name: 'Pooja Items' },
    { id: 'Cleaning essentials', name: 'Cleaning Essentials' },
    { id: 'miscellineous', name: 'Miscellineous' }
  ];

  const { data: products = [], isLoading: loading, error: fetchError } = useQuery(
    ['electronics', activeCategory],
    ({ signal }) => api.getProducts({ category: activeCategory, signal }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const handlePrefetch = (categoryId) => {
    queryClient.prefetchQuery(['electronics', categoryId], ({ signal }) => 
      api.getProducts({ category: categoryId, signal })
    );
  };

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
          placeholder="Search products in this category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      {loading ? (
        <div id="electronics-products-grid" className="products-grid">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
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
