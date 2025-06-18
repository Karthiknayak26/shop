import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    img: ""
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("name", product.name);
      formData.append("category", product.category);
      formData.append("price", product.price);
      formData.append("img", product.img);

      const response = await axios.post(
        "https://script.google.com/macros/s/AKfycbw3Ls5_6n281F0-QhhmzSFujfJzxaViLo8I4q5Mw2YBpT0TsltQdEgvvqviFj1ZRv4apQ/exec",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        }
      );

      if (response.data.status === "success") {
        alert("✅ Product added successfully!");
        setProduct({ name: "", category: "", price: "", img: "" });
      } else {
        alert("❌ Failed to add product: " + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Something went wrong.");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>
      <input
        name="name"
        placeholder="Name"
        value={product.name}
        onChange={handleChange}
        className="border p-2 w-full mb-2"
      />
      <input
        name="price"
        placeholder="Price"
        value={product.price}
        onChange={handleChange}
        className="border p-2 w-full mb-2"
      />
      <input
        name="category"
        placeholder="Category"
        value={product.category}
        onChange={handleChange}
        className="border p-2 w-full mb-2"
      />
      <input
        name="img"
        placeholder="Image URL"
        value={product.img}
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ➕ Add Product
      </button>
    </div>
  );
};

export default AddProduct;
