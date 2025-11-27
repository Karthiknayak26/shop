const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

async function debug() {
    try {
        const pRes = await axios.get(`${BASE_URL}/api/products`);
        console.log('First Product Object:', JSON.stringify(pRes.data[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
debug();
