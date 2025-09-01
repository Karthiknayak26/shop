// import React, { useState } from 'react';

// const SearchForm = ({ onSearch }) => {
//   const [query, setQuery] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (query.trim()) {
//       onSearch(query);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search for products..."
//         className="flex-1 p-2 border rounded"
//       />
//       <button
//         type="submit"
//         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//       >
//         Search
//       </button>
//     </form>
//   );
// };

// export default SearchForm;

import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6 max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for groceries, pooja items, and more..."
        className="flex-1 p-3 border-2 border-orange-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-gray-700 placeholder-orange-300"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300 shadow-md hover:shadow-lg font-medium"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;