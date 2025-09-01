import React, { useState, useEffect, useRef } from 'react';

// Note: Ensure TailwindCSS is set up in your project for these classes to work.
const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const cache = useRef(new Map());
  const abortController = useRef(null);
  const debounceTimer = useRef(null);

  const handleSearch = async (searchQuery) => {
    if (cache.current.has(searchQuery)) {
      setResults(cache.current.get(searchQuery));
      setShowDropdown(true);
      return;
    }

    setLoading(true);
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`, {
        signal: abortController.current.signal,
      });
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      cache.current.set(searchQuery, data);
      setResults(data);
      setShowDropdown(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = (value) => {
    setQuery(value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (value.trim() === '') {
      setShowDropdown(false);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      handleSearch(value);
    }, 300); // Adjusted to 300ms for better responsiveness
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => debouncedSearch(e.target.value)}
        placeholder="Search for Products and more"
        className="w-full px-4 py-2 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {loading && <div className="absolute top-full left-0 mt-1">Loading...</div>}
      {showDropdown && results.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto z-10">
          {results.map((result, index) => (
            <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              {result.name} {/* Adjust based on your API response structure */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
