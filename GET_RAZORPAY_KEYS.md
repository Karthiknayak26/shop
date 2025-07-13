# 🔑 Quick Guide: Get Real Razorpay API Keys

## 🚀 **Current Status: Demo Mode Active**
Your payment system is currently running in **Demo Mode** - it will work perfectly for testing but won't process real payments.

## 📋 **To Get Real API Keys (5 minutes):**

### Step 1: Sign Up for Razorpay
1. Go to [razorpay.com](https://razorpay.com)
2. Click "Sign Up" 
3. Fill in your details (email, phone, business name)
4. Verify your email

### Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click "Generate Key Pair"
4. Copy both keys:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (long string)

### Step 3: Update Your Configuration

**Backend (.env file):**
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
```

**Frontend (.env file):**
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
```

### Step 4: Restart Your Application
```bash
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend
npm start
```

## 🧪 **Test Cards (After Getting Real Keys):**

**Credit/Debit Cards:**
- Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

**UPI:**
- UPI ID: `success@razorpay` (successful payment)
- UPI ID: `failure@razorpay` (failed payment)

## ✅ **What Will Work After Getting Real Keys:**

- ✅ Real payment processing
- ✅ Actual money transactions
- ✅ Payment verification
- ✅ Order creation with real payment IDs
- ✅ Admin panel payment tracking

## 🎯 **Current Demo Mode Features:**

- ✅ Payment forms work perfectly
- ✅ Order creation works
- ✅ Payment simulation works
- ✅ Admin panel shows demo payments
- ✅ No real money charged

---

**🎉 Your payment system is ready! Just add the real API keys to go live.** 