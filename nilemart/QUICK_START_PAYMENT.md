# Chapa Payment - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Chapa API Key (2 min)

1. Go to [https://dashboard.chapa.co](https://dashboard.chapa.co)
2. Sign up or log in
3. Copy your **Test Secret Key** (starts with `CHASECK_TEST-`)

### Step 2: Configure Backend (1 min)

Open `backend/.env` and add:

```env
CHAPA_SECRET_KEY=CHASECK_TEST-your-key-here
CHAPA_WEBHOOK_SECRET=test-webhook-secret
CHAPA_BASE_URL=https://api.chapa.co/v1
```

### Step 3: Run Database Migration (1 min)

```bash
cd backend
npm run migration:generate -- -n AddChapaPaymentFields
npm run migration:run
```

### Step 4: Start Everything (1 min)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 5: Test Payment (30 seconds)

1. Visit http://localhost:3000
2. Add products to cart 🛒
3. Click "Proceed to Checkout"
4. Fill delivery details
5. Select payment method (Telebirr/CBE/Card)
6. Complete payment! 💳

---

## 📱 Test Phone Numbers

Use these for Chapa sandbox testing:

- **Successful Payment:** `0911223344`
- **Failed Payment:** `0911223355`

---

## 🎯 Payment Flow

```
Cart → Checkout → Payment Modal → Chapa → Success Page
```

### URLs

- **Checkout:** http://localhost:3000/checkout
- **Success:** http://localhost:3000/payment/success
- **Failed:** http://localhost:3000/payment/failed

---

## 🔑 API Endpoints

### Initialize Payment
```bash
POST http://localhost:4000/api/payments/initialize

{
  "amount": 1000,
  "email": "test@example.com",
  "firstName": "Abebe",
  "lastName": "Kebede",
  "phoneNumber": "0911223344",
  "orderId": "order-uuid",
  "orderCode": "NM-40001"
}
```

### Verify Payment
```bash
GET http://localhost:4000/api/payments/verify/NM-40001-1234567890
```

---

## 🎨 Payment Methods Available

| Method | Icon | Description |
|--------|------|-------------|
| **Telebirr** | 📱 | Mobile wallet payment |
| **CBE Birr** | 🏦 | Bank wallet payment |
| **M-Pesa** | 💳 | Mobile money |
| **Card** | 💳 | Visa/Mastercard |

---

## ⚠️ Common Issues

### "npm" not found
**Solution:** Install Node.js from https://nodejs.org

### Backend won't start
**Solution:** Check if PostgreSQL is running and .env is configured

### Payment initialization fails
**Solution:** Verify CHAPA_SECRET_KEY is set correctly

### Webhook not received
**Solution:** Use ngrok for local testing:
```bash
ngrok http 4000
# Update Chapa dashboard with ngrok URL
```

---

## 📖 Full Documentation

For complete details, see:
- `CHAPA_INTEGRATION.md` - Complete integration guide
- `PAYMENT_IMPLEMENTATION_SUMMARY.md` - What was implemented

---

## 🎉 You're Ready!

Your payment system is configured and ready to accept payments through Chapa!

**Test Flow:**
1. Add items to cart
2. Checkout
3. Select Telebirr
4. Enter phone: `0911223344`
5. Approve payment in test environment

---

**Questions?** Check the documentation or Chapa support at support@chapa.co
