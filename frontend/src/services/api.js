import axios from "axios";

const API_URL = "https://shop-backend-92zc.onrender.com"; // Backend URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Product search
  async searchProducts(query, page = 1) {
    try {
      const response = await apiClient.get(`/products/search`, {
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

  // Cart operations
  async getCart() {
    try {
      const response = await apiClient.get('/cart');
      return response.data.cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cart');
    }
  },

  async addToCart(productId, quantity = 1) {
    try {
      const response = await apiClient.post('/cart/add', { productId, quantity });
      return response.data.cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to add item to cart');
    }
  },

  async updateCartItem(productId, quantity) {
    try {
      const response = await apiClient.put('/cart/update', { productId, quantity });
      return response.data.cart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error(error.response?.data?.message || 'Failed to update cart item');
    }
  },

  async removeFromCart(productId) {
    try {
      const response = await apiClient.delete(`/cart/remove/${productId}`);
      return response.data.cart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
    }
  },

  async clearCart() {
    try {
      const response = await apiClient.delete('/cart/clear');
      return response.data.cart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  },

  async syncCart(localCartItems) {
    try {
      const response = await apiClient.post('/cart/sync', { localCartItems });
      return response.data.cart;
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to sync cart');
    }
  },

  // Auth operations
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout() {
    localStorage.removeItem('authToken');
  }
};
