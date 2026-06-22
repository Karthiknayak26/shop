async function testAdmin() {
  const baseURL = 'https://shop-backend-92zc.onrender.com/api';
  try {
    console.log('Testing admin login...');
    const res = await fetch(`${baseURL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin@kandukuru-supermarket.com',
        password: 'Admin@123456'
      })
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testAdmin();
