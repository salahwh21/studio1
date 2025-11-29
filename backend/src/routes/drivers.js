const express = require('express');
const router = express.Router();
const db = require('../config/database');

// السائقين المتاحين
router.get('/available', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, u.full_name, u.phone, u.avatar_url 
       FROM drivers d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.is_online = true 
       ORDER BY d.rating DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Available drivers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// تحديث موقع السائق
router.patch('/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    const result = await db.query(
      'UPDATE drivers SET current_latitude = $1, current_longitude = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [latitude, longitude, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: error.message });
  }
});

// تحديث حالة السائق (أونلاين/أوفلاين)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_online } = req.body;

    const result = await db.query(
      'UPDATE drivers SET is_online = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [is_online, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// الطلبات المسندة للسائق
router.get('/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    let query = 'SELECT * FROM orders WHERE driver_id = $1';
    const params = [id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Driver orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// إحصائيات السائق الفردي
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        d.id,
        d.is_online,
        d.rating,
        d.total_deliveries,
        COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.id END) as today_orders,
        COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.status = 'delivered' THEN o.delivery_fee ELSE 0 END), 0) as today_earnings,
        COALESCE(AVG(CASE WHEN o.status = 'delivered' THEN EXTRACT(EPOCH FROM (o.delivered_at - o.created_at))/3600 END), 0) as avg_delivery_hours
      FROM drivers d
      LEFT JOIN orders o ON o.driver_id = d.id
      WHERE d.id = $1
      GROUP BY d.id, d.is_online, d.rating, d.total_deliveries`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Driver stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
