# 🚀 Real Payment System Setup Guide

This guide will help you set up a real payment system using Razorpay for your Kandukuru Supermarket e-commerce website.

## 📋 Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Business Documents**: PAN Card, Bank Account, Business Registration (if applicable)
3. **Domain**: Your website domain for webhook configuration

## 🔑 Step 1: Get Razorpay API Keys

### 1.1 Sign Up for Razorpay
1. Go to [razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create your account
3. Complete the verification process

### 1.2 Get API Keys
1. Login to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate a new API key pair
4. Copy both **Key ID** and **Key Secret**

### 1.3 Test vs Live Keys
- **Test Keys**: Start with `rzp_test_` (for development)
- **Live Keys**: Start with `rzp_live_` (for production)

## ⚙️ Step 2: Configure Environment Variables

### 2.1 Backend Configuration
Create a `.env` file in the `backend` folder:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/kandukuru-supermarket

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET

# Server Configuration
PORT=5000
```

### 2.2 Frontend Configuration
Create a `.env` file in the `frontend` folder:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
```

## 🔧 Step 3: Update Configuration Files

### 3.1 Update Backend Config
Edit `backend/config/razorpay.js`:

```javascript
const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_ACTUAL_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_ACTUAL_KEY_SECRET'
};

module.exports = razorpayConfig;
```

### 3.2 Update Frontend Service
Edit `frontend/src/services/paymentService.js`:

```javascript
constructor() {
  this.razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_ACTUAL_KEY_ID';
}
```

## 🚀 Step 4: Start the Application

### 4.1 Start Backend
```bash
cd backend
npm install
npm start
```

### 4.2 Start Frontend
```bash
cd frontend
npm install
npm start
```

## 🧪 Step 5: Test the Payment System

### 5.1 Test Cards (Razorpay Test Mode)
Use these test card details:

**Credit/Debit Cards:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- Name: Any name

**UPI:**
- UPI ID: `success@razorpay` (for successful payment)
- UPI ID: `failure@razorpay` (for failed payment)

### 5.2 Test Payment Flow
1. Add items to cart
2. Go to checkout
3. Fill shipping details
4. Select payment method (Credit Card/Debit Card/UPI)
5. Complete payment using test credentials
6. Verify order creation and payment confirmation

## 🔒 Step 6: Security Considerations

### 6.1 Environment Variables
- Never commit API keys to version control
- Use different keys for test and production
- Rotate keys regularly

### 6.2 Payment Verification
- Always verify payment signatures on backend
- Store payment IDs for reconciliation
- Implement proper error handling

### 6.3 HTTPS
- Use HTTPS in production
- Configure SSL certificates
- Enable secure headers

## 🌐 Step 7: Production Deployment

### 7.1 Switch to Live Keys
1. Complete Razorpay account verification
2. Replace test keys with live keys
3. Update environment variables
4. Test thoroughly before going live

### 7.2 Webhook Configuration
1. Set up webhook URL in Razorpay dashboard
2. Handle payment status updates
3. Implement retry logic for failed webhooks

### 7.3 Monitoring
1. Set up payment monitoring
2. Configure alerts for failed payments
3. Monitor transaction logs

## 📊 Step 8: Payment Analytics

### 8.1 Razorpay Dashboard
- Monitor transaction volume
- Track success rates
- Analyze payment methods

### 8.2 Custom Analytics
- Track order completion rates
- Monitor cart abandonment
- Analyze payment method preferences

## 🛠️ Troubleshooting

### Common Issues:

1. **Payment Failed**
   - Check API keys
   - Verify amount format (in paise)
   - Check network connectivity

2. **Signature Verification Failed**
   - Verify key secret
   - Check signature generation logic
   - Ensure proper encoding

3. **Order Not Created**
   - Check database connection
   - Verify order creation logic
   - Check error logs

### Debug Mode:
Enable debug logging in payment controller:

```javascript
console.log('Payment Order:', order);
console.log('Payment Response:', response);
```

## 📞 Support

- **Razorpay Support**: [support.razorpay.com](https://support.razorpay.com)
- **Documentation**: [razorpay.com/docs](https://razorpay.com/docs)
- **API Reference**: [razorpay.com/docs/api](https://razorpay.com/docs/api)

## 🔄 Migration from Test to Live

1. **Backup**: Backup all test data
2. **Update Keys**: Replace test keys with live keys
3. **Test**: Thoroughly test all payment flows
4. **Monitor**: Monitor first few live transactions
5. **Scale**: Gradually increase transaction volume

---

## ✅ Checklist

- [ ] Razorpay account created and verified
- [ ] API keys generated and configured
- [ ] Environment variables set up
- [ ] Payment system tested with test cards
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Production deployment ready
- [ ] Monitoring and analytics configured

---

**🎉 Congratulations!** Your real payment system is now ready to process actual payments from customers. 