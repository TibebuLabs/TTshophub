# NileMart API Documentation

Base URL: `http://localhost:4000` (development)

All API endpoints are prefixed with `/api`

## Table of Contents
- [Authentication](#authentication)
- [Products](#products)
- [Orders](#orders)
- [Users](#users)
- [Notifications](#notifications)
- [Error Responses](#error-responses)

---

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0911234567",
  "password": "Password@123",
  "role": "customer", // or "admin" with invite code
  "inviteCode": "NILE-ADMIN" // required for admin role
}

Response: 201 Created
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0911234567",
  "role": "customer",
  "suspended": false,
  "city": "Addis Ababa",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile
```http
PATCH /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "0922222222",
  "city": "Addis Ababa"
}

Response: 200 OK
{ "id": "uuid", ... }
```

### Change Password
```http
PATCH /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current": "OldPassword@123",
  "password": "NewPassword@123"
}

Response: 200 OK
{ "message": "Password updated" }
```

---

## Products

### List Products
```http
GET /api/products?q=laptop&category=Electronics&minPrice=5000&maxPrice=50000&sort=price_asc&page=1&limit=20

Query Parameters:
- q: search query (optional)
- category: filter by category (optional)
- minPrice: minimum price in Birr (optional)
- maxPrice: maximum price in Birr (optional)
- sort: price_asc | price_desc | newest | popular (optional)
- page: page number (default: 1)
- limit: items per page (default: 20, max: 100)

Response: 200 OK
{
  "products": [
    {
      "id": "uuid",
      "name": "Premium Laptop",
      "nameAm": "ላፕቶፕ",
      "category": "Electronics",
      "images": ["https://..."],
      "price": 45000,
      "oldPrice": 50000,
      "stock": 15,
      "seller": "TechStore ET",
      "description": "High-performance laptop...",
      "rating": 4.5,
      "ratingCount": 128,
      "featured": true,
      "active": true,
      "tags": ["laptop", "gaming", "portable"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

### Get Single Product
```http
GET /api/products/:id

Response: 200 OK
{ ... product details ... }
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Product",
  "nameAm": "አዲስ ምርት",
  "category": "Electronics",
  "images": ["https://..."],
  "price": 15000,
  "oldPrice": 18000,
  "stock": 50,
  "seller": "Store Name",
  "description": "Product description",
  "descriptionAm": "የምርት መግለጫ",
  "featured": false,
  "tags": ["tag1", "tag2"]
}

Response: 201 Created
{ ... product ... }
```

### Update Product (Admin Only)
```http
PATCH /api/products/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 14000,
  "stock": 45,
  "featured": true
}

Response: 200 OK
{ ... updated product ... }
```

### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <admin-token>

Response: 200 OK
{ "message": "Product deleted" }
```

---

## Orders

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "name": "Product Name",
      "price": 5000,
      "qty": 2
    }
  ],
  "address": "Bole, Addis Ababa",
  "city": "Addis Ababa",
  "payment": "cod",
  "notes": "Please call before delivery"
}

Response: 201 Created
{
  "id": "uuid",
  "code": "NM-001234",
  "userId": "uuid",
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "0911234567",
  "address": "Bole, Addis Ababa",
  "city": "Addis Ababa",
  "payment": "cod",
  "paid": false,
  "items": [...],
  "subtotal": 10000,
  "shipping": 100,
  "total": 10100,
  "status": "placed",
  "notes": "...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

Cash on delivery is currently the only supported payment method. Requests using
`telebirr`, `cbe`, or `chapa` are rejected until an online payment provider is
integrated.

### Get My Orders
```http
GET /api/orders/mine?status=placed&page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- status: placed | confirmed | packed | shipped | delivered | cancelled (optional)
- page: page number (default: 1)
- limit: items per page (default: 10)

Response: 200 OK
{
  "orders": [ ... ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

### Get All Orders (Admin Only)
```http
GET /api/orders?status=placed&q=NM-001&city=Addis%20Ababa&page=1&limit=20
Authorization: Bearer <admin-token>

Query Parameters:
- status: filter by status (optional)
- q: search by code or customer name (optional)
- city: filter by city (optional)
- page: page number (default: 1)
- limit: items per page (default: 20)

Response: 200 OK
{
  "orders": [ ... ],
  "total": 250,
  "page": 1,
  "totalPages": 13
}
```

### Get Order Stats (Admin Only)
```http
GET /api/orders/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "totalRevenue": 1250000,
  "totalOrders": 450,
  "pendingOrders": 23,
  "revenueByCity": [
    { "city": "Addis Ababa", "total": 750000, "count": 280 },
    { "city": "Dire Dawa", "total": 250000, "count": 95 }
  ],
  "statusCounts": {
    "placed": 15,
    "confirmed": 8,
    "packed": 5,
    "shipped": 12,
    "delivered": 395,
    "cancelled": 15
  }
}
```

### Advance Order Status (Admin Only)
```http
PATCH /api/orders/:id/advance
Authorization: Bearer <admin-token>

Response: 200 OK
{ ... updated order ... }
```

### Cancel Order
```http
PATCH /api/orders/:id/cancel
Authorization: Bearer <token> // owner or admin

Response: 200 OK
{ ... cancelled order ... }
```

---

## Users (Admin Only)

### List Users
```http
GET /api/users?role=customer&q=john&page=1&limit=20
Authorization: Bearer <admin-token>

Query Parameters:
- role: customer | admin (optional)
- q: search by name or email (optional)
- suspended: true | false (optional)
- page: page number (default: 1)
- limit: items per page (default: 20)

Response: 200 OK
{
  "users": [ ... ],
  "total": 1250,
  "page": 1,
  "totalPages": 63
}
```

### Create User
```http
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0933333333",
  "password": "Password@123",
  "role": "customer",
  "city": "Bahir Dar"
}

Response: 201 Created
{ ... user ... }
```

### Update User
```http
PATCH /api/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Updated",
  "phone": "0944444444",
  "role": "admin"
}

Response: 200 OK
{ ... updated user ... }
```

### Suspend/Activate User
```http
PATCH /api/users/:id/suspend
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "suspended": true
}

Response: 200 OK
{ ... updated user ... }
```

### Reset User Password
```http
POST /api/users/:id/reset-password
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "password": "NewPassword@123"
}

Response: 200 OK
{ "message": "Password reset successfully" }
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>

Response: 200 OK
{ "message": "User deleted" }
```

### Get User Stats
```http
GET /api/users/:id/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "userId": "uuid",
  "totalOrders": 15,
  "totalSpent": 125000,
  "averageOrderValue": 8333,
  "lastOrderDate": "2024-01-15T00:00:00.000Z"
}
```

---

## Notifications

### List Notifications
```http
GET /api/notifications?read=false&page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- read: true | false (optional)
- page: page number (default: 1)
- limit: items per page (default: 20)

Response: 200 OK
{
  "notifications": [
    {
      "id": "uuid",
      "audience": "user",
      "userId": "uuid",
      "type": "order_status",
      "title": "Order Shipped",
      "body": "Your order NM-001234 has been shipped",
      "orderId": "uuid",
      "read": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 45,
  "unreadCount": 12
}
```

### Mark as Read
```http
PATCH /api/notifications/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}

Response: 200 OK
{ "message": "Notifications marked as read", "count": 3 }
```

### Real-time Stream (SSE)
```http
GET /api/notifications/stream?token=<jwt-token>

Response: text/event-stream
event: notification
data: {"id":"uuid","type":"order_created","title":"New Order",...}

event: notification
data: {"id":"uuid","type":"stock_low","title":"Low Stock Alert",...}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Status Codes
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input/validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., duplicate email)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Notes

1. **Authentication**: Most endpoints require a JWT token in the `Authorization` header: `Bearer <token>`
2. **Admin Routes**: Endpoints marked "(Admin Only)" require `role: admin`
3. **Pagination**: Most list endpoints support pagination with `page` and `limit` query parameters
4. **Date Formats**: All dates are in ISO 8601 format (UTC)
5. **Prices**: All prices are in Ethiopian Birr (ETB)
6. **Rate Limiting**: API is rate-limited to prevent abuse (default: 100 requests per 15 minutes)

---

## Additional Resources

- [Architecture Overview](../README.md#architecture)
- [Database Schema](./SCHEMA.md)
- [WebSocket Events](./EVENTS.md)
- [Payment Integration](./PAYMENTS.md)
