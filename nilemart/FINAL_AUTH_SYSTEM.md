# NileMart Authentication - Final System

## 🎯 Single Sign-On (SSO) System

### Core Concept:
- ✅ **ONE login page** for everyone (`/login`)
- ✅ **ONE register page** for customers only (`/register`)
- ✅ **Role detection** happens automatically from database
- ✅ **Admin access** only through database role change

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│                                                     │
│  /register → Customer Registration Only             │
│  /login    → Universal Login (SSO)                  │
│                                                     │
│  NO admin registration page                         │
│  NO role selector                                   │
│  NO admin invite code field                         │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ API Calls
                      │
┌─────────────────────▼───────────────────────────────┐
│                   BACKEND                           │
│                                                     │
│  POST /auth/register                                │
│  → ALWAYS creates role = "customer"                 │
│  → No role parameter accepted                       │
│                                                     │
│  POST /auth/login                                   │
│  → Checks email + password                          │
│  → Reads role from database                         │
│  → Returns user with their current role             │
└─────────────────────┬───────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────┐
│                  DATABASE                           │
│                                                     │
│  users table:                                       │
│  ┌────────────────────────────────────────┐        │
│  │ id    │ email         │ role     │     │        │
│  ├────────────────────────────────────────┤        │
│  │ uuid1 │ user@mail.com │ customer │     │        │
│  │ uuid2 │ admin@mail.com│ admin    │ ← Manual    │
│  └────────────────────────────────────────┘        │
│                                                     │
│  Admins are created by database UPDATE only        │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flows

### Flow 1: Customer Registration
```
┌──────────────────────────────────────────┐
│  User visits: /register                  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Fills form:                             │
│  • Name: Abebe Kebede                    │
│  • Phone: 0911234567                     │
│  • Email: abebe@example.com              │
│  • Password: Test@1234                   │
│  • Confirm: Test@1234                    │
└──────────────┬───────────────────────────┘
               │
               ▼ Clicks "Create Account"
┌──────────────────────────────────────────┐
│  POST /auth/register                     │
│  Backend receives:                       │
│  { name, email, phone, password }        │
│                                          │
│  Backend ALWAYS sets: role = "customer"  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Database INSERT:                        │
│  {                                       │
│    id: generated-uuid                    │
│    name: "Abebe Kebede"                  │
│    email: "abebe@example.com"            │
│    role: "customer"  ← Always            │
│    passwordHash: bcrypt-hash             │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Returns JWT token + user object         │
│  User logged in automatically            │
│  → Redirect to /                         │
│  ✅ Welcome, Abebe! 🎉                   │
└──────────────────────────────────────────┘
```

---

### Flow 2: Customer Login
```
┌──────────────────────────────────────────┐
│  User visits: /login                     │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Fills form:                             │
│  • Email: abebe@example.com              │
│  • Password: Test@1234                   │
└──────────────┬───────────────────────────┘
               │
               ▼ Clicks "Sign In"
┌──────────────────────────────────────────┐
│  POST /auth/login                        │
│  Backend receives:                       │
│  { email, password }                     │
│  (NO role parameter)                     │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Backend checks database:                │
│  • Find user by email                    │
│  • Verify password with bcrypt           │
│  • Read role from user record            │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Database returns:                       │
│  {                                       │
│    id: "uuid"                            │
│    email: "abebe@example.com"            │
│    role: "customer"  ← From DB           │
│    ...                                   │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Generate JWT with role from DB          │
│  Frontend receives: { token, user }      │
│  Frontend checks user.role               │
│  → role = "customer"                     │
│  → Redirect to /                         │
│  ✅ Welcome back, Abebe! 👋              │
└──────────────────────────────────────────┘
```

---

### Flow 3: Promoting Customer to Admin
```
┌──────────────────────────────────────────┐
│  Admin/Developer accesses database       │
│  (PostgreSQL, pgAdmin, or SQL client)    │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Execute SQL:                            │
│                                          │
│  UPDATE users                            │
│  SET role = 'admin'                      │
│  WHERE email = 'abebe@example.com';      │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Database updated:                       │
│  {                                       │
│    email: "abebe@example.com"            │
│    role: "admin"  ← Changed!             │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  User logs out (or session expires)      │
│  User visits: /login again               │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  POST /auth/login                        │
│  { email, password }                     │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Backend reads from database:            │
│  role: "admin"  ← New role!              │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  JWT generated with role = "admin"       │
│  Frontend receives user with role="admin"│
│  → Redirect to /admin                    │
│  ✅ Admin Dashboard Access! 🎉           │
└──────────────────────────────────────────┘
```

---

## 🔐 Security & Enforcement

### Backend Enforcement:
```typescript
// auth.service.ts - register method
async register(d: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  // ALWAYS register as customer
  const role: Role = 'customer';
  
  // Create user with customer role
  const user = await this.users.save({
    ...d,
    role: 'customer', // Hardcoded
  });
  
  return this.session(user);
}

// auth.service.ts - login method
async login(d: {
  email: string;
  password: string;
  // NO role parameter!
}) {
  // Find user in database
  const user = await this.users.findOne({ 
    where: { email: d.email } 
  });
  
  // Return user with their ACTUAL role from database
  // NOT from any frontend input
  return this.session(user);
}
```

### Frontend Display:
```typescript
// After successful login
const { user } = session;

if (user.role === 'admin') {
  router.push('/admin'); // Admin dashboard
} else {
  router.push('/');      // Customer homepage
}
```

---

## 📋 Admin Management Guide

### How to Make Someone Admin:

#### Method 1: Direct SQL
```sql
-- Connect to database
psql -U postgres -d nilemart

-- Update role
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';

-- Verify change
SELECT email, role FROM users WHERE email = 'user@example.com';
```

#### Method 2: Using Database GUI (pgAdmin, DBeaver)
```
1. Open database tool
2. Connect to nilemart database
3. Browse users table
4. Find user by email
5. Edit role column to 'admin'
6. Save changes
```

#### Method 3: Admin Panel (Future Feature)
```
// In /admin/users page
1. Login as existing admin
2. Go to Users management
3. Find user
4. Click "Edit"
5. Change role dropdown to "Admin"
6. Save
```

---

## ✅ What Frontend Shows

### Customer User sees:
- ✅ `/` - Homepage with products
- ✅ `/register` - Can create new account
- ✅ `/login` - Can log in
- ✅ `/cart` - Shopping cart
- ✅ `/checkout` - Checkout process
- ✅ `/orders` - Their orders
- ✅ `/account` - Account settings
- ❌ No `/admin` access (redirected)

### Admin User sees:
- ✅ `/admin` - Admin dashboard
- ✅ `/admin/products` - Product management
- ✅ `/admin/orders` - All orders
- ✅ `/admin/users` - User management
- ✅ `/` - Can also browse as customer
- ✅ All customer features PLUS admin features

---

## 🧪 Complete Testing Scenario

### Test 1: New Customer Registration
```bash
# Step 1: Register
URL: http://localhost:3000/register
Action: Fill form and submit

Expected:
✅ User created with role = "customer"
✅ Auto logged in
✅ Redirected to /
✅ Can shop and checkout
❌ Cannot access /admin
```

### Test 2: Customer Login
```bash
# Step 2: Login
URL: http://localhost:3000/login
Email: user@example.com
Password: Test@1234

Expected:
✅ Login successful
✅ Redirected to /
✅ See customer features
❌ No admin menu visible
```

### Test 3: Promote to Admin
```bash
# Step 3: Database Update
SQL: UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

Expected:
✅ Database role changed to 'admin'
```

### Test 4: Login as Admin
```bash
# Step 4: Login Again
URL: http://localhost:3000/login
Email: user@example.com (same user!)
Password: Test@1234 (same password!)

Expected:
✅ Login successful
✅ Redirected to /admin (not /)
✅ See admin dashboard
✅ Admin menu visible
✅ Can manage products/orders/users
```

---

## 🎯 Key Points

### ✅ What IS Possible:
- Register as customer via `/register`
- Login via `/login` (role auto-detected)
- Get admin access by database role change
- Use same email/password after promotion

### ❌ What is NOT Possible:
- Register as admin from frontend
- Select role during registration
- Select role during login
- Change your own role from frontend
- Admin registration page

---

## 📚 Files Summary

### Backend Changes:
1. **auth.service.ts**
   - `register()` - Always creates role = "customer"
   - `login()` - Auto-detects role from database

2. **dto/index.ts**
   - `RegisterDto` - No role or adminCode fields
   - `LoginDto` - No role field

### Frontend Pages:
3. **login/page.tsx**
   - Single login for everyone

4. **register/page.tsx**
   - Customer registration only

5. **components/AuthForm.tsx**
   - No role selector
   - No admin fields
   - Clean, simple UI

---

## 🚀 Summary

Your system now implements true **Single Sign-On (SSO)**:

1. ✅ **ONE** registration page (customers only)
2. ✅ **ONE** login page (everyone)
3. ✅ **Automatic** role detection from database
4. ✅ **Simple** for customers (no confusing options)
5. ✅ **Secure** admin access (database-controlled)

### The Magic:
```
Customer registers → role = "customer" in DB
Admin changes role in DB → role = "admin"
User logs in → System reads DB → Gives correct access
```

**No frontend role selection. No confusion. Just works.** ✨

---

**Last Updated:** January 2025  
**Version:** 4.0.0 - True SSO Implementation
