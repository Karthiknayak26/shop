// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './MyComponents/Header/Header';
import Header1 from './MyComponents/Header/Header1';
import Footer from './MyComponents/Footer';
import Section from './MyComponents/Section';
import GroceryDeals from './MyComponents/Body/GroceryDeals';
import Login from './MyComponents/Header/Login';
import Electronics from './MyComponents/Body/Electronics';
import Homelifestyle from './MyComponents/Body/Homelifestyle';

// import Login  from './MyComponents/Header/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <Header1 />
            {/* Other components */}
            <Section />
            <GroceryDeals />
            <Electronics />
            <Homelifestyle />
            <Footer />

          </>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;