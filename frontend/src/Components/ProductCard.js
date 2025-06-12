import React from "react";

const ProductCard = ({ product }) => {
  if (!product || typeof product !== "object") {
    return <div className="border p-4">Invalid Product Data</div>;
  }

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
      <a href={product.link} target="_blank" rel="noopener noreferrer">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover rounded mb-4"
        />
      </a>
      <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">
          {typeof product.price === "string" ? product.price : "Price not available"}
        </span>
      </div>
      <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
      <div className={`mt-2 text-sm ${product.stock_status === "In Stock" ? "text-green-500" : "text-red-500"}`}>
        {product.stock_status}
      </div>
    </div>
  );
};

export default ProductCard;
