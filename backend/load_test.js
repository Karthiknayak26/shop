const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com/api/products';

const TOTAL_REQUESTS = 50;
const CONCURRENCY = 20;

async function loadTest() {
    console.log(`🚀 Starting Load Test: ${TOTAL_REQUESTS} requests, ${CONCURRENCY} concurrent...`);

    let completed = 0;
    let success = 0;
    let failed = 0;
    let start = Date.now();

    const worker = async () => {
        while (completed < TOTAL_REQUESTS) {
            completed++;
            try {
                await axios.get(BASE_URL);
                success++;
                process.stdout.write('.');
            } catch (err) {
                failed++;
                process.stdout.write('x');
            }
        }
    };

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    let duration = (Date.now() - start) / 1000;
    console.log('\n\n📊 Load Test Results:');
    console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);
    console.log(`✅ Successful: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚡ RPS: ${(success / duration).toFixed(2)}`);

    if (failed === 0) {
        console.log('✅ System handled load without crashing.');
    } else {
        console.log('⚠️ Some requests failed. Check logs.');
    }
}

loadTest();
