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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
