import React, { useEffect, Suspense } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';

import Header from './MyComponents/Header/Header';
import Header1 from './MyComponents/Header/Header1';
import Footer from './MyComponents/Footer';
import Section from './MyComponents/Section';
import Slider from './MyComponents/Body/Slider';
import GroceryDeals from './MyComponents/Body/GroceryDeals';
import Electronics from './MyComponents/Body/Electronics';
import Homelifestyle from './MyComponents/Body/Homelifestyle';

import { CartProvider } from './MyComponents/Header/CartContext';
import { UserProvider } from './MyComponents/Header/UserContext';
import FloatingCartButton from './Components/FloatingCartButton/FloatingCartButton';
import CartToastNotification from './Components/CartToastNotification/CartToastNotification';
import performanceService from './services/performanceService';
import { initializeServiceWorker } from './utils/serviceWorkerRegistration';

// Lazily load sub-routes and secondary pages to reduce initial bundle size
const Login = React.lazy(() => import('./MyComponents/Header/Login'));
const Register = React.lazy(() => import('./MyComponents/Header/Register'));
const ProductDetail = React.lazy(() => import('./MyComponents/ProductDetail'));
const CartPage = React.lazy(() => import('./MyComponents/Header/CartPage'));
const CheckoutPage = React.lazy(() => import('./MyComponents/Header/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('./MyComponents/Header/OrderConfirmationPage'));
const OrderHistoryPage = React.lazy(() => import('./MyComponents/OrderHistoryPage'));
const ProfilePage = React.lazy(() => import('./MyComponents/ProfilePage'));
const ProfileChangePassword = React.lazy(() => import('./MyComponents/ProfileChangePassword'));
const HelpCenter = React.lazy(() => import('./MyComponents/Header/HelpCenter'));
const OrderTracking = React.lazy(() => import('./MyComponents/Header/OrderTracking'));

// Helper lazy loaders for named exports
const GroceryCategories = React.lazy(() => import('./MyComponents/Body/GroceryDeals').then(m => ({ default: m.GroceryCategories })));
const GroceryProducts = React.lazy(() => import('./MyComponents/Body/GroceryDeals').then(m => ({ default: m.GroceryProducts })));
const ElectronicsCategories = React.lazy(() => import('./MyComponents/Body/Electronics').then(m => ({ default: m.ElectronicsCategories })));
const ElectronicsProducts = React.lazy(() => import('./MyComponents/Body/Electronics').then(m => ({ default: m.ElectronicsProducts })));
const HomelifestylesCategories = React.lazy(() => import('./MyComponents/Body/Homelifestyle').then(m => ({ default: m.HomelifestylesCategories })));
const HomelifestylesProducts = React.lazy(() => import('./MyComponents/Body/Homelifestyle').then(m => ({ default: m.HomelifestylesProducts })));

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

// React Error Boundary to prevent crashes from breaking the whole UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '20px',
          fontFamily: 'sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p style={{ color: '#d32f2f', margin: '10px 0 20px' }}>
            {this.state.error?.message || 'Unexpected application error occurred.'}
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Wrapper to block unauthenticated access
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Fallback skeleton loader for suspense lazy loading
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column',
    fontFamily: 'sans-serif'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #1976d2',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ marginTop: '15px', color: '#666' }}>Loading page...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

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
      if (metric.level === 'warning' || metric.level === 'error') {
        console.warn('Critical performance issue detected:', metric);
      }
    };

    performanceService.addObserver(performanceObserver);

    return () => {
      performanceService.removeObserver(performanceObserver);
    };
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <UserProvider>
            <CartProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Main Layout Route (Eagerly loaded for quick painting) */}
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
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation" element={
                      <ProtectedRoute>
                        <OrderConfirmationPage />
                      </ProtectedRoute>
                    } />

                    {/* User Profile Routes (Protected) */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/change-password" element={
                      <ProtectedRoute>
                        <ProfileChangePassword />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-history" element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    } />

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
                            fontFamily: 'sans-serif'
                          }}
                        >
                          <h1>404 - Page Not Found</h1>
                          <p>The page you're looking for doesn't exist.</p>
                          <a href="/" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                            Return to Home
                          </a>
                        </div>
                      }
                    />
                  </Routes>
                  <FloatingCartButton />
                  <CartToastNotification />
                </Suspense>
              </BrowserRouter>
            </CartProvider>
          </UserProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
