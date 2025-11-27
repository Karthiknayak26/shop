const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

const products = [
    {
        name: 'Basmati Rice',
        price: 150,
        description: 'Premium quality Basmati Rice, 1kg pack.',
        category: '507f1f77bcf86cd799439011', // Fake ObjectId
        unit: 'kg',
        unitSize: '1',
        stock: 50,
        imageUrl: 'https://m.media-amazon.com/images/I/71Zt4Kk0LcL._AC_UF1000,1000_QL80_.jpg'
    },
    {
        name: 'Sunflower Oil',
        price: 180,
        description: 'Refined Sunflower Oil, 1L pouch.',
        category: '507f1f77bcf86cd799439012', // Fake ObjectId
        unit: 'liter',
        unitSize: '1',
        stock: 100,
        imageUrl: 'https://m.media-amazon.com/images/I/61X7uB9yEKL._AC_UF1000,1000_QL80_.jpg'
    },
    {
        name: 'Toor Dal',
        price: 120,
        description: 'Organic Toor Dal, 1kg.',
        category: '507f1f77bcf86cd799439013', // Fake ObjectId
        unit: 'kg',
        unitSize: '1',
        stock: 40,
        imageUrl: 'https://m.media-amazon.com/images/I/71J-yJk0LcL._AC_UF1000,1000_QL80_.jpg'
    },
    {
        name: 'Sugar',
        price: 45,
        description: 'White Crystal Sugar, 1kg.',
        category: '507f1f77bcf86cd799439014', // Fake ObjectId
        unit: 'kg',
        unitSize: '1',
        stock: 200,
        imageUrl: 'https://m.media-amazon.com/images/I/61Zt4Kk0LcL._AC_UF1000,1000_QL80_.jpg'
    }
];

async function seed() {
    console.log('🌱 Starting Database Seed...');

    for (const product of products) {
        try {
            const res = await axios.post(`${BASE_URL}/api/products`, product);
            console.log(`✅ Added: ${product.name} (ID: ${res.data._id})`);
        } catch (error) {
            console.error(`❌ Failed to add ${product.name}:`, error.message);
            if (error.response) {
                console.error('   Details:', error.response.data);
            }
        }
    }

    console.log('🏁 Seeding Completed.');
}

seed();
