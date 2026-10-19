# NileMart Payment Flows

## Visual Flow Diagrams

### 1. Main Payment Selection Flow

```
┌─────────────────────────────────────────────────────────┐
│                     CHECKOUT PAGE                        │
│  Customer Info → Delivery Address → City → Total        │
└───────────────────────┬─────────────────────────────────┘
                        │
                   Click "Proceed to Payment"
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              PAYMENT METHOD SELECTOR                     │
│                                                          │
│  ┌────────────┐  Select Payment Category:              │
│  │ ETB 4,628  │                                         │
│  └────────────┘  • Wallets (Telebirr, CBE, M-Pesa)    │
│                  • Local Cards (Visa, Mastercard)       │
│                  • Bank Transfers (20 banks)            │
│                  • Cash on Delivery                     │
└───────────┬──────────────────────┬──────────────────────┘
            │                      │
            │                      │
    ┌───────┴──────┐       ┌──────┴──────┐
    │              │       │             │
    ▼              ▼       ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│Wallets │  │ Cards  │  │  Bank  │  │  COD   │
│  Flow  │  │  Flow  │  │  Flow  │  │  Flow  │
└────────┘  └────────┘  └────────┘  └────────┘
```

---

### 2. Wallet Payment Flow (Telebirr Example)

```
START
  │
  ▼
┌───────────────────────────────┐
│  Select "Wallets" Category    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Wallet Grid Appears:         │
│  ┌──────┐ ┌──────┐           │
│  │📱Tel.│ │🏦CBE │           │
│  └──────┘ └──────┘           │
│  ┌──────┐ ┌──────┐           │
│  │💳M-P │ │💰e-B │           │
│  └──────┘ └──────┘           │
└───────────┬───────────────────┘
            │
      Click Telebirr
            │
            ▼
┌───────────────────────────────┐
│  Phone Number Input           │
│  [📱 09________]              │
└───────────┬───────────────────┘
            │
      Enter: 0911223344
            │
            ▼
┌───────────────────────────────┐
│  Click "Pay ETB 4,628"        │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Create Order (Backend)       │
│  POST /api/orders             │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Initialize Chapa Payment     │
│  POST /api/payments/initialize│
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Redirect to Chapa Checkout   │
│  https://checkout.chapa.co... │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Customer's Phone Shows       │
│  Payment Request              │
│  "Approve ETB 4,628?"         │
└───────────┬───────────────────┘
            │
       Customer Approves
            │
            ▼
┌───────────────────────────────┐
│  Chapa Webhook → Backend      │
│  POST /api/payments/webhook   │
│  {status: "success"}          │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Redirect to Success Page     │
│  /payment/success?tx_ref=...  │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  ✅ Payment Successful        │
│  Order Confirmed              │
│  Cart Cleared                 │
└───────────────────────────────┘
  END
```

---

### 3. Bank Transfer Flow

```
START
  │
  ▼
┌───────────────────────────────┐
│  Select "Bank Transfers"      │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Bank Dropdown Appears:       │
│  ┌─────────────────────────┐ │
│  │ Choose a bank...    ▼  │ │
│  ├─────────────────────────┤ │
│  │ Commercial Bank of Eth. │ │
│  │ Awash Bank             │ │
│  │ Dashen Bank            │ │
│  │ Bank of Abyssinia      │ │
│  │ (+ 16 more banks)      │ │
│  └─────────────────────────┘ │
└───────────┬───────────────────┘
            │
     Select: "CBE"
            │
            ▼
┌───────────────────────────────┐
│  Click "Pay ETB 4,628"        │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Create Order (Backend)       │
│  payment: "bank_transfer"     │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Redirect to Instructions     │
│  /payment/bank-transfer       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│  Bank Transfer Instructions Page          │
│  ┌─────────────────────────────────────┐ │
│  │ 🏦 Bank Name: CBE                   │ │
│  │ Account: NileMart Trading PLC       │ │
│  │ Number: 1000123456789 [📋 Copy]    │ │
│  │ Branch: Addis Ababa Main            │ │
│  │ SWIFT: CBETETAA                     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Steps to Complete:                       │
│  1. Visit bank or use mobile banking     │
│  2. Transfer order amount                 │
│  3. Include Order ID in reference         │
│  4. Keep transaction receipt              │
│  5. We verify within 24 hours             │
└───────────┬───────────────────────────────┘
            │
      Customer completes
       bank transfer
            │
            ▼
┌───────────────────────────────┐
│  Admin Verifies Payment       │
│  (Backend staff checks)       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  ✅ Order Confirmed           │
│  Notification sent            │
└───────────────────────────────┘
  END
```

---

### 4. Card Payment Flow

```
START
  │
  ▼
┌───────────────────────────────┐
│  Select "Local Cards"         │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Click "Pay ETB 4,628"        │
│  (No additional input needed) │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Create Order (Backend)       │
│  payment: "chapa"             │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Initialize Chapa Payment     │
│  POST /api/payments/initialize│
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Redirect to Chapa Card Form  │
│  ┌─────────────────────────┐ │
│  │ Card Number:            │ │
│  │ [________________]      │ │
│  │ Expiry:    CVV:         │ │
│  │ [MM/YY]   [___]         │ │
│  │                         │ │
│  │ [Pay ETB 4,628]        │ │
│  └─────────────────────────┘ │
└───────────┬───────────────────┘
            │
       Customer enters
        card details
            │
            ▼
┌───────────────────────────────┐
│  Chapa Processes Card         │
│  3D Secure if needed          │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Webhook → Backend            │
│  {status: "success"}          │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  ✅ Payment Successful        │
│  Order Confirmed              │
└───────────────────────────────┘
  END
```

---

### 5. Cash on Delivery Flow

```
START
  │
  ▼
┌───────────────────────────────┐
│  Select "Cash on Delivery"    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Info: "Pay when delivered"   │
│  Available for all areas      │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Click "Pay ETB 4,628"        │
│  (Actually just confirms COD) │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Create Order (Backend)       │
│  payment: "cod"               │
│  paid: false                  │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Redirect to Orders Page      │
│  /orders?success=true         │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  ✅ Order Placed              │
│  "Pay on delivery"            │
│  Cart Cleared                 │
└───────────┬───────────────────┘
            │
       Order ships
            │
            ▼
┌───────────────────────────────┐
│  Driver Delivers              │
│  Customer Pays Cash           │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│  Order Marked as Paid         │
│  Status: "delivered"          │
└───────────────────────────────┘
  END
```

---

## Payment Method Comparison

| Method | Speed | Verification | Best For |
|--------|-------|--------------|----------|
| **Wallets** | ⚡ Instant | Automatic | Fast checkout |
| **Cards** | ⚡ Instant | Automatic | International buyers |
| **Bank Transfer** | 🕐 24 hours | Manual | Large amounts |
| **COD** | 📦 On delivery | On delivery | No bank account |

---

## Error Handling Flows

### Payment Failed Flow:
```
Payment Initialization
        │
        ▼
   Chapa Returns Error
        │
        ▼
   Show Error Message
        │
        ├─→ "Try Again" → Back to Payment Modal
        │
        └─→ "Back to Cart" → Cart Page
```

### Timeout Flow:
```
Customer on Chapa Page
        │
        ▼
   Takes too long
        │
        ▼
   Session Expires
        │
        ▼
   Redirect to Failed Page
        │
        └─→ "Try Again"
```

---

## Mobile vs Desktop Experience

### Mobile:
- Full-screen payment modal
- Bottom sheet style
- Large touch buttons
- Single column layout

### Desktop:
- Centered modal dialog
- 2-column checkout layout
- Hover effects
- Side-by-side options

---

**Documentation Version:** 2.0.0  
**Last Updated:** January 2025
