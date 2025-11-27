const axios = require('axios');

const BASE_URL = 'https://shop-backend-92zc.onrender.com';

// Test Data
const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123'
};

let authToken = '';
let userId = '';
let productId = '';

async function runTests() {
    console.log('🚀 Starting API Tests...\n');

    // 1. Health Check
    try {
        console.log('1️⃣  Testing Health Check...');
        const res = await axios.get(`${BASE_URL}/`);
        console.log('   ✅ Status:', res.status, res.data);
    } catch (error) {
        console.error('   ❌ Health Check Failed:', error.message);
    }

    // 2. Fetch Products (Critical Check)
    try {
        console.log('\n2️⃣  Testing Fetch Products (/api/products)...');
        // Note: Based on local code analysis, this might fail if not configured in server.js
        const res = await axios.get(`${BASE_URL}/api/products`);
        console.log('   ✅ Status:', res.status);
        console.log('   📦 Products Found:', res.data.length);
        if (res.data.length > 0) {
            productId = res.data[0]._id;
            console.log('   🆔 First Product ID:', productId);
        }
    } catch (error) {
        console.error('   ❌ Fetch Products Failed:', error.message);
        if (error.response) {
            console.error('      Status:', error.response.status);
            console.error('      Data:', error.response.data);
        }
    }

    // 3. Register User
    try {
        console.log('\n3️⃣  Testing User Registration...');
        const res = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        console.log('   ✅ Status:', res.status);
        console.log('   👤 User Created:', res.data.user.email);
    } catch (error) {
        console.error('   ❌ Registration Failed:', error.message);
        if (error.response) {
            console.error('      Status:', error.response.status);
            console.error('      Data:', error.response.data);
        }
    }

    // 4. Login User
    try {
        console.log('\n4️⃣  Testing User Login...');
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('   ✅ Status:', res.status);
        if (res.data.user) {
            userId = res.data.user.id;
            // Note: The backend might not return a token if it uses sessions or if I missed it in the code reading
            // But usually it returns a token. Let's check the response.
            console.log('   🔑 Login Successful for:', res.data.user.email);
        }
    } catch (error) {
        console.error('   ❌ Login Failed:', error.message);
        if (error.response) {
            console.error('      Status:', error.response.status);
            console.error('      Data:', error.response.data);
        }
    }

    // 5. Create Order (Requires Login & Product)
    if (userId && productId) {
        try {
            console.log('\n5️⃣  Testing Create Order...');
            const orderData = {
                user: userId,
                orderItems: [
                    {
                        name: 'Test Product',
                        qty: 1,
                        image: 'http://example.com/image.jpg',
                        price: 100,
                        product: productId
                    }
                ],
                shippingAddress: {
                    address: '123 Test St',
                    city: 'Test City',
                    postalCode: '12345',
                    country: 'Test Country'
                },
                paymentMethod: 'Cash',
                itemsPrice: 100,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: 100
            };

            const res = await axios.post(`${BASE_URL}/api/orders`, orderData);
            console.log('   ✅ Status:', res.status);
            console.log('   📦 Order Created ID:', res.data._id);

        } catch (error) {
            console.error('   ❌ Create Order Failed:', error.message);
            if (error.response) {
                console.error('      Status:', error.response.status);
                console.error('      Data:', error.response.data);
            }
        }
    } else {
        console.log('\n⚠️  Skipping Order Creation (Missing User ID or Product ID)');
    }

    console.log('\n🏁 Tests Completed.');
}

runTests();
