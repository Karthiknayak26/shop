import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this to your backend URL
});