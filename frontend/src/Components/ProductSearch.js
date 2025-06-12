import React, { useState } from "react";
import { api } from "../services/api";
import ProductList from "./ProductList";
import SearchForm from "./SearchForm";

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedProducts = await api.searchProducts(query, 1);
      setProducts(fetchedProducts);

      console.log("✅ Products Set in State:", fetchedProducts); // Debugging
    } catch (err) {
      console.error("❌ Error Fetching Products:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold my-4">Walmart Product Prices</h1>
      <SearchForm onSearch={handleSearch} />
      {error && <div className="text-red-500 my-4">{error}</div>}
      {loading ? <div className="text-center my-4">Loading...</div> : <ProductList products={products} />}
    </div>
  );
};

export default ProductSearch;
