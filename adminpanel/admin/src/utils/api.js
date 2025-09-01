import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://shop-backend-92zc.onrender.com/api', // Change this to your backend URL
});