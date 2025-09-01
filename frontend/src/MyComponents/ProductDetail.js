import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Simulate fetching product data by ID
    const fetchProduct = async () => {
      const response = await fetch(`http:/\/localhost:5000/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">{product.title}</h1>
      <p>{product.description}</p>
      <p className="text-xl font-semibold">{`Price: $${product.price}`}</p>
      <p className="text-gray-500">{`Discount: ${product.discountType} ${product.discount}%`}</p>
    </div>
  );
};

export default ProductDetail;
