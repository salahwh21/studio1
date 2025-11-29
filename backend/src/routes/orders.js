const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 0, 
      limit = 20, 
      sortKey = 'created_at', 
      sortDir = 'desc',
      status,
      driver,
      merchant,
      search,
      dateFrom,
      dateTo
    } = req.query;

    const offset = parseInt(page) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE 1=1';
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (driver) {
      whereClause += ` AND driver = $${paramIndex++}`;
      params.push(driver);
    }
    if (merchant) {
      whereClause += ` AND merchant = $${paramIndex++}`;
      params.push(merchant);
    }
    if (search) {
      whereClause += ` AND (id ILIKE $${paramIndex} OR recipient ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR address ILIKE $${paramIndex} OR reference_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (dateFrom) {
      whereClause += ` AND date >= $${paramIndex++}`;
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ` AND date <= $${paramIndex++}`;
      params.push(dateTo);
    }

    const allowedSortKeys = ['id', 'created_at', 'date', 'status', 'cod', 'recipient', 'merchant', 'driver', 'order_number'];
    const safeSort = allowedSortKeys.includes(sortKey) ? sortKey : 'created_at';
    const safeDir = sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM orders ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const ordersResult = await db.query(
      `SELECT * FROM orders ${whereClause} ORDER BY ${safeSort} ${safeDir} LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, parseInt(limit), offset]
    );

    const orders = ordersResult.rows.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      source: row.source,
      referenceNumber: row.reference_number,
      recipient: row.recipient,
      phone: row.phone,
      whatsapp: row.whatsapp,
      address: row.address,
      city: row.city,
      region: row.region,
      status: row.status,
      previousStatus: row.previous_status,
      driver: row.driver,
      merchant: row.merchant,
      cod: parseFloat(row.cod),
      itemPrice: parseFloat(row.item_price),
      deliveryFee: parseFloat(row.delivery_fee),
      additionalCost: parseFloat(row.additional_cost),
      driverFee: parseFloat(row.driver_fee),
      driverAdditionalFare: parseFloat(row.driver_additional_fare),
      date: row.date,
      notes: row.notes,
      lat: row.lat ? parseFloat(row.lat) : null,
      lng: row.lng ? parseFloat(row.lng) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({ orders, totalCount });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      orderNumber: row.order_number,
      source: row.source,
      referenceNumber: row.reference_number,
      recipient: row.recipient,
      phone: row.phone,
      whatsapp: row.whatsapp,
      address: row.address,
      city: row.city,
      region: row.region,
      status: row.status,
      previousStatus: row.previous_status,
      driver: row.driver,
      merchant: row.merchant,
      cod: parseFloat(row.cod),
      itemPrice: parseFloat(row.item_price),
      deliveryFee: parseFloat(row.delivery_fee),
      additionalCost: parseFloat(row.additional_cost),
      driverFee: parseFloat(row.driver_fee),
      driverAdditionalFare: parseFloat(row.driver_additional_fare),
      date: row.date,
      notes: row.notes,
      lat: row.lat ? parseFloat(row.lat) : null,
      lng: row.lng ? parseFloat(row.lng) : null
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, [
  body('recipient').notEmpty().withMessage('Recipient is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('cod').isNumeric().withMessage('COD must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      source = 'Manual',
      referenceNumber,
      recipient,
      phone,
      whatsapp,
      address,
      city,
      region,
      status = 'بالانتظار',
      driver,
      merchant,
      cod,
      itemPrice,
      deliveryFee = 1.5,
      additionalCost = 0,
      driverFee = 1.0,
      driverAdditionalFare = 0,
      date,
      notes,
      lat,
      lng
    } = req.body;

    const nextNumberResult = await db.query(
      'SELECT COALESCE(MAX(order_number), 0) + 1 as next_number FROM orders'
    );
    const orderNumber = nextNumberResult.rows[0].next_number;
    const orderId = `ORD-${orderNumber}`;

    const calculatedItemPrice = itemPrice || (cod - deliveryFee - additionalCost);

    const result = await db.query(
      `INSERT INTO orders (
        id, order_number, source, reference_number, recipient, phone, whatsapp,
        address, city, region, status, previous_status, driver, merchant,
        cod, item_price, delivery_fee, additional_cost, driver_fee, driver_additional_fare,
        date, notes, lat, lng
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *`,
      [
        orderId, orderNumber, source, referenceNumber, recipient, phone, whatsapp,
        address, city, region, status, '', driver, merchant,
        cod, calculatedItemPrice, deliveryFee, additionalCost, driverFee, driverAdditionalFare,
        date || new Date().toISOString().split('T')[0], notes, lat, lng
      ]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      orderNumber: row.order_number,
      source: row.source,
      referenceNumber: row.reference_number,
      recipient: row.recipient,
      phone: row.phone,
      status: row.status,
      merchant: row.merchant,
      cod: parseFloat(row.cod)
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const currentResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const current = currentResult.rows[0];
    let previousStatus = current.previous_status;
    
    if (updates.status && updates.status !== current.status) {
      previousStatus = current.status;
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings = {
      source: 'source',
      referenceNumber: 'reference_number',
      recipient: 'recipient',
      phone: 'phone',
      whatsapp: 'whatsapp',
      address: 'address',
      city: 'city',
      region: 'region',
      status: 'status',
      driver: 'driver',
      merchant: 'merchant',
      cod: 'cod',
      itemPrice: 'item_price',
      deliveryFee: 'delivery_fee',
      additionalCost: 'additional_cost',
      driverFee: 'driver_fee',
      driverAdditionalFare: 'driver_additional_fare',
      date: 'date',
      notes: 'notes',
      lat: 'lat',
      lng: 'lng'
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMappings)) {
      if (updates[jsKey] !== undefined) {
        fields.push(`${dbKey} = $${paramIndex++}`);
        values.push(updates[jsKey]);
      }
    }

    fields.push(`previous_status = $${paramIndex++}`);
    values.push(previousStatus);
    
    fields.push(`updated_at = NOW()`);

    values.push(id);

    const result = await db.query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    const row = result.rows[0];
    res.json({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      previousStatus: row.previous_status
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/status', authenticateToken, [
  body('status').notEmpty().withMessage('Status is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const currentResult = await db.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = currentResult.rows[0].status;

    const result = await db.query(
      `UPDATE orders SET status = $1, previous_status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, previousStatus, id]
    );

    res.json({ id: result.rows[0].id, status: result.rows[0].status, previousStatus });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk-status', authenticateToken, [
  body('orderIds').isArray().withMessage('Order IDs must be an array'),
  body('status').notEmpty().withMessage('Status is required')
], async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    await db.query('BEGIN');

    for (const orderId of orderIds) {
      const currentResult = await db.query('SELECT status FROM orders WHERE id = $1', [orderId]);
      if (currentResult.rows.length > 0) {
        const previousStatus = currentResult.rows[0].status;
        await db.query(
          `UPDATE orders SET status = $1, previous_status = $2, updated_at = NOW() WHERE id = $3`,
          [status, previousStatus, orderId]
        );
      }
    }

    await db.query('COMMIT');
    res.json({ updated: orderIds.length });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk-delete', authenticateToken, [
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const { orderIds } = req.body;

    const result = await db.query(
      'DELETE FROM orders WHERE id = ANY($1) RETURNING id',
      [orderIds]
    );

    res.json({ deleted: result.rows.length });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
