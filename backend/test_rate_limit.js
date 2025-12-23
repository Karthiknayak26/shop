const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com/api/products';

async function testRateLimit() {
    console.log('🚀 Testing Rate Limit (Max 100 req / 10 min)...');

    let success = 0;
    let blocked = 0;

    // Send 110 requests
    const requests = [];
    for (let i = 0; i < 110; i++) {
        requests.push(
            axios.get(BASE_URL)
                .then(() => { success++; process.stdout.write('.'); })
                .catch((err) => {
                    if (err.response && err.response.status === 429) {
                        blocked++;
                        process.stdout.write('x');
                    } else {
                        process.stdout.write('E'); // Other error
                    }
                })
        );
    }

    await Promise.all(requests);

    console.log('\n\n📊 Results:');
    console.log(`✅ Successful: ${success}`);
    console.log(`⛔ Blocked (429): ${blocked}`);

    if (blocked > 0) {
        console.log('✅ Rate Limiting is WORKING.');
    } else {
        console.log('⚠️ Rate Limiting might NOT be working (or limit not reached).');
    }
}

testRateLimit();
