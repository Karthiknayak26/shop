import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
// import Sidebar from './Sidebar';
import AddProduct from './components/Addproduct';
import Login from './pages/Login';
import Feedback from './pages/Feedback';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // If authenticated, show the main app
  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Add logout button */}


        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/feedback" element={<Feedback />} />
          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;