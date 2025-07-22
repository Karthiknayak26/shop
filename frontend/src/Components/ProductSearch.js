import React, { useState, useEffect } from "react";
import { useCart } from "../MyComponents/Header/CartContext";

const API_URL = "https://script.google.com/macros/s/AKfycbyG8C2ly8LvcIqxj9gesiTZDrekhGotvnbp9kg3-3s9LsUvHwP9Z_8wMENfX-rw62Q0GQ/exec";

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFiltered([]);
    } else {
      setFiltered(
        products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, products]);

  const handleAddToCart = (product) => {
    // The CartContext expects an id; use name as fallback if no id
    const cartProduct = {
      id: product.id || product.name, // fallback to name if no id
      name: product.name,
      price: product.price,
      img: product.img,
      quantity: 1,
    };
    addToCart(cartProduct);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", boxShadow: "0 2px 8px #eee", borderRadius: 30, width: "100%" }}>
        <input
          type="text"
          placeholder="Search for Products and more"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "30px 0 0 30px",
            fontSize: "18px",
            outline: "none",
            fontStyle: "italic"
          }}
        />
        <button
          style={{
            border: "none",
            background: "#1976d2",
            color: "#fff",
            borderRadius: "0 30px 30px 0",
            padding: "0 24px",
            fontSize: "18px",
            height: 52,
            cursor: "pointer"
          }}
          disabled
        >
          SEARCH
        </button>
      </div>
      {loading && <div style={{ marginTop: 10, textAlign: "center" }}>Loading...</div>}
      {filtered.length > 0 && (
        <ul style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "0 0 20px 20px",
          zIndex: 10,
          maxHeight: 350,
          overflowY: "auto",
          boxShadow: "0 4px 16px #eee"
        }}>
          {filtered.map(product => (
            <li key={product.name} style={{ display: "flex", alignItems: "center", padding: 12, borderBottom: "1px solid #f3f3f3" }}>
              <img src={product.img} alt={product.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, marginRight: 12 }} />
              <span style={{ flex: 1, fontWeight: 500 }}>{product.name} <span style={{ color: '#1976d2', marginLeft: 8 }}>₹{product.price}</span></span>
              <button onClick={() => handleAddToCart(product)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
                Add to Cart
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductSearch;
