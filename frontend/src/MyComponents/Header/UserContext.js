import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../../services/api';

const UserContext = createContext();

// Helper functions for localStorage
const saveUserToStorage = (userData) => {
  try {
    localStorage.setItem('kandukuru_user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('kandukuru_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
};

const clearUserFromStorage = () => {
  try {
    localStorage.removeItem('kandukuru_user');
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = loadUserFromStorage();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      saveUserToStorage(user);
    } else {
      clearUserFromStorage();
    }
  }, [user]);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      user: { ...prevUser.user, ...userData }
    }));
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isLoading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};