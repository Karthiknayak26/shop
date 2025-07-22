import React from "react";
import ProductCard from "./ProductCard";

const ProductList = ({ products }) => {
  console.log("📌 Rendering Products:", products); // Debugging

  if (!Array.isArray(products) || products.length === 0) {
    return <div className="text-center my-4">No products found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <div className="product-card">
          <ProductCard key={index} product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;
