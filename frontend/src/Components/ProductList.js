import React from "react";
import ProductCard from "./ProductCard";
import "./ProductList.css";

const ProductList = ({ products }) => {
  console.log("📌 Rendering Products:", products); // Debugging

  if (!Array.isArray(products) || products.length === 0) {
    return <div className="text-center my-4 p-6">No products found</div>;
  }

  return (
    <div className="product-list-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-2 sm:p-4">
      {products.map((product, index) => (
        <div key={index} className="product-card-wrapper">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;
