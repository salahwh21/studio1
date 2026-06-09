const express = require('express');
// Force nodemon restart
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
// Redis caching enabled - v3 (fixed TLS)

const db = require('./config/database');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased to 5000 to prevent 429 errors during dev/testing
  message: { error: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later', code: 'AUTH_RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const rolesRoutes = require('./routes/roles');
const statusesRoutes = require('./routes/statuses');
const areasRoutes = require('./routes/areas');
const financialsRoutes = require('./routes/financials');
const returnsRoutes = require('./routes/returns');
const dashboardRoutes = require('./routes/dashboard');
const driversRoutes = require('./routes/drivers');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(compression());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});

// Make io available to routes via app
app.set('io', io);

const PORT = process.env.PORT || 3001;

// CORS configuration - allow credentials for cookies
// SECURITY: In production, use specific origin instead of wildcard
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin in development to support testing on local network IPs
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Cookie parser middleware for httpOnly cookies
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      query: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', apiLimiter, ordersRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/roles', apiLimiter, rolesRoutes);
app.use('/api/statuses', apiLimiter, statusesRoutes);
app.use('/api/areas', apiLimiter, areasRoutes);
app.use('/api/financials', apiLimiter, financialsRoutes);
app.use('/api/returns', apiLimiter, returnsRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/drivers', apiLimiter, driversRoutes);
app.use('/api/settings', apiLimiter, settingsRoutes);
app.use('/api/backup', apiLimiter, require('./routes/backup'));
app.use('/api/export-sql', apiLimiter, require('./routes/export-sql'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ==================== Socket.IO Real-time Events ====================

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // السائق يرسل موقعه الفعلي
  socket.on('driver_location', async (data) => {
    try {
      const { driver_id, order_id, latitude, longitude } = data;

      // تحديث موقع السائق في قاعدة البيانات
      await db.query(
        'UPDATE drivers SET current_latitude = $1, current_longitude = $2 WHERE id = $3',
        [latitude, longitude, driver_id]
      );

      // حفظ في جدول التتبع
      if (order_id) {
        await db.query(
          'INSERT INTO order_tracking (order_id, driver_latitude, driver_longitude, status) VALUES ($1, $2, $3, $4)',
          [order_id, latitude, longitude, 'in_transit']
        );
      }

      // بث الموقع للعملاء المتابعين للطلبية
      io.emit(`order_tracking_${order_id}`, {
        driver_id,
        latitude,
        longitude,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Driver location error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  // طلب جديد تم إنشاؤه
  socket.on('new_order', (data) => {
    io.emit('new_order_created', data);
  });

  // تحديث حالة الطلبية
  socket.on('order_status_changed', (data) => {
    io.emit(`order_status_${data.order_id}`, data);
  });

  // السائق متصل/غير متصل
  socket.on('driver_status_changed', async (data) => {
    try {
      const { driver_id, is_online } = data;
      await db.query(
        'UPDATE drivers SET is_online = $1 WHERE id = $2',
        [is_online, driver_id]
      );
      io.emit('driver_status_update', data);
    } catch (error) {
      console.error('Driver status error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start Server with Socket.IO
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend API running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time communication`);

  // Warm up database connection pool
  db.query('SELECT 1')
    .then(() => console.log('🔥 Database Connection Warmed Up!'))
    .catch((err) => console.error('❌ Failed to warm up Database Connection:', err));
});

module.exports = { app, server, io };
