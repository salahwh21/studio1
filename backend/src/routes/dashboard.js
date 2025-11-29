const express = require('express');
const router = express.Router();
const db = require('../config/database');

// احصائيات Dashboard الرئيسية
router.get('/stats', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [ordersToday, activeDrivers, revenueToday, pendingOrders] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM orders WHERE created_at >= $1', [todayStart]),
      db.query('SELECT COUNT(*) as count FROM drivers WHERE is_online = true'),
      db.query('SELECT COALESCE(SUM(delivery_fee), 0) as total FROM orders WHERE created_at >= $1 AND payment_status = $2', [todayStart, 'paid']),
      db.query('SELECT COUNT(*) as count FROM orders WHERE status = $1', ['pending'])
    ]);

    res.json({
      ordersToday: parseInt(ordersToday.rows[0].count),
      activeDrivers: parseInt(activeDrivers.rows[0].count),
      revenueToday: parseFloat(revenueToday.rows[0].total),
      pendingOrders: parseInt(pendingOrders.rows[0].count)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// احصائيات الإيرادات
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    let dateFilter = "CURRENT_DATE";
    
    if (period === 'week') {
      dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "CURRENT_DATE - INTERVAL '30 days'";
    }

    const result = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_orders,
        COALESCE(SUM(delivery_fee), 0) as revenue,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as completed
      FROM orders 
      WHERE created_at >= ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// احصائيات السائقين
router.get('/drivers-stats', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        d.id,
        u.full_name,
        u.avatar_url,
        d.is_online,
        d.rating,
        d.total_deliveries,
        COUNT(o.id) as today_deliveries,
        COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.delivery_fee ELSE 0 END), 0) as today_earnings
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN orders o ON o.driver_id = d.id AND DATE(o.created_at) = CURRENT_DATE
      GROUP BY d.id, u.full_name, u.avatar_url, d.is_online, d.rating, d.total_deliveries
      ORDER BY d.rating DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Drivers stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// احصائيات الطلبات حسب الحالة
router.get('/orders-by-status', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(delivery_fee), 0) as total_revenue
      FROM orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY status
      ORDER BY count DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Orders by status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
