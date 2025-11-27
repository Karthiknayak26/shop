const https = require('https');

const urls = [
    'https://shop-frontend-ns7z.onrender.com',
    'https://shop-backend-92zc.onrender.com/health' // Assuming a health endpoint, or just root
];

urls.forEach(url => {
    https.get(url, (res) => {
        console.log(`URL: ${url}`);
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('Status: OK');
        } else {
            console.log('Status: FAILED');
        }
        console.log('---');
    }).on('error', (e) => {
        console.error(`URL: ${url}`);
        console.error(`Error: ${e.message}`);
        console.log('---');
    });
});
