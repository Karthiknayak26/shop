async function testOrder() {
  const baseURL = 'https://shop-backend-92zc.onrender.com/api';
  try {
    // 1. Register a test user
    console.log('Registering test user...');
    const rand = Math.floor(Math.random() * 100000);
    const regRes = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test User ${rand}`,
        email: `testuser${rand}@example.com`,
        password: 'Password123!'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Reg failed: ${JSON.stringify(regData)}`);
    const token = regData.token;
    console.log('Registered successfully. Token:', token.substring(0, 10) + '...');

    // 2. Get products
    console.log('Fetching products...');
    const prodRes = await fetch(`${baseURL}/products`);
    const prodData = await prodRes.json();
    const products = prodData.products;
    if (!products || products.length === 0) {
      console.log('No products found to order.');
      return;
    }
    const product = products[0];
    console.log('Selected product:', product.name, product._id);

    // 3. Create order
    console.log('Placing order...');
    const orderData = {
      items: [
        {
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          img: product.imageUrl || 'http://example.com/img.jpg'
        }
      ],
      shippingAddress: {
        name: 'Test Name',
        email: `testuser${rand}@example.com`,
        address: '123 Test St',
        city: 'Test City',
        postalCode: '123456',
        phone: '9876543210'
      },
      paymentMethod: 'cod',
      paymentInfo: {},
      totalAmount: product.price,
      orderDate: new Date().toISOString()
    };

    const orderRes = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    const orderText = await orderRes.text();
    console.log('Order status:', orderRes.status);
    console.log('Order response:', orderText);

  } catch (error) {
    console.error('Script failed:', error);
  }
}

testOrder();
