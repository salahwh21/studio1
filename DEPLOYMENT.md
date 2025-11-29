# 📦 Deployment Guide - Frontend & Backend

## Quick Start (Replit)

### Frontend (.env.local)
```env
VITE_API_URL=https://your-repl-name.repl.co/api
VITE_SOCKET_IO_URL=https://your-repl-name.repl.co
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Backend (.env)
```env
DATABASE_URL=postgresql://... (auto-provided by Replit)
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-123456
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## Production Deployment (VPS/Custom Domain)

### 1. Frontend (Next.js)

```bash
# Build
npm run build

# Production start
npm run start
```

**Environment Variables:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_IO_URL=https://api.yourdomain.com
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 2. Backend (Node.js + Socket.IO)

```bash
cd backend
npm install
npm run start
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@db-host:5432/delivery_db
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-123456
GOOGLE_MAPS_API_KEY=your-google-maps-key
FRONTEND_URL=https://yourdomain.com
```

## Docker Deployment

### Build Images
```bash
# Backend
docker build -t delivery-api:latest ./backend

# Frontend (if needed)
docker build -t delivery-web:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## SSL/TLS Configuration

### Nginx Reverse Proxy (Recommended)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Monitoring & Logs

### Backend Logs
```bash
# Local
npm run dev

# Production with PM2
pm2 logs delivery-api

# Docker
docker logs delivery-api
```

### Health Check
```bash
curl https://yourdomain.com/api/health
```

## Security Checklist

- ✅ Change `JWT_SECRET` to a strong random key
- ✅ Configure firewall to only expose ports 80, 443
- ✅ Enable HTTPS/SSL certificates
- ✅ Set `NODE_ENV=production`
- ✅ Use strong database passwords
- ✅ Set up database backups
- ✅ Enable CORS only for your domain
- ✅ Rate limiting on API endpoints

## Troubleshooting

### Socket.IO Not Connecting
- Ensure backend and frontend URLs match
- Check firewall allows WebSocket connections
- Verify CORS configuration
- Enable WebSocket in reverse proxy

### API Not Accessible
- Check backend is running: `curl http://localhost:3001/api/health`
- Verify reverse proxy configuration
- Check firewall rules
- Review backend logs

### Database Connection Failed
- Verify `DATABASE_URL` format
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`
- Check network connectivity
- Ensure database user permissions

## Performance Optimization

- Enable gzip compression in Nginx
- Use CloudFlare for CDN
- Implement Redis caching layer
- Database query optimization
- Connection pooling (enabled by default)

Happy deploying! 🚀
