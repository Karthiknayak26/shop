const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

async function debug() {
    try {
        const pRes = await axios.get(`${BASE_URL}/api/products`);
        console.log('Type:', typeof pRes.data);
        if (typeof pRes.data === 'string') {
            console.log('Content (first 100):', pRes.data.substring(0, 100));
        } else {
            console.log('Is Array:', Array.isArray(pRes.data));
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}
debug();
