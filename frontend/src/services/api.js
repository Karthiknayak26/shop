import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if refresh token call itself fails
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('authToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Product operations
  async getProducts({ category, page = 1, limit = 20, signal } = {}) {
    try {
      const response = await apiClient.get('/products', {
        params: { category, page, limit },
        signal
      });
      // Handle the paginated response format
      return response.data.products || [];
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request cancelled');
      }
      throw new Error(error.response?.data?.message || "Failed to fetch products.");
    }
  },

  // Product search
  async searchProducts(query, page = 1) {
    try {
      const response = await apiClient.get(`/products/search`, {
        params: { query, page },
      });

      if (!response.data.success || !Array.isArray(response.data.products)) {
        throw new Error("Invalid product data received from backend.");
      }

      return response.data.products;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch products.");
    }
  },

  // Cart operations
  async getCart() {
    try {
      const response = await apiClient.get('/cart');
      return response.data.cart;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart');
    }
  },

  async addToCart(productId, quantity = 1) {
    try {
      const response = await apiClient.post('/cart/add', { productId, quantity });
      return response.data.cart;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart');
    }
  },

  async updateCartItem(productId, quantity) {
    try {
      const response = await apiClient.put('/cart/update', { productId, quantity });
      return response.data.cart;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item');
    }
  },

  async removeFromCart(productId) {
    try {
      const response = await apiClient.delete(`/cart/remove/${productId}`);
      return response.data.cart;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
    }
  },

  async clearCart() {
    try {
      const response = await apiClient.delete('/cart/clear');
      return response.data.cart;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  },

  async syncCart(localCartItems) {
    try {
      const response = await apiClient.post('/cart/sync', { localCartItems });
      return response.data.cart;
    } catch (error) {
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
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};
