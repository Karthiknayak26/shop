const https = require('https');

const locations = [
  {
    name: "Kandukuru Supermarket - Misrod",
    address: "Misrod Road, Near D-Mart",
    city: "Bhopal",
    state: "Madhya Pradesh",
    latitude: 23.1856,
    longitude: 77.4589
  },
  {
    name: "Kandukuru Supermarket - Whitefield",
    address: "ITPL Main Rd, Opp. Phoenix Marketcity",
    city: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    name: "Kandukuru Supermarket - Head Office",
    address: "Main Road, Opp. RTC Bus Stand",
    city: "Kandukuru",
    state: "Andhra Pradesh",
    latitude: 15.2155,
    longitude: 79.9042
  }
];

function postLocation(loc) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(loc);
    
    const options = {
      hostname: 'shop-backend-92zc.onrender.com',
      port: 443,
      path: '/api/locations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status: ${res.statusCode}, Body: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function seed() {
  console.log("Starting to seed live locations using native https...");
  for (const loc of locations) {
    try {
      const result = await postLocation(loc);
      console.log(`Successfully seeded location: ${result.name} (${result._id})`);
    } catch (error) {
      console.error(`Failed to seed location ${loc.name}:`, error.message);
    }
  }
  console.log("Seeding complete.");
}

seed();
