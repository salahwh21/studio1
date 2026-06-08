const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

const router = express.Router();

// Helper function to get Socket.IO instance from request
const getIO = (req) => {
  return req.app.get('io');
};

const TERMINAL_STATUSES = [
  'مكتمل',
  'مكتمل إرجاع تاجر',
  'مرجع للتاجر مكتمل',
  'ملغي',
  'مرتجع',
  'مرجع للتاجر',
  'مرجع للفرع',
  'تم استلام المال في الفرع',
  'تم محاسبة التاجر',
  'مؤرشف'
];

// --- Audit Logger Helper ---
async function logAudit(orderId, req, action, previousStatus, newStatus, outcome, reason = null) {
  const actorId = req.user?.id || 'unknown';
  const actorName = req.user?.name || 'unknown';
  const actorRole = req.user?.roleId || 'unknown';
  
  try {
    await db.query(
      `INSERT INTO order_audit_logs 
      (order_id, actor_id, actor_name, actor_role, action, previous_status, new_status, outcome, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [orderId, actorId, actorName, actorRole, action, previousStatus, newStatus, outcome, reason]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// --- Action Guard Helper ---
function checkActionAllowed(req, action, currentStatus, newStatus, driverName) {
  const role = req.user?.roleId || 'admin';
  if (role === 'admin') return { allowed: true };
  
  // Data scope for driver
  if (role === 'driver' && driverName && driverName !== req.user?.name) {
    return { allowed: false, reason: 'لا تملك صلاحية على طلبات تعود لسائق آخر' };
  }
  
  // Final States
  const finalStates = ['مكتمل', 'مرجع للتاجر مكتمل'];
  if (currentStatus && finalStates.includes(currentStatus)) {
    if (role !== 'accountant' || action !== 'change_status') {
       return { allowed: false, reason: 'الطلب في حالة نهائية ومغلق للعمليات' };
    }
  }
  
  if (action === 'change_status') {
    if (role === 'branch') {
       if (currentStatus === 'مرجع للفرع' && !['مؤجل', 'مرجع للتاجر'].includes(newStatus)) {
         return { allowed: false, reason: 'الفرع يستطيع تحويل الراجع فقط إلى مؤجل أو مرجع تاجر' };
       }
       if (currentStatus === 'تم التوصيل' && newStatus !== 'تم استلام المال في الفرع') {
         return { allowed: false, reason: 'الفرع يستطيع تأكيد الاستلام المالي فقط للطلبات الموصلة' };
       }
    }
    if (role === 'merchant_returns' && !['مكتمل إرجاع تاجر', 'مرجع للتاجر مكتمل'].includes(newStatus)) {
       return { allowed: false, reason: 'يُسمح فقط بإغلاق مرتجعات التاجر' };
    }
  }
  
  if (action === 'assign_driver' && ['branch', 'driver', 'merchant_returns'].includes(role)) {
     return { allowed: false, reason: 'دورك لا يسمح بتعيين سائقين' };
  }
  
  if (action === 'delete' && role !== 'ops') {
     return { allowed: false, reason: 'دورك لا يسمح بحذف الطلبات' };
  }
  
  return { allowed: true };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const cacheKey = `orders:list:${JSON.stringify(req.query)}:role:${req.user?.roleId || 'admin'}:name:${req.user?.name || 'unknown'}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const {
      page = 0,
      limit = 1000, // Increased default limit for dashboard
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

    // FIXED: SQL Injection - using $1, $2, etc
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

    // --- Backend RBAC Data Scoping ---
    const role = req.user?.roleId || 'admin';
    const userName = req.user?.name;

    if (role === 'driver') {
      whereClause += ` AND driver = $${paramIndex++}`;
      params.push(userName);
    } else if (role === 'merchant') {
      whereClause += ` AND merchant = $${paramIndex++}`;
      // Fallback to storeName if merchant name differs (depends on schema setup, assuming name matches for now)
      params.push(userName); 
    }
    // ---------------------------------

    // Whitelist for sortKey to prevent SQL injection
    const allowedSortKeys = ['id', 'created_at', 'date', 'status', 'cod', 'recipient', 'merchant', 'driver', 'order_number'];
    const safeSort = allowedSortKeys.includes(sortKey) ? sortKey : 'created_at';
    const safeDir = sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count first (for accurate pagination)
    const countParams = [...params];
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM orders ${whereClause}`,
      countParams
    );
    const totalCount = parseInt(countResult.rows[0].count) || 0;

    // OPTIMIZED: Single query with all needed data
    const ordersResult = await db.query(
      `SELECT * 
       FROM orders ${whereClause} 
       ORDER BY ${safeSort} ${safeDir} 
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
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
      previousDriver: row.previous_driver,
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

    const responseData = { orders, totalCount };
    await setCache(cacheKey, responseData, 300); // Cache for 5 minutes
    res.json(responseData);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR', details: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
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
      previousDriver: row.previous_driver,
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
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

router.post('/', authenticateToken, [
  body('recipient')
    .notEmpty().withMessage('Recipient is required')
    .isLength({ min: 2, max: 100 }).withMessage('Recipient name must be between 2 and 100 characters')
    .trim(),
  body('phone')
    .notEmpty().withMessage('Phone is required')
    .matches(/^07\d{8}$/).withMessage('Phone must be in format 07XXXXXXXX'),
  body('whatsapp')
    .optional({ checkFalsy: true })
    .matches(/^07\d{8}$/).withMessage('WhatsApp must be in format 07XXXXXXXX'),
  body('address')
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 500 }).withMessage('Address must be between 5 and 500 characters')
    .trim(),
  body('city')
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City name must be between 2 and 50 characters')
    .trim(),
  body('region')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 50 }).withMessage('Region name must be between 2 and 50 characters')
    .trim(),
  body('cod')
    .isNumeric().withMessage('COD must be a number')
    .isFloat({ min: 0 }).withMessage('COD must be greater than or equal to 0'),
  body('itemPrice')
    .optional()
    .isNumeric().withMessage('Item price must be a number')
    .isFloat({ min: 0 }).withMessage('Item price must be greater than or equal to 0'),
  body('deliveryFee')
    .optional()
    .isNumeric().withMessage('Delivery fee must be a number')
    .isFloat({ min: 0 }).withMessage('Delivery fee must be greater than or equal to 0'),
  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
    .trim(),
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
    await invalidateCache('orders:list:*');
    // Return full object to allow frontend to update state immediately without re-fetching
    res.status(201).json({
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
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const currentResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }

    const current = currentResult.rows[0];
    let previousStatus = current.previous_status;

    // Determine Action
    let action = 'update';
    if (updates.status && updates.status !== current.status) action = 'change_status';
    if (updates.driver && updates.driver !== current.driver) action = 'assign_driver';

    // Verify Guard
    const guard = checkActionAllowed(req, action, current.status, updates.status || current.status, current.driver);
    if (!guard.allowed) {
      await logAudit(id, req, action, current.status, updates.status, 'denied', guard.reason);
      return res.status(403).json({ error: guard.reason || 'Unauthorized action', code: 'UNAUTHORIZED' });
    }

    if (updates.status && updates.status !== current.status) {
      previousStatus = current.status;
    }

    // Handle terminal statuses: remove active driver and keep history
    let newPreviousDriver = current.previous_driver;
    if (updates.status && TERMINAL_STATUSES.includes(updates.status)) {
      const activeDriver = updates.driver !== undefined ? updates.driver : current.driver;
      if (activeDriver) {
        newPreviousDriver = activeDriver;
      }
      updates.driver = null; // Clear active driver
    }
    updates.previousDriver = newPreviousDriver;

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
      previousDriver: 'previous_driver',
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

    // FIXED: Using $1, $2, etc for parameterized queries
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
    
    // Emit Socket.IO event for order update
    const io = getIO(req);
    if (io) {
      io.emit('order_updated', {
        orderId: id,
        order: {
          id: row.id,
          orderNumber: row.order_number,
          status: row.status,
          previousStatus: row.previous_status
        }
      });
      
      // Also emit status change event if status was updated
      if (updates.status && updates.status !== current.status) {
        io.emit('order_status_changed', {
          order_id: id,
          status: row.status,
          previousStatus: previousStatus
        });
      }
    }
    
    // Log Success
    await logAudit(id, req, action, current.status, row.status, 'success');
    await invalidateCache('orders:list:*');
    
    res.json({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      previousStatus: row.previous_status
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

router.patch('/:id/status', authenticateToken, [
  body('status').notEmpty().withMessage('Status is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driver_id } = req.body;

    const currentResult = await db.query('SELECT status, driver FROM orders WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }

    const currentOrder = currentResult.rows[0];
    const previousStatus = currentOrder.status;

    const action = driver_id ? 'assign_driver' : 'change_status';
    const guard = checkActionAllowed(req, action, previousStatus, status, currentOrder.driver);
    if (!guard.allowed) {
      await logAudit(id, req, action, previousStatus, status, 'denied', guard.reason);
      return res.status(403).json({ error: guard.reason || 'Unauthorized action', code: 'UNAUTHORIZED' });
    }

    // Handle terminal statuses
    let finalDriver = driver_id;
    let finalPreviousDriver = undefined;
    
    if (TERMINAL_STATUSES.includes(status)) {
      finalPreviousDriver = driver_id || currentOrder.driver;
      finalDriver = null;
    }

    let query = `UPDATE orders SET status = $1, previous_status = $2, updated_at = NOW()`;
    let params = [status, previousStatus];
    let paramIdx = 3;

    if (finalDriver !== undefined || finalPreviousDriver !== undefined) {
       if (finalDriver !== undefined) {
         query += `, driver = $${paramIdx++}`;
         params.push(finalDriver);
       }
       if (finalPreviousDriver !== undefined) {
         query += `, previous_driver = $${paramIdx++}`;
         params.push(finalPreviousDriver);
       }
    }
    
    query += ` WHERE id = $${paramIdx} RETURNING *`;
    params.push(id);

    const result = await db.query(query, params);

    const updatedOrder = result.rows[0];
    
    // Emit Socket.IO event for status change
    const io = getIO(req);
    if (io) {
      io.emit('order_status_changed', {
        order_id: id,
        status: updatedOrder.status,
        previousStatus: previousStatus
      });
    }

    await logAudit(id, req, action, previousStatus, updatedOrder.status, 'success');
    await invalidateCache('orders:list:*');

    res.json({ id: updatedOrder.id, status: updatedOrder.status, previousStatus });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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
      const currentResult = await db.query('SELECT status, driver FROM orders WHERE id = $1', [orderId]);
      if (currentResult.rows.length > 0) {
        const currentOrder = currentResult.rows[0];
        const previousStatus = currentOrder.status;

        const guard = checkActionAllowed(req, 'change_status', previousStatus, status, currentOrder.driver);
        if (!guard.allowed) {
          await logAudit(orderId, req, 'change_status', previousStatus, status, 'denied', guard.reason);
          continue; // Skip unauthorized order but process the rest
        }

        let updateQuery = `UPDATE orders SET status = $1, previous_status = $2, updated_at = NOW()`;
        let updateParams = [status, previousStatus];
        let pIdx = 3;

        if (TERMINAL_STATUSES.includes(status)) {
          if (currentOrder.driver) {
             updateQuery += `, previous_driver = $${pIdx++}`;
             updateParams.push(currentOrder.driver);
          }
          updateQuery += `, driver = NULL`;
        }

        updateQuery += ` WHERE id = $${pIdx}`;
        updateParams.push(orderId);

        await db.query(updateQuery, updateParams);
      }
    }

    await db.query('COMMIT');
    await invalidateCache('orders:list:*');
    res.json({ updated: orderIds.length });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
    }

    // Emit Socket.IO event for order deletion
    const io = getIO(req);
    if (io) {
      io.emit('order_deleted', {
        orderId: req.params.id
      });
    }

    await invalidateCache('orders:list:*');
    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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

    // Emit Socket.IO events for each deleted order
    const io = getIO(req);
    if (io) {
      result.rows.forEach(row => {
        io.emit('order_deleted', {
          orderId: row.id
        });
      });
    }

    await invalidateCache('orders:list:*');
    res.json({ deleted: result.rows.length });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

module.exports = router;
