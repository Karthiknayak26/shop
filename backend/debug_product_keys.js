const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

async function debug() {
    try {
        const pRes = await axios.get(`${BASE_URL}/api/products`);
        console.log('Keys:', Object.keys(pRes.data[0]));
        console.log('ID check:', pRes.data[0]._id, pRes.data[0].id, pRes.data[0].ProductId);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
debug();
