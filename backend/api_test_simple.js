const axios = require('axios');

const BASE_URL = 'https://shop-backend-92zc.onrender.com';

async function runTests() {
    console.log('START_TESTS');

    // 1. Health Check
    try {
        await axios.get(`${BASE_URL}/`);
        console.log('HEALTH: PASS');
    } catch (error) {
        console.log('HEALTH: FAIL');
    }

    // 2. Fetch Products
    let productId = null;
    try {
        const res = await axios.get(`${BASE_URL}/api/products`);
        if (res.status === 200 && res.data.length > 0) {
            console.log('PRODUCTS: PASS');
            productId = res.data[0]._id;
        } else {
            console.log('PRODUCTS: FAIL (Empty or non-200)');
        }
    } catch (error) {
        console.log('PRODUCTS: FAIL (' + error.message + ')');
    }

    // 3. Register
    const email = `test_${Date.now()}@example.com`;
    try {
        await axios.post(`${BASE_URL}/api/auth/register`, {
            name: 'Test', email: email, password: 'password123'
        });
        console.log('REGISTER: PASS');
    } catch (error) {
        console.log('REGISTER: FAIL (' + error.message + ')');
    }

    // 4. Login
    let userId = null;
    try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: email, password: 'password123'
        });
        if (res.status === 200) {
            console.log('LOGIN: PASS');
            userId = res.data.user.id;
        } else {
            console.log('LOGIN: FAIL');
        }
    } catch (error) {
        console.log('LOGIN: FAIL (' + error.message + ')');
    }

    // 5. Order
    if (userId && productId) {
        try {
            await axios.post(`${BASE_URL}/api/orders`, {
                user: userId,
                orderItems: [{ name: 'Item', qty: 1, price: 10, product: productId }],
                shippingAddress: { address: 'A', city: 'C', postalCode: '1', country: 'C' },
                paymentMethod: 'Cash', totalPrice: 10
            });
            console.log('ORDER: PASS');
        } catch (error) {
            console.log('ORDER: FAIL (' + error.message + ')');
        }
    } else {
        console.log('ORDER: SKIP');
    }

    console.log('END_TESTS');
}

runTests();
