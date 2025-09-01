import React, { useState, useEffect } from "react";
import "./ProductCard.css";
import { getOptimizedImageProps } from "../utils/imageOptimizer";

const ProductCard = ({ product }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if (!product || typeof product !== "object") {
    return <div className="border p-4">Invalid Product Data</div>;
  }

  // Determine image size based on screen width
  const getImageSize = () => {
    if (screenWidth <= 480) return { width: 150, height: 150 };
    if (screenWidth <= 768) return { width: 180, height: 180 };
    return { width: 250, height: 250 };
  };
  
  const imageSize = getImageSize();
  const imageProps = getOptimizedImageProps(
    product.image || "/placeholder.png",
    product.name,
    {
      className: "product-image w-full object-cover rounded mb-4",
      width: imageSize.width,
      height: imageSize.height,
    }
  );

  return (
    <div className="product-card-container border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
      <a href={product.link} target="_blank" rel="noopener noreferrer" className="product-image-link">
        <img {...imageProps} />
      </a>
      <h2 className="product-title text-lg font-semibold mb-2">{product.name}</h2>
      <div className="product-price-container flex justify-between items-center">
        <span className="product-price text-xl font-bold text-green-600">
          {typeof product.price === "string" ? product.price : "Price not available"}
        </span>
      </div>
      <p className="product-description text-gray-600 mt-2 text-sm">{product.description}</p>
      <div className={`product-stock mt-2 text-sm ${product.stock_status === "In Stock" ? "text-green-500" : "text-red-500"}`}>
        {product.stock_status}
      </div>
    </div>
  );
};

export default ProductCard;
