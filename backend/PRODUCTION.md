# 🚀 Production Deployment Guide

## Environment Variables Setup

For production deployment on VPS or Docker, configure these environment variables:

```bash
# Required Variables
DATABASE_URL=postgresql://user:password@db-host:5432/delivery_db
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-123456

# Optional but Recommended
GOOGLE_MAPS_API_KEY=your-google-maps-key
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
LOG_LEVEL=info
```

## Deployment Steps

### 1. VPS Deployment

```bash
# Clone repository
git clone <your-repo>
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your production values
nano .env

# Start backend service
npm run start
# OR use PM2 for process management
pm2 start src/index.js --name "delivery-api"
```

### 2. Docker Deployment

```bash
# Build image
docker build -t delivery-api .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -e NODE_ENV=production \
  --name delivery-api \
  delivery-api
```

### 3. Database Migration

```bash
# Create database tables (if not using Docker Compose)
npm run migrate

# Seed initial data (admin user, etc.)
npm run seed
```

## Features

- ✅ Full REST API with 10+ endpoints
- ✅ Real-time Socket.IO communication
- ✅ PostgreSQL database with connection pooling
- ✅ JWT authentication
- ✅ CORS support
- ✅ Error handling and logging

## Performance Optimization

- Connection pooling: 20 max connections
- SSL/TLS support for database
- Gzip compression enabled
- Request timeout: 2 seconds
- Automatic reconnection on failure

## Monitoring

```bash
# Check API health
curl http://your-domain/api/health

# Check Socket.IO connection
# Connect WebSocket client to ws://your-domain:3000
```

## Troubleshooting

### Database Connection Failed
- Verify `DATABASE_URL` format
- Check network connectivity to database host
- Ensure database user has proper permissions

### Socket.IO Not Connecting
- Verify `FRONTEND_URL` matches your domain
- Check CORS configuration
- Enable WebSocket support in reverse proxy (Nginx/Apache)

### SSL/TLS Errors
- For production: Set `NODE_ENV=production`
- Database SSL will be enabled automatically
- Use valid certificates for HTTPS

## Support

For issues, check:
1. `.env` file is correctly configured
2. Database is running and accessible
3. Firewall rules allow port 3000
4. Logs for detailed error messages

Happy deploying! 🎉
