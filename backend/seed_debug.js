const axios = require('axios');
const BASE_URL = 'https://shop-backend-92zc.onrender.com';

const product = {
    name: 'Basmati Rice',
    price: 150,
    description: 'Premium quality Basmati Rice, 1kg pack.',
    category: '507f1f77bcf86cd799439011',
    unit: 'kg',
    unitSize: '1',
    stock: 50,
    imageUrl: 'https://m.media-amazon.com/images/I/71Zt4Kk0LcL._AC_UF1000,1000_QL80_.jpg'
};

async function seed() {
    console.log('START_SEED');
    try {
        const res = await axios.post(`${BASE_URL}/api/products`, product);
        console.log('SUCCESS:', res.data._id);
    } catch (error) {
        console.log('FAIL');
        if (error.response) {
            console.log('STATUS:', error.response.status);
            console.log('DATA:', JSON.stringify(error.response.data));
        } else {
            console.log('ERROR:', error.message);
        }
    }
    console.log('END_SEED');
}

seed();
