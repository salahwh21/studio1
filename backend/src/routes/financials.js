const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/driver-payments', authenticateToken, async (req, res) => {
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
      `SELECT COUNT(*) FROM driver_payment_slips ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const slipsResult = await db.query(
      `SELECT * FROM driver_payment_slips ${whereClause} 
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
          cod: parseFloat(o.cod),
          status: o.status,
          driverFee: parseFloat(o.driver_fee)
        }))
      };
    }));

    res.json({ slips, totalCount });
  } catch (error) {
    console.error('Get driver payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/driver-payments/:id', authenticateToken, async (req, res) => {
  try {
    const slipResult = await db.query(
      'SELECT * FROM driver_payment_slips WHERE id = $1',
      [req.params.id]
    );

    if (slipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
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
        cod: parseFloat(o.cod),
        itemPrice: parseFloat(o.item_price),
        deliveryFee: parseFloat(o.delivery_fee),
        driverFee: parseFloat(o.driver_fee),
        driverAdditionalFare: parseFloat(o.driver_additional_fare),
        merchant: o.merchant
      }))
    });
  } catch (error) {
    console.error('Get driver payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/driver-payments', authenticateToken, [
  body('driverName').notEmpty().withMessage('Driver name is required'),
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { driverName, orderIds, date } = req.body;
    const id = `PAY-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO driver_payment_slips (id, driver_name, date, item_count, order_ids)
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
    console.error('Create driver payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/driver-payments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM driver_payment_slips WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete driver payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/merchant-payments', authenticateToken, async (req, res) => {
  try {
    const { page = 0, limit = 20, merchantName, status, dateFrom, dateTo } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (merchantName) {
      whereClause += ` AND merchant_name = $${paramIndex++}`;
      params.push(merchantName);
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
      `SELECT COUNT(*) FROM merchant_payment_slips ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const slipsResult = await db.query(
      `SELECT * FROM merchant_payment_slips ${whereClause} 
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
        merchantName: slip.merchant_name,
        date: slip.date,
        itemCount: slip.item_count,
        status: slip.status,
        orders: ordersResult.rows.map(o => ({
          id: o.id,
          recipient: o.recipient,
          cod: parseFloat(o.cod),
          status: o.status,
          itemPrice: parseFloat(o.item_price)
        }))
      };
    }));

    res.json({ slips, totalCount });
  } catch (error) {
    console.error('Get merchant payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/merchant-payments/:id', authenticateToken, async (req, res) => {
  try {
    const slipResult = await db.query(
      'SELECT * FROM merchant_payment_slips WHERE id = $1',
      [req.params.id]
    );

    if (slipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    const slip = slipResult.rows[0];
    const ordersResult = await db.query(
      'SELECT * FROM orders WHERE id = ANY($1)',
      [slip.order_ids || []]
    );

    res.json({
      id: slip.id,
      merchantName: slip.merchant_name,
      date: slip.date,
      itemCount: slip.item_count,
      status: slip.status,
      orders: ordersResult.rows.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        recipient: o.recipient,
        phone: o.phone,
        address: o.address,
        status: o.status,
        cod: parseFloat(o.cod),
        itemPrice: parseFloat(o.item_price),
        deliveryFee: parseFloat(o.delivery_fee)
      }))
    });
  } catch (error) {
    console.error('Get merchant payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/merchant-payments', authenticateToken, [
  body('merchantName').notEmpty().withMessage('Merchant name is required'),
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { merchantName, orderIds, date, status = 'جاهز للتسليم' } = req.body;
    const id = `MPAY-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO merchant_payment_slips (id, merchant_name, date, item_count, status, order_ids)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, merchantName, date || new Date().toISOString(), orderIds.length, status, orderIds]
    );

    res.status(201).json({
      id: result.rows[0].id,
      merchantName: result.rows[0].merchant_name,
      date: result.rows[0].date,
      itemCount: result.rows[0].item_count,
      status: result.rows[0].status
    });
  } catch (error) {
    console.error('Create merchant payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/merchant-payments/:id/status', authenticateToken, [
  body('status').notEmpty().withMessage('Status is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE merchant_payment_slips SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    res.json({
      id: result.rows[0].id,
      status: result.rows[0].status
    });
  } catch (error) {
    console.error('Update merchant payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/merchant-payments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM merchant_payment_slips WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete merchant payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
