import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './MyComponents/Header/Header';
import Header1 from './MyComponents/Header/Header1';
import Footer from './MyComponents/Footer';
import Section from './MyComponents/Section';
import Login from './MyComponents/Header/Login';
import Electronics from './MyComponents/Body/Electronics';
import Homelifestyle from './MyComponents/Body/Homelifestyle';
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

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
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
});

function App() {
  return (
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
                    <GroceryDeals />
                    <Electronics />
                    <Homelifestyle />
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

              {/* Cart & Checkout Routes */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

              {/* Order Management Routes */}
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/order-tracking" element={<OrderTracking />} />

              {/* Support Routes */}
              <Route path="/help-center" element={<HelpCenter />} />

              {/* Profile Route */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Change Password Route */}
              <Route path="/settings/password" element={<ProfileChangePassword />} />

              {/* 404 Fallback Route */}
              <Route path="*" element={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;