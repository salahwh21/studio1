const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Financial Overview Dashboard API
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = '';
    let previousDateFilter = '';

    if (startDate && endDate) {
      // Validate date format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      dateFilter = `DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'`;

      // Calculate previous period
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);

      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);

      const prevStart = new Date(prevEnd);
      prevStart.setTime(prevEnd.getTime() - diffTime);

      const prevStartStr = prevStart.toISOString().split('T')[0];
      const prevEndStr = prevEnd.toISOString().split('T')[0];

      previousDateFilter = `DATE(created_at) BETWEEN '${prevStartStr}' AND '${prevEndStr}'`;

    } else if (period === 'today') {
      dateFilter = `DATE(created_at) = CURRENT_DATE`;
      previousDateFilter = `DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`;
    } else if (period === 'week') {
      dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      previousDateFilter = `created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days'`;
    } else {
      dateFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
      previousDateFilter = `created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days'`;
    }

    // Current period stats
    const currentStats = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered_orders,
        COALESCE(SUM(cod), 0)::DECIMAL(12,2) as total_cod,
        COALESCE(SUM(item_price), 0)::DECIMAL(12,2) as merchant_due,
        COALESCE(SUM(delivery_fee), 0)::DECIMAL(12,2) as total_delivery_fees,
        COALESCE(SUM(driver_fee), 0)::DECIMAL(12,2) as total_driver_fees,
        COALESCE(SUM(driver_additional_fare), 0)::DECIMAL(12,2) as total_additional_fares
      FROM orders 
      WHERE ${dateFilter}
    `);

    // Previous period for comparison
    const previousStats = await db.query(`
      SELECT 
        COALESCE(SUM(cod), 0)::DECIMAL(12,2) as total_cod,
        COALESCE(SUM(delivery_fee), 0)::DECIMAL(12,2) as total_delivery_fees
      FROM orders 
      WHERE ${previousDateFilter}
    `);

    // Pending payments
    const pendingMerchant = await db.query(`
      SELECT COALESCE(SUM(item_price), 0)::DECIMAL(12,2) as pending
      FROM orders 
      WHERE status IN ('تم التوصيل', 'تم استلام المال في الفرع') 
      AND id NOT IN (SELECT UNNEST(order_ids) FROM merchant_payment_slips WHERE status = 'تم التسليم')
    `);

    const pendingDriver = await db.query(`
      SELECT COALESCE(SUM(driver_fee + COALESCE(driver_additional_fare, 0)), 0)::DECIMAL(12,2) as pending
      FROM orders 
      WHERE status = 'تم التوصيل' 
      AND id NOT IN (SELECT UNNEST(order_ids) FROM driver_payment_slips)
    `);

    const current = currentStats.rows[0];
    const previous = previousStats.rows[0];

    const totalRevenue = parseFloat(current.total_cod) || 0;
    const totalDriverExpenses = (parseFloat(current.total_driver_fees) || 0) + (parseFloat(current.total_additional_fares) || 0);
    const merchantDue = parseFloat(current.merchant_due) || 0;
    const totalExpenses = totalDriverExpenses + merchantDue;
    const netProfit = parseFloat(current.total_delivery_fees) || 0;

    const previousRevenue = parseFloat(previous.total_cod) || 0;
    const growthPercent = previousRevenue > 0
      ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(2)
      : 0;

    res.json({
      period,
      totalRevenue,
      totalExpenses,
      netProfit,
      ordersCount: parseInt(current.total_orders) || 0,
      deliveredCount: parseInt(current.delivered_orders) || 0,
      pendingPaymentsMerchant: parseFloat(pendingMerchant.rows[0].pending) || 0,
      pendingPaymentsDriver: parseFloat(pendingDriver.rows[0].pending) || 0,
      periodComparison: {
        previousPeriod: previousRevenue,
        currentPeriod: totalRevenue,
        growthPercent: parseFloat(growthPercent)
      }
    });
  } catch (error) {
    console.error('Financial overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debt Alerts API - Get pending debts for drivers and merchants
router.get('/debt-alerts', authenticateToken, async (req, res) => {
  try {
    // Get drivers with pending collections (delivered but not collected)
    const driversResult = await db.query(`
      SELECT 
        driver as name,
        COUNT(*) as pending_orders,
        SUM(cod)::DECIMAL(12,2) as pending_amount,
        MIN(updated_at) as oldest_order_date
      FROM orders 
      WHERE status = 'تم التوصيل' 
        AND driver IS NOT NULL
        AND id NOT IN (SELECT UNNEST(order_ids) FROM driver_payment_slips)
      GROUP BY driver
      HAVING SUM(cod) > 0
      ORDER BY SUM(cod) DESC
      LIMIT 10
    `);

    // Get merchants awaiting payment
    const merchantsResult = await db.query(`
      SELECT 
        merchant as name,
        COUNT(*) as pending_orders,
        SUM(item_price)::DECIMAL(12,2) as pending_amount,
        MIN(updated_at) as oldest_order_date
      FROM orders 
      WHERE status IN ('تم التوصيل', 'تم استلام المال في الفرع')
        AND merchant IS NOT NULL  
        AND id NOT IN (SELECT UNNEST(order_ids) FROM merchant_payment_slips WHERE status = 'تم التسليم')
      GROUP BY merchant
      HAVING SUM(item_price) > 0
      ORDER BY SUM(item_price) DESC
      LIMIT 10
    `);

    // Calculate urgency based on oldest order date
    const calculateUrgency = (oldestDate) => {
      if (!oldestDate) return 'low';
      const daysSince = Math.floor((Date.now() - new Date(oldestDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 7) return 'high';
      if (daysSince > 3) return 'medium';
      return 'low';
    };

    const drivers = driversResult.rows.map(d => ({
      name: d.name,
      pendingOrders: parseInt(d.pending_orders) || 0,
      pendingAmount: parseFloat(d.pending_amount) || 0,
      oldestOrderDate: d.oldest_order_date,
      urgency: calculateUrgency(d.oldest_order_date)
    }));

    const merchants = merchantsResult.rows.map(m => ({
      name: m.name,
      pendingOrders: parseInt(m.pending_orders) || 0,
      pendingAmount: parseFloat(m.pending_amount) || 0,
      oldestOrderDate: m.oldest_order_date,
      urgency: calculateUrgency(m.oldest_order_date)
    }));

    const totalDriverDebt = drivers.reduce((sum, d) => sum + d.pendingAmount, 0);
    const totalMerchantDebt = merchants.reduce((sum, m) => sum + m.pendingAmount, 0);

    res.json({
      drivers,
      merchants,
      summary: {
        totalDriverDebt,
        totalMerchantDebt,
        driversWithDebt: drivers.length,
        merchantsAwaitingPayment: merchants.length,
        highUrgencyCount: [...drivers, ...merchants].filter(x => x.urgency === 'high').length
      }
    });
  } catch (error) {
    console.error('Debt alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Notify Debt API
router.post('/notify-debt', authenticateToken, async (req, res) => {
  const { name, amount, method } = req.body;

  try {
    // In a real application, you would integrate with an email service (like SendGrid, AWS SES)
    // or an SMS gateway (like Twilio).
    // For now, we simulate the notification sending.

    console.log(`[Notification System] Sending ${method} reminder to ${name} for amount ${amount}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      success: true,
      message: `تم إرسال تذكير الدفع بنجاح إلى ${name}`
    });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// New Statistics API Endpoints

// Driver Statistics
router.get('/driver-statistics/:driverName', authenticateToken, async (req, res) => {
  try {
    const { driverName } = req.params;
    const { period = 'today' } = req.query;

    let dateFilter = '';
    if (period === 'today') {
      dateFilter = `DATE(created_at) = CURRENT_DATE`;
    } else if (period === 'week') {
      dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'month') {
      dateFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(driver_fee)::DECIMAL(10,2) as total_earnings,
        SUM(driver_additional_fare)::DECIMAL(10,2) as additional_fare,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::DECIMAL(5,2) as avg_delivery_time_hours
      FROM orders 
      WHERE driver = $1 AND ${dateFilter}
    `, [driverName]);

    const stats = statsResult.rows[0] || {};
    const successRate = stats.total_orders > 0 ? ((stats.delivered_orders / stats.total_orders) * 100).toFixed(2) : 0;

    res.json({
      driverName,
      period,
      totalOrders: parseInt(stats.total_orders) || 0,
      deliveredOrders: parseInt(stats.delivered_orders) || 0,
      totalEarnings: parseFloat(stats.total_earnings) || 0,
      additionalFare: parseFloat(stats.additional_fare) || 0,
      successRate: parseFloat(successRate),
      avgDeliveryTimeHours: parseFloat(stats.avg_delivery_time_hours) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Merchant Statistics
router.get('/merchant-statistics/:merchantName', authenticateToken, async (req, res) => {
  try {
    const { merchantName } = req.params;
    const { period = 'month' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'month') {
      dateFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'راجع' THEN 1 ELSE 0 END) as returned_orders,
        SUM(cod)::DECIMAL(10,2) as total_revenue,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::DECIMAL(5,2) as avg_delivery_days
      FROM orders 
      WHERE merchant = $1 AND ${dateFilter}
    `, [merchantName]);

    const stats = statsResult.rows[0] || {};
    const successRate = stats.total_orders > 0 ? ((stats.delivered_orders / stats.total_orders) * 100).toFixed(2) : 0;
    const returnRate = stats.total_orders > 0 ? ((stats.returned_orders / stats.total_orders) * 100).toFixed(2) : 0;

    res.json({
      merchantName,
      period,
      totalOrders: parseInt(stats.total_orders) || 0,
      deliveredOrders: parseInt(stats.delivered_orders) || 0,
      returnedOrders: parseInt(stats.returned_orders) || 0,
      totalRevenue: parseFloat(stats.total_revenue) || 0,
      successRate: parseFloat(successRate),
      returnRate: parseFloat(returnRate),
      avgDeliveryDays: parseFloat(stats.avg_delivery_days) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Period Comparison
router.get('/comparison/:driverName', authenticateToken, async (req, res) => {
  try {
    const { driverName } = req.params;

    const currentResult = await db.query(`
      SELECT 
        COUNT(*) as orders,
        SUM(driver_fee)::DECIMAL(10,2) as earnings,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered
      FROM orders 
      WHERE driver = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `, [driverName]);

    const previousResult = await db.query(`
      SELECT 
        COUNT(*) as orders,
        SUM(driver_fee)::DECIMAL(10,2) as earnings,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered
      FROM orders 
      WHERE driver = $1 AND created_at >= CURRENT_DATE - INTERVAL '60 days' 
        AND created_at < CURRENT_DATE - INTERVAL '30 days'
    `, [driverName]);

    const current = currentResult.rows[0] || { orders: 0, earnings: 0 };
    const previous = previousResult.rows[0] || { orders: 0, earnings: 0 };

    const growthOrders = previous.orders > 0 ? (((current.orders - previous.orders) / previous.orders) * 100).toFixed(2) : 0;
    const growthEarnings = previous.earnings > 0 ? (((current.earnings - previous.earnings) / previous.earnings) * 100).toFixed(2) : 0;

    res.json({
      current: {
        orders: parseInt(current.orders),
        earnings: parseFloat(current.earnings),
        delivered: parseInt(current.delivered)
      },
      previous: {
        orders: parseInt(previous.orders),
        earnings: parseFloat(previous.earnings),
        delivered: parseInt(previous.delivered)
      },
      growth: {
        orders: `${growthOrders > 0 ? '+' : ''}${growthOrders}%`,
        earnings: `${growthEarnings > 0 ? '+' : ''}${growthEarnings}%`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fee Breakdown
router.get('/fee-breakdown/:driverName', authenticateToken, async (req, res) => {
  try {
    const { driverName } = req.params;

    const breakdownResult = await db.query(`
      SELECT 
        SUM(driver_fee)::DECIMAL(10,2) as delivery_fees,
        SUM(driver_additional_fare)::DECIMAL(10,2) as additional_fares,
        COUNT(*) as total_items
      FROM orders 
      WHERE driver = $1 AND status = 'تم التوصيل'
    `, [driverName]);

    const breakdown = breakdownResult.rows[0] || {};
    const deliveryFees = parseFloat(breakdown.delivery_fees) || 0;
    const additionalFares = parseFloat(breakdown.additional_fares) || 0;
    const netTotal = deliveryFees + additionalFares;

    res.json({
      driverName,
      deliveryFees,
      additionalFares,
      penalties: 0,
      bonuses: 0,
      netTotal,
      totalItems: parseInt(breakdown.total_items) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Original Driver Payments (kept for compatibility)
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
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status } = req.body;

    const result = await client.query(
      'UPDATE merchant_payment_slips SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    const slip = result.rows[0];

    // If status is 'Paid' (تم التسليم), update all associated orders
    if (status === 'تم التسليم' || status === 'مدفوع') {
      if (slip.order_ids && slip.order_ids.length > 0) {
        await client.query(
          `UPDATE orders SET status = 'تم محاسبة التاجر' WHERE id = ANY($1)`,
          [slip.order_ids]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      id: slip.id,
      status: slip.status
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update merchant payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
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
