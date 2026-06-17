module.paths.push('c:/Users/User/OneDrive/Desktop/shop/backend/node_modules');

const axios = require('axios');

const URL = 'http://localhost:5000/health'; // Light health check endpoint to test network and middleware capacity

async function runLoadTest(concurrency) {
  console.log(`\n⚡ Simulating load with ${concurrency} concurrent requests to ${URL}...`);
  
  const start = Date.now();
  const promises = [];
  let successfulRequests = 0;
  let failedRequests = 0;
  const latencies = [];

  for (let i = 0; i < concurrency; i++) {
    const reqStart = Date.now();
    promises.push(
      axios.get(URL)
        .then(() => {
          successfulRequests++;
          latencies.push(Date.now() - reqStart);
        })
        .catch(err => {
          failedRequests++;
          latencies.push(Date.now() - reqStart);
        })
    );
  }

  await Promise.all(promises);
  
  const duration = Date.now() - start;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  console.log(`📊 Stats for ${concurrency} requests:`);
  console.log(`   - Total duration: ${duration}ms`);
  console.log(`   - Successful: ${successfulRequests}`);
  console.log(`   - Failed: ${failedRequests} (e.g. rate-limited)`);
  console.log(`   - Min latency: ${minLatency}ms`);
  console.log(`   - Max latency: ${maxLatency}ms`);
  console.log(`   - Avg latency: ${avgLatency.toFixed(1)}ms`);

  return { duration, successfulRequests, failedRequests, avgLatency };
}

async function run() {
  console.log('============================================================');
  console.log('🚀 STARTING PERFORMANCE & LOAD SIMULATIONS');
  console.log('============================================================');
  
  const initialMem = process.memoryUsage();
  console.log(`\n🧠 Initial Process Memory Usage:`);
  console.log(`   - RSS: ${(initialMem.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Heap Total: ${(initialMem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Heap Used: ${(initialMem.heapUsed / 1024 / 1024).toFixed(2)} MB`);

  // Run 100 requests
  await runLoadTest(100);

  // Run 500 requests
  await runLoadTest(500);

  // Run 1000 requests
  await runLoadTest(1000);

  const finalMem = process.memoryUsage();
  console.log(`\n🧠 Final Process Memory Usage:`);
  console.log(`   - RSS: ${(finalMem.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Heap Total: ${(finalMem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Heap Used: ${(finalMem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n============================================================');
  console.log('🎉 LOAD SIMULATION COMPLETED!');
  console.log('============================================================\n');
}

run();
