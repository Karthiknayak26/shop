import React from 'react'
import "../../MyComponents/Header/Header.css";
import Button from '@mui/material/Button';
import './Search.css'; // Assuming you have a CSS file for styling

const Search = () => {
  return (
    <div className='search-container'>
      <input
        type="text"
        placeholder="Search for Products and more"
        className="search-bar"
      />
      <Button className="container-bar" variant="contained">search</Button>
    </div>
  );
}

export default Search;
