const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

async function debug() {
    try {
        const pRes = await axios.get(`${BASE_URL}/api/products`);
        console.log('Product ID:', pRes.data[0]?._id);

        const email = `debug_${Date.now()}@test.com`;
        await axios.post(`${BASE_URL}/api/auth/register`, { name: 'D', email, password: 'p' });
        const lRes = await axios.post(`${BASE_URL}/api/auth/login`, { email, password: 'p' });
        console.log('User ID:', lRes.data.user?.id);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
debug();
