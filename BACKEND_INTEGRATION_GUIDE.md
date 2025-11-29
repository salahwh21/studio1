# Backend Integration Guide

## Overview

A complete Node.js + Express backend API has been created to perfectly match your Next.js frontend delivery management app. The backend is **100% independent** and can run on Replit, Docker, or any VPS without modifying the frontend.

## Quick Start: Local Development

### 1. Start Backend on Replit (Port 3001)

```bash
cd backend
npm install
npm run dev
```

The API will be available at: `http://localhost:3001`

### 2. Update Frontend to Call Backend

Update your `.env.local` or environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Or for production:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### 3. Create API Client (Frontend)

Add to your frontend `lib/api-client.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

## API Endpoints Reference

### Authentication
```typescript
// Login
const { token, user } = await apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
});
localStorage.setItem('token', token);

// Register
await apiCall('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ 
    name: 'John', 
    email: 'john@example.com',
    password: 'pass123',
    roleId: 'driver'
  })
});

// Get Current User
const user = await apiCall('/auth/me');
```

### Orders (Main API)
```typescript
// List orders with filters
const { orders, totalCount } = await apiCall('/orders?page=0&limit=20&status=جاري التوصيل&search=محمد');

// Get single order
const order = await apiCall('/orders/ORD-123');

// Create order
const newOrder = await apiCall('/orders', {
  method: 'POST',
  body: JSON.stringify({
    recipient: 'محمد أحمد',
    phone: '0791234567',
    address: 'عمان، تلاع العلي',
    city: 'عمان',
    region: 'تلاع العلي',
    cod: 50.00,
    status: 'بالانتظار',
    merchant: 'جنان صغيرة',
    driver: 'ابو العبد'
  })
});

// Update order
await apiCall('/orders/ORD-123', {
  method: 'PUT',
  body: JSON.stringify({ status: 'تم التوصيل' })
});

// Update multiple orders status
await apiCall('/orders/bulk-status', {
  method: 'POST',
  body: JSON.stringify({
    orderIds: ['ORD-1', 'ORD-2', 'ORD-3'],
    status: 'تم التوصيل'
  })
});

// Delete order
await apiCall('/orders/ORD-123', { method: 'DELETE' });

// Bulk delete
await apiCall('/orders/bulk-delete', {
  method: 'POST',
  body: JSON.stringify({ orderIds: ['ORD-1', 'ORD-2'] })
});
```

### Users
```typescript
// List users
const { users, totalCount } = await apiCall('/users?roleId=driver&search=ابو');

// List drivers
const drivers = await apiCall('/users/drivers');

// List merchants  
const merchants = await apiCall('/users/merchants');

// Get user
const user = await apiCall('/users/user-123');

// Create user
await apiCall('/users', {
  method: 'POST',
  body: JSON.stringify({
    name: 'علي محمد',
    email: 'ali@example.com',
    roleId: 'driver',
    password: '123'
  })
});

// Update user
await apiCall('/users/user-123', {
  method: 'PUT',
  body: JSON.stringify({ name: 'علي أحمد' })
});

// Delete user
await apiCall('/users/user-123', { method: 'DELETE' });
```

### Statuses
```typescript
// List all statuses
const statuses = await apiCall('/statuses');

// Get single status
const status = await apiCall('/statuses/STS_001');

// Create status
await apiCall('/statuses', {
  method: 'POST',
  body: JSON.stringify({
    code: 'CUSTOM_STATUS',
    name: 'حالة مخصصة',
    color: '#FF5722'
  })
});
```

### Financials (Payment Slips)
```typescript
// Driver payments
const { slips } = await apiCall('/financials/driver-payments?page=0&limit=20');
await apiCall('/financials/driver-payments', {
  method: 'POST',
  body: JSON.stringify({
    driverName: 'ابو العبد',
    orderIds: ['ORD-1', 'ORD-2']
  })
});

// Merchant payments
const { slips } = await apiCall('/financials/merchant-payments?page=0&limit=20');
await apiCall('/financials/merchant-payments', {
  method: 'POST',
  body: JSON.stringify({
    merchantName: 'جنان صغيرة',
    orderIds: ['ORD-1']
  })
});
```

### Returns (Return Slips)
```typescript
// Driver return slips
const { slips } = await apiCall('/returns/driver-slips');
await apiCall('/returns/driver-slips', {
  method: 'POST',
  body: JSON.stringify({
    driverName: 'ابو العبد',
    orderIds: ['ORD-1']
  })
});

// Merchant return slips
const { slips } = await apiCall('/returns/merchant-slips');
await apiCall('/returns/merchant-slips', {
  method: 'POST',
  body: JSON.stringify({
    merchant: 'جنان صغيرة',
    orderIds: ['ORD-1']
  })
});
```

### Areas (Cities & Regions)
```typescript
// Get all areas
const cities = await apiCall('/areas/all');

// Get cities only
const cities = await apiCall('/areas/cities');

// Get regions by city
const regions = await apiCall('/areas/cities/CITY_AMM/regions');

// Create city
await apiCall('/areas/cities', {
  method: 'POST',
  body: JSON.stringify({ name: 'الزرقاء' })
});

// Create region
await apiCall('/areas/regions', {
  method: 'POST',
  body: JSON.stringify({ name: 'جبل طارق', cityId: 'CITY_ZRQ' })
});
```

## Database Setup

### Option 1: Use Replit's Built-in Database

Create a PostgreSQL database using Replit's database pane, then update `.env`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Then run migrations
cd backend
npm run migrate
npm run seed
```

### Option 3: Docker

```bash
cd backend
docker-compose up -d
```

## Default Test Credentials (After Seeding)

- **Admin**: `admin@alwameed.com` / `123`
- **Driver**: `0799754316` / `123`
- **Merchant**: `0786633891` / `123`

## Deployment

### Docker Deployment (Recommended)

1. Copy backend folder to your server:
   ```bash
   scp -r backend/ user@your-vps:/opt/delivery-backend/
   ```

2. On the VPS:
   ```bash
   cd /opt/delivery-backend
   chmod +x deploy.sh
   ./deploy.sh setup
   nano .env  # Update settings
   ./deploy.sh deploy
   ```

3. Access at: `https://your-domain:3001`

### Environment Variables for Production

```
DATABASE_URL=postgresql://user:password@host:5432/delivery_db
JWT_SECRET=your-very-secret-key-here-change-this
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Architecture

```
Backend (Node.js/Express)
├── Authentication (JWT)
├── Orders API
├── Users API
├── Roles API
├── Statuses API
├── Areas API
├── Financials API
└── Returns API
    ↓
PostgreSQL Database
    ↓
Docker Compose (Optional)
    ↓
VPS Deployment
```

## Frontend Stays Unchanged

Your entire Next.js frontend remains **100% unchanged**. The backend is a separate service that can be:
- Developed independently
- Deployed to a different server
- Scaled independently
- Updated without affecting frontend

## Next Steps

1. Choose your database option (Replit, Local, or Docker)
2. Update `.env` file with database credentials
3. Run `npm run migrate && npm run seed`
4. Start backend: `npm run dev`
5. Update frontend API calls to point to backend
6. Test the integration

## Support

For issues:
- Check backend logs: `npm run logs` (Docker) or terminal output
- Verify database connection: `npm run migrate`
- Test API health: `curl http://localhost:3001/api/health`
- Review API responses in browser DevTools Network tab

All API endpoints return JSON with proper HTTP status codes for error handling.
