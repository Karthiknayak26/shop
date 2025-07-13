import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import './grocery-deals.css';
import { useLocation } from 'react-router-dom';

// 📌 Grocery Categories Component
const GroceryCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'biscuits-packaged',
      name: "Biscuits & Packaged Foods",
      img: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
    },
    {
      id: 'cooking',
      name: "Cooking Essentials",
      img: "https://cdn-icons-png.flaticon.com/512/3174/3174880.png",
    },
  ];

  return (
    <div className="grocery-categories">
      <header>
        <h1>Best Deals On Grocery</h1>
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

// 📌 Grocery Products Component (Dynamic)
const GroceryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  const categories = [
    { id: 'biscuits-packaged', name: 'Biscuits & Packaged Foods' },
    { id: 'cooking', name: 'Cooking Essentials' },
  ];

  // ✅ Fetch products from Google Sheet API
  useEffect(() => {
    console.log('Fetching products from Google Sheet...');
    fetch('https://api.sheetbest.com/sheets/dbb34df6-7687-434a-8b01-c7716da9e92b')
      .then((res) => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('Raw API data:', data);
        const formatted = data.map((item, index) => ({
          id: item.id || `${item.name}-${index}`,
          name: item.name,
          price: parseFloat(item.price),
          img: item.img,
          category: item.category,
        }));
        console.log('Formatted products:', formatted);
        setProducts(formatted);
      })
      .catch((err) => {
        console.error('Error fetching sheet data:', err);
        // Set some fallback data for testing
        setProducts([
          {
            id: 'test-1',
            name: 'Test Product',
            price: 99.99,
            img: 'https://via.placeholder.com/150',
            category: 'biscuits-packaged'
          }
        ]);
      });
  }, []);

  useEffect(() => {
    if (activeCategory) {
      navigate(`/groceries/products/${activeCategory}`, { replace: true });
    } else {
      navigate('/groceries/products', { replace: true });
    }
  }, [activeCategory, navigate]);

  const filteredProducts = activeCategory
    ? products.filter((product) => product.category === activeCategory)
    : products;

  console.log('Active category:', activeCategory);
  console.log('All products:', products);
  console.log('Filtered products:', filteredProducts);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="grocery-products">
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={16} />
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Groceries</span>
        {activeCategory && (
          <>
            <ChevronRight size={16} />
            <span className="active-category">
              {categories.find((c) => c.id === activeCategory)?.name}
            </span>
          </>
        )}
      </div>

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
const GroceryDeals = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/groceries/products')) {
    return <GroceryProducts />;
  }
  return <GroceryCategories />;
};

export default GroceryDeals;
export { GroceryCategories, GroceryProducts };
