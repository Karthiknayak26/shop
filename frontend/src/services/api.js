import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Backend URL

export const api = {
  async searchProducts(query, page = 1) {
    try {
      const response = await axios.get(`${API_URL}/products/search`, {
        params: { query, page },
      });

      console.log("🟢 API Response in Frontend:", response.data); // Debugging

      if (!response.data.success || !Array.isArray(response.data.products)) {
        throw new Error("Invalid product data received from backend.");
      }

      return response.data.products;
    } catch (error) {
      console.error("❌ Fetch Error:", error.message);
      throw new Error(error.response?.data?.error || "Failed to fetch products.");
    }
  },
};
