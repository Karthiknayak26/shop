// src/MyComponents/ProductDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // For getting the product ID from the URL

const ProductDetail = () => {
  const { id } = useParams();  // Extract the product ID from the URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch product details from your backend API
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProduct();
  }, [id]);  // Fetch when the product ID changes

  if (!product) {
    return <div>Loading...</div>;  // Show loading while fetching
  }

  return (
    <div className="product-detail">
      <h2>{product.title}</h2>
      <img src={product.imageUrl} alt={product.title} />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Discount: {product.discount}% OFF</p>
      <button>Add to Cart</button> {/* Optional functionality */}
    </div>
  );
};

export default ProductDetail;
