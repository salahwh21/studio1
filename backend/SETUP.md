# Backend Setup Instructions

## Quick Setup (Choose One Method)

### Method 1: Local Development (Easiest for Testing)

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with your PostgreSQL credentials
# If using Replit: Use the Database tool to create PostgreSQL
# If local: Use local PostgreSQL instance

# 4. Run migrations
npm run migrate

# 5. Seed sample data (optional)
npm run seed

# 6. Start development server
npm run dev
```

Backend will be available at: **http://localhost:3001**

### Method 2: Docker (Recommended for Production)

```bash
cd backend

# 1. Create .env file
cp .env.example .env

# 2. Edit .env if needed (defaults work with Docker)

# 3. Start everything with Docker
docker-compose up -d

# 4. Check if running
docker-compose ps

# 5. View logs
docker-compose logs -f
```

Backend will be available at: **http://localhost:3001**

### Method 3: Using Deploy Script (VPS)

```bash
# On your VPS:
scp -r backend/ user@your-vps:/opt/delivery-backend/
ssh user@your-vps

cd /opt/delivery-backend
chmod +x deploy.sh
./deploy.sh setup
nano .env  # Edit settings
./deploy.sh deploy
```

## Using with Your Frontend

### 1. Update Next.js Environment

In your frontend root, create/update `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Create API Wrapper

Add to `lib/api-client.ts` in frontend:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function api(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

### 3. Update Frontend to Use API

Replace Zustand store actions with API calls. Example:

```typescript
// Before (mock data)
const orders = [/* mock data */];

// After (using API)
const fetchOrders = async (filters) => {
  const { orders, totalCount } = await api('/orders', {
    method: 'GET',
    // filters passed as query params
  });
  setOrders(orders);
};
```

## Testing the API

### Test Health Check

```bash
curl http://localhost:3001/api/health
```

### Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alwameed.com","password":"123"}'
```

### Test Get Orders

```bash
TOKEN="your-jwt-token-here"
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

## Verify Everything is Working

1. **Backend Running**: Visit http://localhost:3001/api/health
   - Should show: `{"status":"ok","timestamp":"..."}`

2. **Database Connected**: Check logs for "Connected to PostgreSQL"

3. **Can Login**: 
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@alwameed.com","password":"123"}'
   ```
   - Should return JWT token

4. **Can Fetch Data**: 
   - With the token from step 3, call any endpoint with `-H "Authorization: Bearer TOKEN"`

## Troubleshooting

### Port 3001 Already in Use

```bash
# Kill the process using port 3001
lsof -i :3001
kill -9 <PID>
```

### Database Connection Error

1. Check `.env` DATABASE_URL is correct
2. Make sure PostgreSQL is running
3. For Replit: Create database in Database tool
4. For Docker: Run `docker-compose up -d db` first

### Migrations Fail

```bash
# Check database is accessible
npm run migrate

# Seed sample data
npm run seed
```

## Production Deployment Checklist

- [ ] Change JWT_SECRET in .env to something random
- [ ] Set NODE_ENV=production
- [ ] Use strong database password
- [ ] Set FRONTEND_URL to your actual frontend domain
- [ ] Use HTTPS for API
- [ ] Set up proper logging and monitoring
- [ ] Backup database regularly
- [ ] Use environment variables for secrets (not hardcoded)

## Get Help

- Check `README.md` for complete API documentation
- Review `BACKEND_INTEGRATION_GUIDE.md` for integration examples
- Check logs: `npm run logs` or `docker-compose logs`
- Test endpoints with curl or Postman

## Next Steps

1. ✅ Backend setup complete
2. ✅ Database configured
3. ⏭️ Update frontend to call backend endpoints
4. ⏭️ Test each feature end-to-end
5. ⏭️ Deploy to production

Your frontend code remains **100% unchanged** - only the data source changes from mock to real API!
