# 🚀 Quick Start Guide

## 1️⃣ Setup (First Time)

### Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### Setup Database
```bash
cd backend
npm run migrate   # Create tables
npm run seed      # Add sample data
cd ..
```

## 2️⃣ Run Development Servers

### Terminal 1: Frontend
```bash
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

## 3️⃣ Test the Application

### Health Check
```bash
curl http://localhost:3001/api/health
# Should return: { status: "ok", database: "connected" }
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Create Order
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "recipient":"Ahmed Ali",
    "phone":"0791234567",
    "address":"123 Main St",
    "city":"عمان"
  }'
```

## 4️⃣ Common Commands

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production start
```

### Backend
```bash
npm run dev        # Development with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm start          # Production server
```

## 5️⃣ Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_IO_URL=http://localhost:3001
```

### Backend (backend/.env)
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/delivery_db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5000
```

## 6️⃣ Project Structure

```
project/
├── src/              # Frontend (Next.js)
│   ├── app/         # Routes & pages
│   ├── lib/         # API client & Socket.IO
│   ├── hooks/       # React hooks
│   └── components/  # React components
│
├── backend/          # Backend (Express)
│   ├── src/
│   │   ├── routes/  # API endpoints
│   │   └── config/  # Database config
│   └── migrations/  # Database schema
│
└── docs/            # Documentation
```

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5000 | xargs kill -9  # Frontend
```

### Database Connection Error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### API Not Responding
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check logs
cd backend
npm run dev  # Check console output
```

### Frontend Not Seeing Updates
```bash
# Clear cache
npm run build
npm run start

# Hard refresh in browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## 📚 Documentation

- **replit.md** - Full project documentation
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
- **backend/SETUP.md** - Backend setup guide
- **backend/PRODUCTION.md** - Production deployment

## ✅ Status

- ✅ Frontend: Ready
- ✅ Backend: Ready
- ✅ Database: Ready
- ✅ Real-time: Ready
- ✅ Deployment: Ready

---

Ready to build? Let's go! 🚀
