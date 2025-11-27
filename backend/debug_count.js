const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

async function debug() {
    try {
        const pRes = await axios.get(`${BASE_URL}/api/products`);
        console.log('Status:', pRes.status);
        console.log('Is Array:', Array.isArray(pRes.data));
        console.log('Count:', pRes.data.length);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
debug();
