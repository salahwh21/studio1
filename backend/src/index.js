const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const db = require('./config/database');
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

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

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

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/statuses', statusesRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/financials', financialsRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/drivers', driversRoutes);

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
});

module.exports = { app, server, io };
