import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import './electronics.css';
import { useLocation } from 'react-router-dom';

// 📌 Electronics Categories Component
const ElectronicsCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'Air_Freshners',
      name: 'Air_Freshners',
      img: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
    },
    {
      id: 'appliances',
      name: 'Home Appliances',
      img: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png',
    },
    {
      id: 'computers',
      name: 'Computers & Accessories',
      img: 'https://cdn-icons-png.flaticon.com/512/1055/1055687.png',
    },
  ];

  return (
    <div className="electronics-categories">
      <header>
        <h1>Best Deals On Electronics</h1>
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
  const { addToCart } = useCart();

  const categories = [
    { id: 'Air_Freshners', name: 'Air_Freshners' },
    { id: 'appliances', name: 'Home Appliances' },
    { id: 'computers', name: 'Computers & Accessories' },
  ];

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbytjEMd87XgeQiYYO_5Jrc3-Xg1LOUW1ybIshCwJMr0FRpaBbbPC3Stg_ULYe7d3Fom/exec')
      .then((res) => res.json())
      .then((data) => {
        console.log('API response:', data); // Debug log
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
      navigate(`/electronics/products/${activeCategory}`, { replace: true });
    } else {
      navigate('/electronics/products', { replace: true });
    }
  }, [activeCategory, navigate]);

  const filteredProducts = activeCategory
    ? products.filter((product) => product.category === activeCategory)
    : products;
  console.log('Filtered products:', filteredProducts); // Debug log

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
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

      {filteredProducts.length === 0 && (
        <div className="no-products">No products found in this category</div>
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
