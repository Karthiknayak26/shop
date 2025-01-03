import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import GroceryDeals, { GroceryCategories, GroceryProducts } from './MyComponents/Body/GroceryDeals';

import { CartProvider } from './MyComponents/Header/CartContext';
// import GroceryDeals from './MyComponents/Body/GroceryDeals';




function App() {
  return (
    <CartProvider>
      <BrowserRouter>

        <Routes>
          {/* Main page route */}
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

          {/* Login page route */}
          <Route path="/login" element={<Login />} />

          <Route path="/help-center" element={<HelpCenter />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Product detail page route */}
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/order-tracking" element={<OrderTracking />} />

          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

          <Route path="/register" element={<Register />} />

          <Route path="/groceries" element={<GroceryCategories />} />
          <Route path="/groceries/products" element={<GroceryProducts />} />
          <Route path="/groceries/products/:categoryId" element={<GroceryProducts />} />
        </Routes>

      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
