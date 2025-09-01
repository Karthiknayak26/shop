import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useUser } from './UserContext';

const CartContext = createContext();

// Local storage keys
const LOCAL_CART_KEY = 'kandukuru_cart';
const CART_SYNC_KEY = 'kandukuru_cart_sync';

// Helper functions for localStorage
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user } = useUser();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadFromLocalStorage(LOCAL_CART_KEY, []);
    console.log('🛒 Loading cart from localStorage:', savedCart);
    setCartItems(savedCart);
    setHasInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (hasInitialized) {
      console.log('💾 Saving cart to localStorage:', cartItems);
      saveToLocalStorage(LOCAL_CART_KEY, cartItems);
    }
  }, [cartItems, hasInitialized]);

  // Sync with backend when user logs in (always, not just every 5 minutes)
  useEffect(() => {
    if (user && user.id && hasInitialized) {
      syncCartWithBackend();
    }
  }, [user, hasInitialized]);

  // Sync cart with backend
  const syncCartWithBackend = useCallback(async () => {
    if (!user?.id) return;

    console.log('🔄 Starting cart sync with backend...');
    setIsLoading(true);
    try {
      // Get server cart
      const serverCart = await api.getCart();
      console.log('📡 Server cart received:', serverCart);

      // Get local cart
      const localCart = loadFromLocalStorage(LOCAL_CART_KEY, []);
      console.log('🏠 Local cart from localStorage:', localCart);

      if (localCart.length > 0) {
        // Merge local cart with server cart
        console.log('🔀 Merging local cart with server cart...');
        const mergedCart = await api.syncCart(localCart);
        console.log('✅ Merged cart result:', mergedCart);
        setCartItems(mergedCart.items || []);
        // Clear local cart after successful sync
        saveToLocalStorage(LOCAL_CART_KEY, []);
      } else if (serverCart.items && serverCart.items.length > 0) {
        // Only load server cart if it has items
        console.log('📥 Loading server cart items:', serverCart.items);
        setCartItems(serverCart.items || []);
      } else {
        console.log('📭 Both local and server carts are empty, keeping current state');
      }
      // If both local and server carts are empty, keep the current state

      setLastSync(new Date().toISOString());
      saveToLocalStorage(CART_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('❌ Error syncing cart with backend:', error);
      // Keep local cart if sync fails
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add item to cart
  const addToCart = useCallback(async (product) => {
    const newCartItems = [...cartItems];
    const existingItemIndex = newCartItems.findIndex(item => item.id === product.id);
    const quantityToAdd = product.quantity || 1;

    if (existingItemIndex > -1) {
      newCartItems[existingItemIndex].quantity += quantityToAdd;
    } else {
      newCartItems.push({ ...product, quantity: quantityToAdd });
    }

    setCartItems(newCartItems);

    // Sync with backend if user is logged in
    if (user?.id) {
      try {
        await api.addToCart(product.id, quantityToAdd);
      } catch (error) {
        console.error('Error syncing add to cart:', error);
        // Keep local changes even if backend sync fails
      }
    }
  }, [cartItems, user]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));

    // Sync with backend if user is logged in
    if (user?.id) {
      try {
        await api.removeFromCart(productId);
      } catch (error) {
        console.error('Error syncing remove from cart:', error);
        // Keep local changes even if backend sync fails
      }
    }
  }, [user]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );

    // Sync with backend if user is logged in
    if (user?.id) {
      try {
        await api.updateCartItem(productId, quantity);
      } catch (error) {
        console.error('Error syncing quantity update:', error);
        // Keep local changes even if backend sync fails
      }
    }
  }, [user, removeFromCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    setCartItems([]);
    saveToLocalStorage(LOCAL_CART_KEY, []);

    // Sync with backend if user is logged in
    if (user?.id) {
      try {
        await api.clearCart();
      } catch (error) {
        console.error('Error syncing clear cart:', error);
        // Keep local changes even if backend sync fails
      }
    }
  }, [user]);

  // Get total price
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Get total item count
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Force sync with backend
  const forceSync = useCallback(async () => {
    if (user?.id) {
      await syncCartWithBackend();
    }
  }, [user, syncCartWithBackend]);

  // Check if cart is synced
  const isSynced = useCallback(() => {
    if (!user?.id) return true; // Guest users are always "synced"
    return lastSync && (Date.now() - new Date(lastSync).getTime()) < 300000; // 5 minutes
  }, [user, lastSync]);

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      lastSync,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      forceSync,
      isSynced,
      syncCartWithBackend
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};