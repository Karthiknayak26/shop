import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md p-4">
      <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
      <div>
        <h2 className="text-md mb-2">Hello, what's new today?</h2>
        <Link to="/add-product" className="bg-blue-500 text-white px-3 py-2 rounded inline-block">
          Add Product
        </Link>
        <Link to="/feedback" className="bg-green-500 text-white px-3 py-2 rounded inline-block mt-2">
          View Feedback
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
