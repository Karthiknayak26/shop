import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../Header/CartContext';
import './grocery-deals.css';

// Main Categories Component
const GroceryCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'biscuits-packaged',
      name: "Biscuits & Packaged Foods",
      discount: "Up To 50% Off",
      img: "/images/1.png", // Update path
    },
    {
      id: 'cooking',
      name: "Cooking Essentials",
      discount: "Up To 30% Off",
      img: "/images/2.png", // Update path
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
            className="category-card"
          >
            <div className="category-image">
              <img src={category.img} alt={category.name} />
            </div>
            <div className="category-content">
              <h3>{category.discount}</h3>
              <p>{category.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Products Component
const GroceryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: "Parle-G Biscuits",
      price: 20,  // Changed to number for easier calculations
      category: "biscuits-packaged",
      img: "/images/1.png",
    },
    {
      id: 2,
      name: "Good Day Biscuits",
      price: 30,  // Changed to number for easier calculations
      category: "biscuits-packaged",
      img: "/images/2.png",
    },
  ];

  const categories = [
    { id: 'biscuits-packaged', name: 'Biscuits & Packaged Foods' },
    { id: 'cooking', name: 'Cooking Essentials' },
  ];

  const filteredProducts = activeCategory
    ? products.filter((product) => product.category === activeCategory)
    : products;

  useEffect(() => {
    if (activeCategory) {
      navigate(`/groceries/products/${activeCategory}`, { replace: true });
    } else {
      navigate('/groceries/products', { replace: true });
    }
  }, [activeCategory, navigate]);

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optional: Add visual feedback
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="grocery-products">
      <div className="breadcrumb">
        <span>Home</span>
        <ChevronRight size={16} />
        <span>Groceries</span>
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

// GroceryDeals Component
const GroceryDeals = () => {
  return <GroceryCategories />;
};

export default GroceryDeals;
export { GroceryCategories, GroceryProducts };