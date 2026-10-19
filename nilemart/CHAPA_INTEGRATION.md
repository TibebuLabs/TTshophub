# Chapa Payment Integration Guide

## Overview

NileMart now supports **Chapa Payment Gateway** for secure online payments in Ethiopia. Customers can pay using:

- **Telebirr** 📱 - Mobile wallet payment
- **CBE Birr** 🏦 - Commercial Bank of Ethiopia wallet
- **M-Pesa** 💳 - Mobile money payment
- **Cards** 💳 - Visa, Mastercard via Chapa

## Features Implemented

✅ Payment initialization with Chapa API  
✅ Secure checkout flow with phone number validation  
✅ Webhook handling for payment status updates  
✅ Payment verification  
✅ Beautiful, mobile-responsive payment UI  
✅ Success and failure payment pages  
✅ Order tracking with payment status  

---

## Setup Instructions

### 1. Get Chapa API Keys

1. Visit [https://dashboard.chapa.co](https://dashboard.chapa.co)
2. Create an account or log in
3. Get your **Test Secret Key** (for sandbox testing)
4. Get your **Live Secret Key** (for production)

### 2. Configure Environment Variables

Update `backend/.env` with your Chapa credentials:

```env
# Chapa Payment Gateway
CHAPA_SECRET_KEY=CHASECK_TEST-your-sandbox-key-here
CHAPA_WEBHOOK_SECRET=your-webhook-secret
CHAPA_BASE_URL=https://api.chapa.co/v1
```

**For Production:**
```env
CHAPA_SECRET_KEY=CHASECK-your-live-key-here
CHAPA_WEBHOOK_SECRET=your-production-webhook-secret
CHAPA_BASE_URL=https://api.chapa.co/v1
```

### 3. Database Migration

The order entity has been updated with new fields for payment tracking. Run the migration:

```bash
cd backend
npm run migration:generate -- -n AddChapaPaymentFields
npm run migration:run
```

New fields added to `orders` table:
- `paymentUrl` - Chapa checkout URL
- `txRef` - Transaction reference
- `paymentStatus` - 'pending', 'success', or 'failed'

### 4. Start the Services

```bash
# Terminal 1 - Backend services
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## How It Works

### User Flow

1. **Cart** → Customer adds products to cart
2. **Checkout** → Fills delivery details
3. **Payment** → Selects payment method (Telebirr, CBE, etc.)
4. **Chapa Redirect** → Redirected to Chapa checkout page
5. **Payment** → Completes payment on phone/browser
6. **Verification** → Backend verifies payment
7. **Success** → Order confirmed, cart cleared

### Technical Flow

```
Frontend                Backend                  Chapa API
   |                       |                         |
   | 1. POST /orders       |                         |
   |--------------------->|                         |
   |                       | 2. Reserve stock        |
   |                       |                         |
   | 3. POST /payments/initialize                    |
   |--------------------->|                         |
   |                       | 4. Initialize payment   |
   |                       |------------------------>|
   |                       |<------------------------|
   |                       | 5. Checkout URL         |
   |<---------------------|                         |
   | 6. Redirect to Chapa  |                         |
   |-------------------------------------->|         |
   |                       |                         |
   |                       | 7. Webhook callback     |
   |                       |<------------------------|
   |                       | 8. Update order status  |
   |                       |                         |
   | 9. Return to success page                       |
   |<--------------------------------------|         |
   |                       |                         |
   | 10. GET /payments/verify/:txRef                 |
   |--------------------->|                         |
   |                       | 11. Verify payment      |
   |                       |------------------------>|
   |<---------------------|<------------------------|
```

---

## API Endpoints

### Initialize Payment

**POST** `/api/payments/initialize`

**Request:**
```json
{
  "amount": 4628,
  "email": "customer@example.com",
  "firstName": "Abebe",
  "lastName": "Kebede",
  "phoneNumber": "0911234567",
  "orderId": "uuid",
  "orderCode": "NM-40001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.chapa.co/checkout/web/payment/...",
    "txRef": "NM-40001-1234567890"
  }
}
```

### Verify Payment

**GET** `/api/payments/verify/:txRef`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "amount": 4628,
    "currency": "ETB",
    "method": "telebirr",
    "reference": "CHW-..."
  }
}
```

### Webhook Callback

**POST** `/api/payments/webhook`

Chapa sends webhook notifications when payment status changes.

---

## Frontend Components

### PaymentModal

Located at: `frontend/src/components/PaymentModal.tsx`

Beautiful modal for payment method selection with:
- 4 payment options (Telebirr, CBE, M-Pesa, Card)
- Phone number input for wallet payments
- Amount display
- Loading states
- Mobile responsive

### Checkout Page

Located at: `frontend/src/app/checkout/page.tsx`

Complete checkout flow with:
- Customer information form
- Order items summary
- City selection with delivery fees
- Order total calculation
- Payment modal integration

### Success Page

Located at: `frontend/src/app/payment/success/page.tsx`

Payment success confirmation with:
- Payment verification
- Order reference display
- Links to orders and home

### Failed Page

Located at: `frontend/src/app/payment/failed/page.tsx`

Payment failure handling with:
- Error message display
- Common failure reasons
- Retry option

---

## Testing

### Test with Chapa Sandbox

1. Use test credentials in `.env`:
```env
CHAPA_SECRET_KEY=CHASECK_TEST-your-test-key
```

2. Test flow:
   - Add products to cart
   - Go to checkout
   - Fill delivery details
   - Select Telebirr
   - Enter phone: `0911223344`
   - You'll be redirected to Chapa test environment

3. Chapa Test Cards:
```
Successful Payment:
Card: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date

Failed Payment:
Card: 4100 0000 0000 0001
```

---

## Mobile Responsiveness

All payment components are fully responsive:

✅ Works on screens as small as 320px width  
✅ Touch-friendly buttons (minimum 44px height)  
✅ Optimized layouts for mobile, tablet, desktop  
✅ Native-like payment experience on mobile  

---

## Security

🔒 **Secure Implementation:**
- Secret keys never exposed to frontend
- Webhook signature verification
- HTTPS required for production
- No sensitive data stored in localStorage
- Proper CORS configuration

---

## Troubleshooting

### Payment initialization fails

**Check:**
- CHAPA_SECRET_KEY is set correctly
- Backend is running on port 4000
- Chapa API is accessible

**Fix:**
```bash
# Verify env variable
echo $CHAPA_SECRET_KEY

# Check backend logs
cd backend
npm run dev:orders
```

### Webhook not received

**Check:**
- Callback URL is publicly accessible
- CHAPA_WEBHOOK_SECRET matches dashboard
- Check backend logs for webhook calls

**For local testing:**
Use ngrok to expose local backend:
```bash
ngrok http 4000
# Update Chapa dashboard with ngrok URL
```

### Payment verification fails

**Check:**
- Transaction reference is correct
- Chapa API is reachable
- Check response in browser console

---

## Production Checklist

Before going live:

- [ ] Replace test keys with production keys
- [ ] Set up proper webhook URL (HTTPS required)
- [ ] Configure CHAPA_WEBHOOK_SECRET
- [ ] Test all payment methods
- [ ] Set up error monitoring
- [ ] Configure email notifications
- [ ] Test webhook handling
- [ ] Review Chapa dashboard settings
- [ ] Set up backup payment methods

---

## Support

**Chapa Support:**
- Email: support@chapa.co
- Dashboard: https://dashboard.chapa.co
- Documentation: https://developer.chapa.co

**NileMart Support:**
- Check logs in `backend/` services
- Review frontend console for errors
- Test API endpoints with Postman

---

## Future Enhancements

Potential improvements:

- [ ] QR code payments
- [ ] Recurring payments/subscriptions
- [ ] Split payments
- [ ] Refund handling
- [ ] Payment analytics dashboard
- [ ] Multi-currency support

---

**Last Updated:** January 2025  
**Version:** 1.0.0
