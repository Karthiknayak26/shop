import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';

import Header from './MyComponents/Header/Header';
import Header1 from './MyComponents/Header/Header1';
import Footer from './MyComponents/Footer';
import Section from './MyComponents/Section';
import Login from './MyComponents/Header/Login';
import Electronics, { ElectronicsCategories, ElectronicsProducts } from './MyComponents/Body/Electronics';
import Homelifestyle, { HomelifestylesCategories, HomelifestylesProducts } from './MyComponents/Body/Homelifestyle';
import ProductDetail from './MyComponents/ProductDetail';
import Slider from './MyComponents/Body/Slider';
import Register from './MyComponents/Header/Register';
import HelpCenter from './MyComponents/Header/HelpCenter';
import OrderTracking from './MyComponents/Header/OrderTracking';
import CartPage from './MyComponents/Header/CartPage';
import CheckoutPage from './MyComponents/Header/CheckoutPage';
import OrderConfirmationPage from './MyComponents/Header/OrderConfirmationPage';
import OrderHistoryPage from './MyComponents/OrderHistoryPage';
import GroceryDeals, { GroceryCategories, GroceryProducts } from './MyComponents/Body/GroceryDeals';
import { CartProvider } from './MyComponents/Header/CartContext';
import { UserProvider } from './MyComponents/Header/UserContext';
import ProfilePage from './MyComponents/ProfilePage';
import ProfileChangePassword from './MyComponents/ProfileChangePassword';

// Import performance and service worker utilities
import performanceService from './services/performanceService';
import { initializeServiceWorker } from './utils/serviceWorkerRegistration';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiButton: { defaultProps: { disableRipple: true } },
    MuiCard: { defaultProps: { elevation: 1 } },
  },
});

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    performanceService.init();

    // Initialize service worker
    initializeServiceWorker({
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully:', registration);
      },
      onUpdate: (registration) => {
        console.log('Service Worker updated:', registration);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        }
      },
    });

    // Performance monitoring observer
    const performanceObserver = (metric) => {
      console.log('Performance Metric:', metric);
      if (metric.level === 'warning' || metric.level === 'error') {
        console.warn('Critical performance issue detected:', metric);
      }
    };

    performanceService.addObserver(performanceObserver);

    // Cleanup
    return () => {
      performanceService.removeObserver(performanceObserver);
    };
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Main Layout Route */}
                <Route
                  path="/"
                  element={
                    <>
                      <Header />
                      <Header1 />
                      <Section />
                      <Slider />
                      <div id="grocery-section">
                        <GroceryDeals />
                      </div>
                      <div id="electronics-section">
                        <Electronics />
                      </div>
                      <div id="homestyle-section">
                        <Homelifestyle />
                      </div>
                      <Footer />
                    </>
                  }
                />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Product Routes */}
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/groceries" element={<GroceryCategories />} />
                <Route path="/groceries/products" element={<GroceryProducts />} />
                <Route path="/groceries/products/:categoryId" element={<GroceryProducts />} />
                <Route path="/electronics" element={<ElectronicsCategories />} />
                <Route path="/electronics/products" element={<ElectronicsProducts />} />
                <Route path="/electronics/products/:categoryId" element={<ElectronicsProducts />} />
                <Route path="/homelifestyle" element={<HomelifestylesCategories />} />
                <Route path="/homelifestyles/products" element={<HomelifestylesProducts />} />
                <Route path="/homelifestyles/products/:categoryId" element={<HomelifestylesProducts />} />

                {/* Shopping Routes */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

                {/* User Routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/change-password" element={<ProfileChangePassword />} />
                <Route path="/order-history" element={<OrderHistoryPage />} />

                {/* Help & Support Routes */}
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/order-tracking" element={<OrderTracking />} />

                {/* Catch-all route for 404 */}
                <Route
                  path="*"
                  element={
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        textAlign: 'center',
                        padding: '20px',
                      }}
                    >
                      <h1>404 - Page Not Found</h1>
                      <p>The page you're looking for doesn't exist.</p>
                      <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
                        Return to Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </UserProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
