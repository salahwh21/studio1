const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/driver-slips', authenticateToken, async (req, res) => {
  try {
    const { page = 0, limit = 20, driverName, dateFrom, dateTo } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (driverName) {
      whereClause += ` AND driver_name = $${paramIndex++}`;
      params.push(driverName);
    }
    if (dateFrom) {
      whereClause += ` AND date >= $${paramIndex++}`;
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ` AND date <= $${paramIndex++}`;
      params.push(dateTo);
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM driver_return_slips ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const slipsResult = await db.query(
      `SELECT * FROM driver_return_slips ${whereClause} 
       ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, parseInt(limit), offset]
    );

    const slips = await Promise.all(slipsResult.rows.map(async (slip) => {
      const ordersResult = await db.query(
        'SELECT * FROM orders WHERE id = ANY($1)',
        [slip.order_ids || []]
      );

      return {
        id: slip.id,
        driverName: slip.driver_name,
        date: slip.date,
        itemCount: slip.item_count,
        orders: ordersResult.rows.map(o => ({
          id: o.id,
          recipient: o.recipient,
          status: o.status,
          merchant: o.merchant
        }))
      };
    }));

    res.json({ slips, totalCount });
  } catch (error) {
    console.error('Get driver return slips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/driver-slips/:id', authenticateToken, async (req, res) => {
  try {
    const slipResult = await db.query(
      'SELECT * FROM driver_return_slips WHERE id = $1',
      [req.params.id]
    );

    if (slipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Return slip not found' });
    }

    const slip = slipResult.rows[0];
    const ordersResult = await db.query(
      'SELECT * FROM orders WHERE id = ANY($1)',
      [slip.order_ids || []]
    );

    res.json({
      id: slip.id,
      driverName: slip.driver_name,
      date: slip.date,
      itemCount: slip.item_count,
      orders: ordersResult.rows.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        recipient: o.recipient,
        phone: o.phone,
        address: o.address,
        status: o.status,
        merchant: o.merchant,
        cod: parseFloat(o.cod)
      }))
    });
  } catch (error) {
    console.error('Get driver return slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/driver-slips', authenticateToken, [
  body('driverName').notEmpty().withMessage('Driver name is required'),
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { driverName, orderIds, date } = req.body;
    const id = `DRS-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO driver_return_slips (id, driver_name, date, item_count, order_ids)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, driverName, date || new Date().toISOString(), orderIds.length, orderIds]
    );

    res.status(201).json({
      id: result.rows[0].id,
      driverName: result.rows[0].driver_name,
      date: result.rows[0].date,
      itemCount: result.rows[0].item_count
    });
  } catch (error) {
    console.error('Create driver return slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/driver-slips/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM driver_return_slips WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Return slip not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete driver return slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/merchant-slips', authenticateToken, async (req, res) => {
  try {
    const { page = 0, limit = 20, merchant, status, dateFrom, dateTo } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (merchant) {
      whereClause += ` AND merchant = $${paramIndex++}`;
      params.push(merchant);
    }
    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (dateFrom) {
      whereClause += ` AND date >= $${paramIndex++}`;
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ` AND date <= $${paramIndex++}`;
      params.push(dateTo);
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM merchant_return_slips ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const slipsResult = await db.query(
      `SELECT * FROM merchant_return_slips ${whereClause} 
       ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, parseInt(limit), offset]
    );

    const slips = await Promise.all(slipsResult.rows.map(async (slip) => {
      const ordersResult = await db.query(
        'SELECT * FROM orders WHERE id = ANY($1)',
        [slip.order_ids || []]
      );

      return {
        id: slip.id,
        merchant: slip.merchant,
        date: slip.date,
        items: slip.items,
        status: slip.status,
        orders: ordersResult.rows.map(o => ({
          id: o.id,
          recipient: o.recipient,
          status: o.status
        }))
      };
    }));

    res.json({ slips, totalCount });
  } catch (error) {
    console.error('Get merchant return slips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/merchant-slips/:id', authenticateToken, async (req, res) => {
  try {
    const slipResult = await db.query(
      'SELECT * FROM merchant_return_slips WHERE id = $1',
      [req.params.id]
    );

    if (slipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Return slip not found' });
    }

    const slip = slipResult.rows[0];
    const ordersResult = await db.query(
      'SELECT * FROM orders WHERE id = ANY($1)',
      [slip.order_ids || []]
    );

    res.json({
      id: slip.id,
      merchant: slip.merchant,
      date: slip.date,
      items: slip.items,
      status: slip.status,
      orders: ordersResult.rows.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        recipient: o.recipient,
        phone: o.phone,
        address: o.address,
        status: o.status,
        cod: parseFloat(o.cod)
      }))
    });
  } catch (error) {
    console.error('Get merchant return slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/merchant-slips', authenticateToken, [
  body('merchant').notEmpty().withMessage('Merchant is required'),
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { merchant, orderIds, date, status = 'جاهز للتسليم' } = req.body;
    
    const countResult = await db.query('SELECT COUNT(*) FROM merchant_return_slips');
    const slipNumber = parseInt(countResult.rows[0].count) + 1;
    const id = `RS-${new Date().getFullYear()}-${String(slipNumber).padStart(3, '0')}`;

    const result = await db.query(
      `INSERT INTO merchant_return_slips (id, merchant, date, items, status, order_ids)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, merchant, date || new Date().toISOString(), orderIds.length, status, orderIds]
    );

    res.status(201).json({
      id: result.rows[0].id,
      merchant: result.rows[0].merchant,
      date: result.rows[0].date,
      items: result.rows[0].items,
      status: result.rows[0].status
    });
  } catch (error) {
    console.error('Create merchant return slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/merchant-slips/:id/status', authenticateToken, [
  body('status').notEmpty().withMessage('Status is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE merchant_return_slips SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Return slip not found' });
    }

    res.json({
      id: result.rows[0].id,
      status: result.rows[0].status
    });
  } catch (error) {
    console.error('Update merchant return slip status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/merchant-slips/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM merchant_return_slips WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Return slip not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete merchant return slip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
