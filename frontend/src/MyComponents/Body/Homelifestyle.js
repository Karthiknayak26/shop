import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import './Home.css';
import { useLocation } from 'react-router-dom';

// 📌 Home & Lifestyle Categories Component
const HomelifestylesCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'Baby-Care-Products',
      name: 'Baby-Care-Products',
      img: 'https://cdn-icons-png.flaticon.com/512/1046/1046859.png',
    },
    {
      id: 'decor',
      name: 'Home Decor',
      img: 'https://cdn-icons-png.flaticon.com/512/1046/1046875.png',
    },
    {
      id: 'kitchen',
      name: 'Kitchen & Dining',
      img: 'https://cdn-icons-png.flaticon.com/512/1046/1046861.png',
    },
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
  const { addToCart } = useCart();

  const categories = [
    { id: 'Baby-Care-Products', name: 'Baby-Care-Products' },
    { id: 'decor', name: 'Home Decor' },
    { id: 'kitchen', name: 'Kitchen & Dining' },
  ];

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbwd_c3v7MORVTbRI5ztQR5xcKXJUolvtgcUMotqzXyqpuIb_1Eqs0AyFLYni-MZTuFj/exec')
      .then((res) => res.json())
      .then((data) => {
        console.log('Raw API data:', data); // Debug log
        console.log('Raw API data sample:', data.slice(0, 5)); // Log first 5 items
        if (!Array.isArray(data)) {
          setFetchError('API did not return an array.');
          setProducts([]);
          return;
        }
        const formatted = data.map((item, index) => ({
          id: item.id || `${item.name}-${index}`,
          name: item.name,
          price: parseFloat(item.price),
          img: item.img,
          category: item.category,
        }));
        console.log('Formatted products:', formatted); // Debug log
        setProducts(formatted);
        setFetchError(null);
      })
      .catch((err) => {
        setFetchError('Failed to fetch products from Google Sheet API.');
      });
  }, []);

  useEffect(() => {
    if (activeCategory) {
      navigate(`/homelifestyles/products/${activeCategory}`, { replace: true });
    } else {
      navigate('/homelifestyles/products', { replace: true });
    }
  }, [activeCategory, navigate]);

  console.log('Active category:', activeCategory); // Debug log

  const filteredProducts = activeCategory
    ? products.filter((product) => product.category === activeCategory)
    : products;

  console.log('Filtered products:', filteredProducts); // Debug log

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
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

      {fetchError && (
        <div style={{ color: 'red', margin: '1em 0' }}>
          {fetchError}
        </div>
      )}

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

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.img || 'https://via.placeholder.com/150?text=No+Image'} alt={product.name} />
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

      {filteredProducts.length === 0 && (
        <div className="no-products">No products found in this category</div>
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