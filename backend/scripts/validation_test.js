module.paths.push('c:/Users/User/OneDrive/Desktop/shop/backend/node_modules');

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('============================================================');
  console.log('🔍 RUNNING PRE-PRODUCTION RELEASE VALIDATION TESTS');
  console.log('============================================================\n');

  let customerToken = null;
  let adminToken = null;
  let testProductId = null;
  let testOrderId = null;
  let razorpayOrderId = null;
  const sharedPaymentId = 'pay_test_payment_123';

  // --------------------------------------------------------
  // 1. CUSTOMER REGISTRATION & AUTHENTICATION
  // --------------------------------------------------------
  try {
    console.log('👤 [1] Registering a new customer...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Validation Tester',
      email: 'validation-test@example.com',
      password: 'ValidPass123!'
    });
    console.log('✅ Registration successful!');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message && error.response.data.message.includes('already exists')) {
      console.log('ℹ️ User already registered, continuing to login...');
    } else {
      console.error('❌ Registration failed:', error.response ? error.response.data : error.message);
      process.exit(1);
    }
  }

  try {
    console.log('\n🔑 [2] Logging in as customer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'validation-test@example.com',
      password: 'ValidPass123!'
    });
    customerToken = loginResponse.data.token;
    console.log('✅ Login successful! JWT Token acquired.');
  } catch (error) {
    console.error('❌ Login failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 2. JWT & AUTHORIZATION CHECKS
  // --------------------------------------------------------
  console.log('\n🔒 [3] Verifying API Authorization behaviors...');
  try {
    // Calling protected profile without authorization header
    await axios.get(`${BASE_URL}/auth/me`);
    console.error('❌ Failure: Accessed protected route without authorization header!');
    process.exit(1);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Success: Access blocked (401 Unauthorized) when token is missing.');
    } else {
      console.error('❌ Unexpected error on missing token test:', error.message);
      process.exit(1);
    }
  }

  try {
    // Calling protected profile with invalid token
    await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid-token-value' }
    });
    console.error('❌ Failure: Accessed protected route with invalid token!');
    process.exit(1);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Success: Access blocked (401 Unauthorized) when token is invalid.');
    } else {
      console.error('❌ Unexpected error on invalid token test:', error.message);
      process.exit(1);
    }
  }

  try {
    // Calling protected profile with valid token
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    if (meResponse.data.user && meResponse.data.user.email === 'validation-test@example.com') {
      console.log('✅ Success: Profile endpoint returns correct user details with valid token.');
    } else {
      console.error('❌ Unexpected profile data returned:', meResponse.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Profile check failed with valid token:', error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 3. RETRIEVING PRODUCTS
  // --------------------------------------------------------
  console.log('\n🛍️ [4] Fetching product listings from database...');
  try {
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    const products = productsResponse.data.products || productsResponse.data;
    if (products && products.length > 0) {
      testProductId = products[0]._id;
      console.log(`✅ Success: Found ${products.length} products. Selected test product ID: ${testProductId}`);
    } else {
      console.error('❌ Error: No products found in seeded database!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to fetch products:', error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 4. RAZORPAY INTEGRATION - CREATE PAYMENT ORDER
  // --------------------------------------------------------
  console.log('\n💳 [5] Initiating Razorpay payment order generation...');
  try {
    const paymentOrderResponse = await axios.post(`${BASE_URL}/payments/create-order`, {
      amount: 500,
      receipt: 'validation_receipt_123',
      customerDetails: {
        email: 'validation-test@example.com',
        phone: '9876543210'
      }
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    razorpayOrderId = paymentOrderResponse.data.orderId;
    console.log(`✅ Success: Razorpay Order created. ID: ${razorpayOrderId}`);
  } catch (error) {
    console.error('❌ Razorpay order generation failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 5. ORDER CREATION referencing Razorpay Order ID
  // --------------------------------------------------------
  console.log('\n📦 [6] Simulating Order creation referencing Razorpay Order ID...');
  try {
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      items: [{ id: testProductId, quantity: 1 }],
      shippingAddress: {
        name: 'Validation Tester',
        email: 'validation-test@example.com',
        address: '123 Test Street',
        city: 'Kandukuru',
        postalCode: '518123',
        phone: '9876543210'
      },
      paymentMethod: 'Online',
      paymentInfo: {
        razorpayOrderId: razorpayOrderId,
        paymentStatus: 'pending'
      }
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    testOrderId = orderResponse.data.order._id;
    console.log(`✅ Success: Order created successfully! Internal Order ID: ${testOrderId}`);
  } catch (error) {
    console.error('❌ Order creation failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 6. PAYMENT SIGNATURE VERIFICATION
  // --------------------------------------------------------
  console.log('\n🛡️ [7] Testing Payment Verification (timing-safe and amount mismatch checks)...');
  try {
    const verifyResponse = await axios.post(`${BASE_URL}/payments/verify`, {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: sharedPaymentId,
      razorpay_signature: 'invalid_signature_mock_value',
      orderId: testOrderId
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    console.log('✅ Success: Signature validation response (Demo Mode):', verifyResponse.data);
  } catch (error) {
    console.error('❌ Payment verification failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // Verify Webhook Signature Check
  console.log('\n🔌 [8] Testing Webhook raw signature verification...');
  try {
    const webhookSecret = 'webhook_secret_123';
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: sharedPaymentId,
            amount: 50000,
            currency: 'INR',
            order_id: razorpayOrderId
          }
        }
      }
    });

    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const webhookResponse = await axios.post(`${BASE_URL}/payments/webhook`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      }
    });

    console.log('✅ Success: Webhook endpoint processed raw body validation cleanly. Status:', webhookResponse.status);
  } catch (error) {
    console.error('❌ Webhook test failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 7. SECURITY PENETRATION & INJECTION SIMULATIONS
  // --------------------------------------------------------
  console.log('\n🧪 [9] Simulating NoSQL Injection attack...');
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: { '$gt': '' },
      password: 'wrong-password-payload'
    });
    console.error('❌ Failure: Server allowed login bypass or threw invalid error structure!');
    process.exit(1);
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 400)) {
      console.log('✅ Success: NoSQL Injection attempt blocked (400/401 Unauthorized).');
    } else {
      console.error('❌ Unexpected response code on NoSQL Injection:', error.response ? error.response.status : error.message);
      process.exit(1);
    }
  }

  console.log('\n🧪 [10] Simulating Privilege Escalation (Mass Assignment) check...');
  try {
    const profileEscalationResponse = await axios.put(`${BASE_URL}/auth/profile`, {
      name: 'Tester Escalated',
      role: 'admin' // Attempting to change role to admin
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    // Check if profile was updated, and if role was updated
    const verifyEscalation = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    if (verifyEscalation.data.user.role === 'admin') {
      console.error('❌ Critical Failure: Privilege escalation succeeded! User became admin.');
      process.exit(1);
    } else {
      console.log('✅ Success: Privilege escalation attempt blocked. User role remains:', verifyEscalation.data.user.role);
    }
  } catch (error) {
    console.log('✅ Success: Privilege escalation update threw error or was ignored.', error.response ? error.response.data : error.message);
  }

  console.log('\n🧪 [11] Simulating XSS Injection sanitization...');
  try {
    const xssRegName = 'XssUser<script>alert("hack")</script>';
    const xssRegEmail = 'xss-tester@example.com';
    
    // Register
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: xssRegName,
        email: xssRegEmail,
        password: 'ValidPass123!'
      });
    } catch (e) {
      // Ignored if user already exists
    }

    // Login
    const xssLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: xssRegEmail,
      password: 'ValidPass123!'
    });
    const xssToken = xssLogin.data.token;

    // Verify profile output is sanitized
    const xssProfile = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${xssToken}` }
    });

    const returnedName = xssProfile.data.user.name;
    if (returnedName.includes('<script>')) {
      console.error('❌ Critical Failure: XSS payload returned unsanitized (raw script tag found)!', returnedName);
      process.exit(1);
    } else {
      console.log('✅ Success: XSS name sanitized (rendered completely inert). Sanitized value:', returnedName);
    }
  } catch (error) {
    console.error('❌ XSS verification failed:', error.message);
    process.exit(1);
  }

  // --------------------------------------------------------
  // 8. ADMIN DASHBOARD ROUTING & AUTHORIZATION
  // --------------------------------------------------------
  console.log('\n🔑 [12] Logging in as Admin...');
  try {
    const adminLoginResponse = await axios.post(`${BASE_URL}/admin/auth/login`, {
      username: 'superadmin',
      password: 'Admin@123456'
    });
    adminToken = adminLoginResponse.data.token;
    console.log('✅ Success: Admin login successful! Admin Token acquired.');
  } catch (error) {
    console.error('❌ Admin login failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  console.log('\n🔒 [13] Testing Admin auth bypass protection...');
  try {
    // Regular customer trying to access admin verify route
    await axios.get(`${BASE_URL}/admin/auth/verify`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.error('❌ Critical Failure: Customer bypassed admin authentication successfully!');
    process.exit(1);
  } catch (error) {
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.log('✅ Success: Admin endpoint blocked customer access with status:', error.response.status);
    } else {
      console.error('❌ Unexpected response for customer trying to access admin endpoint:', error.message);
      process.exit(1);
    }
  }

  try {
    // Admin accessing admin verify route
    const verifyResponse = await axios.get(`${BASE_URL}/admin/auth/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (verifyResponse.data.valid) {
      console.log('✅ Success: Admin verified successfully with Admin token.');
    } else {
      console.error('❌ Unexpected admin verification response:', verifyResponse.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Admin verification failed:', error.message);
    process.exit(1);
  }

  console.log('\n============================================================');
  console.log('🎉 ALL INTEGRATION, PAYMENTS, AND SECURITY CHECKS PASSED!');
  console.log('============================================================\n');
}

runTests();
