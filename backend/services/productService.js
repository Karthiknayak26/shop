const axios = require("axios");

const RAPID_API_HOST = process.env.RAPID_API_HOST;
const RAPID_API_KEY = process.env.RAPID_API_KEY;

const fetchProducts = async (query, page = 1) => {
  try {
    if (!RAPID_API_HOST || !RAPID_API_KEY) {
      throw new Error("Missing API credentials. Check your .env file.");
    }

    const url = `https://${RAPID_API_HOST}/walmart?query=${query}&page=${page}`;
    console.log(`🔎 Fetching data from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
    });

    console.log("✅ Full API Response:", JSON.stringify(response.data, null, 2));

    // Ensure response is an array, otherwise return an empty list
    const productList = Array.isArray(response.data) ? response.data : [];

    if (!productList.length) {
      console.warn("⚠️ No products found in API response.");
      return { success: true, products: [] };
    }

    return {
      success: true,
      products: productList.map((item) => ({
        id: item.position || "N/A",
        name: item.title || "Unknown Product",
        price: item.price?.currentPrice || "Price not available",
        image: item.image || "/placeholder.png",
        description: `Reviews: ${item.reviewsCount || "0"} | Rating: ${item.ratings || "N/A"}/5`,
        stock_status: item.outOfStock ? "Out of Stock" : "In Stock",
        link: item.link || "#",
      })),
    };
  } catch (error) {
    console.error("❌ API Request Failed:", error.response ? error.response.data : error.message);
    return { success: true, products: [] }; // Ensure frontend always receives an array
  }
};

module.exports = { fetchProducts };
