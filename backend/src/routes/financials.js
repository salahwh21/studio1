const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Financial Overview Dashboard API
router.get('/overview', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    let currentParams = [];
    let previousParams = [];
    let currentFilter = '';
    let previousFilter = '';

    if (startDate && endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      currentFilter = `DATE(created_at) BETWEEN $1 AND $2`;
      currentParams = [startDate, endDate];

      const start = new Date(startDate);
      const diffTime = Math.abs(new Date(endDate) - start);
      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd.getTime() - diffTime);

      previousFilter = `DATE(created_at) BETWEEN $1 AND $2`;
      previousParams = [prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0]];

    } else if (period === 'today') {
      currentFilter = `DATE(created_at) = CURRENT_DATE`;
      previousFilter = `DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`;
    } else if (period === 'week') {
      currentFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      previousFilter = `created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days'`;
    } else {
      currentFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
      previousFilter = `created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days'`;
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
      WHERE ${currentFilter}
    `, currentParams);

    // Previous period for comparison
    const previousStats = await db.query(`
      SELECT
        COALESCE(SUM(cod), 0)::DECIMAL(12,2) as total_cod,
        COALESCE(SUM(delivery_fee), 0)::DECIMAL(12,2) as total_delivery_fees
      FROM orders
      WHERE ${previousFilter}
    `, previousParams);

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
router.get('/debt-alerts', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
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
router.post('/notify-debt', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
  const { name, amount, method, email, phone } = req.body;

  if (!name || !amount || !method) {
    return res.status(400).json({ error: 'name, amount, method مطلوبين' });
  }

  try {
    if (method === 'email') {
      if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpHost || !smtpUser || !smtpPass) {
        return res.status(400).json({ error: 'إعدادات البريد غير مكتملة — اذهب لإعدادات البريد أولاً' });
      }

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'الوميض'}" <${smtpUser}>`,
        to: email,
        subject: `تذكير بمستحقات مالية — ${amount} د.أ`,
        html: `<div dir="rtl" style="font-family:sans-serif;padding:24px">
          <h2 style="color:#f97316">تذكير بمستحقات مالية</h2>
          <p>مرحباً <strong>${name}</strong>،</p>
          <p>نود تذكيركم بأن لديكم مستحقات بقيمة <strong>${amount} د.أ</strong> لم يتم تسويتها بعد.</p>
          <p>نرجو التواصل مع الإدارة لترتيب عملية الدفع.</p>
          <p style="color:#999;font-size:12px;margin-top:24px">نظام الوميض لإدارة التوصيل</p>
        </div>`,
      });

      return res.json({ success: true, message: `تم إرسال تذكير بالبريد إلى ${name}` });

    } else if (method === 'whatsapp') {
      const whatsappPhone = phone || '';
      if (!whatsappPhone) return res.status(400).json({ error: 'رقم الواتساب مطلوب' });

      const cleanPhone = whatsappPhone.replace(/^0/, '962');
      const message = encodeURIComponent(
        `مرحباً ${name}، هذا تذكير بأن لديكم مستحقات بقيمة ${amount} د.أ لم يتم تسويتها. نرجو التواصل مع الإدارة.`
      );
      const url = `https://wa.me/${cleanPhone}?text=${message}`;

      return res.json({ success: true, message: `رابط واتساب جاهز`, url });

    } else {
      return res.status(400).json({ error: 'method يجب أن يكون email أو whatsapp' });
    }
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: error.message || 'فشل إرسال التذكير' });
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
      WHERE (driver = $1 OR previous_driver = $1) AND ${dateFilter}
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
      WHERE (driver = $1 OR previous_driver = $1) AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `, [driverName]);

    const previousResult = await db.query(`
      SELECT 
        COUNT(*) as orders,
        SUM(driver_fee)::DECIMAL(10,2) as earnings,
        SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered
      FROM orders 
      WHERE (driver = $1 OR previous_driver = $1) AND created_at >= CURRENT_DATE - INTERVAL '60 days' 
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
      WHERE (driver = $1 OR previous_driver = $1) AND status = 'تم التوصيل'
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

    // Batch: collect all order IDs and fetch in one query
    const allOrderIds = slipsResult.rows.flatMap(s => s.order_ids || []);
    let ordersMap = {};
    if (allOrderIds.length > 0) {
      const ordersResult = await db.query(
        'SELECT id, recipient, cod, status, driver_fee FROM orders WHERE id = ANY($1)',
        [allOrderIds]
      );
      ordersResult.rows.forEach(o => { ordersMap[o.id] = o; });
    }

    const slips = slipsResult.rows.map(slip => ({
      id: slip.id,
      driverName: slip.driver_name,
      date: slip.date,
      itemCount: slip.item_count,
      orders: (slip.order_ids || []).map(oid => ordersMap[oid]).filter(Boolean).map(o => ({
        id: o.id,
        recipient: o.recipient,
        cod: parseFloat(o.cod),
        status: o.status,
        driverFee: parseFloat(o.driver_fee)
      }))
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

router.post('/driver-payments', authenticateToken, authorizeRoles('admin', 'accountant'), [
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

router.put('/driver-payments/:id', authenticateToken, authorizeRoles('admin', 'accountant'), [
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { orderIds } = req.body;

    const result = await db.query(
      `UPDATE driver_payment_slips 
       SET order_ids = $1, item_count = $2
       WHERE id = $3 RETURNING *`,
      [orderIds, orderIds.length, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    res.json({
      id: result.rows[0].id,
      driverName: result.rows[0].driver_name,
      date: result.rows[0].date,
      itemCount: result.rows[0].item_count
    });
  } catch (error) {
    console.error('Update driver payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/driver-payments/:id', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
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

    // Batch: collect all order IDs and fetch in one query
    const allOrderIds = slipsResult.rows.flatMap(s => s.order_ids || []);
    let ordersMap = {};
    if (allOrderIds.length > 0) {
      const ordersResult = await db.query(
        'SELECT id, recipient, cod, status, item_price FROM orders WHERE id = ANY($1)',
        [allOrderIds]
      );
      ordersResult.rows.forEach(o => { ordersMap[o.id] = o; });
    }

    const slips = slipsResult.rows.map(slip => ({
      id: slip.id,
      merchantName: slip.merchant_name,
      date: slip.date,
      itemCount: slip.item_count,
      status: slip.status,
      orders: (slip.order_ids || []).map(oid => ordersMap[oid]).filter(Boolean).map(o => ({
        id: o.id,
        recipient: o.recipient,
        cod: parseFloat(o.cod),
        status: o.status,
        itemPrice: parseFloat(o.item_price)
      }))
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

router.post('/merchant-payments', authenticateToken, authorizeRoles('admin', 'accountant'), [
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

router.put('/merchant-payments/:id', authenticateToken, authorizeRoles('admin', 'accountant'), [
  body('orderIds').isArray().withMessage('Order IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { orderIds } = req.body;

    const result = await db.query(
      `UPDATE merchant_payment_slips 
       SET order_ids = $1, item_count = $2
       WHERE id = $3 RETURNING *`,
      [orderIds, orderIds.length, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment slip not found' });
    }

    res.json({
      id: result.rows[0].id,
      merchantName: result.rows[0].merchant_name,
      date: result.rows[0].date,
      itemCount: result.rows[0].item_count
    });
  } catch (error) {
    console.error('Update merchant payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/merchant-payments/:id/status', authenticateToken, authorizeRoles('admin', 'accountant'), [
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

router.delete('/merchant-payments/:id', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
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

// ==================== Order Settlements ====================

// GET /api/financials/settlements — قائمة التسويات مع فلترة
router.get('/settlements', authenticateToken, authorizeRoles('admin', 'accountant'), async (req, res) => {
  try {
    const { status, orderId, page = 0, limit = 50 } = req.query;
    const offset = parseInt(page) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';
    let i = 1;

    if (status) { where += ` AND s.status = $${i++}`; params.push(status); }
    if (orderId) { where += ` AND s.order_id = $${i++}`; params.push(orderId); }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM order_settlements s ${where}`, params
    );

    const result = await db.query(
      `SELECT s.*, o.recipient, o.merchant, o.driver, o.status as order_status, o.order_number
       FROM order_settlements s
       JOIN orders o ON o.id = s.order_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${i++} OFFSET $${i}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      settlements: result.rows,
      totalCount: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/financials/settlements/:orderId — تسوية طلب محدد
router.get('/settlements/:orderId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, o.recipient, o.merchant, o.driver, o.status as order_status, o.order_number
       FROM order_settlements s
       JOIN orders o ON o.id = s.order_id
       WHERE s.order_id = $1`,
      [req.params.orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get settlement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/financials/settlements — إنشاء تسوية يدوية
router.post('/settlements', authenticateToken, authorizeRoles('admin', 'accountant'), [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('codCollected').isNumeric().withMessage('COD collected must be a number'),
  body('companyShare').isNumeric().withMessage('Company share must be a number'),
  body('driverShare').isNumeric().withMessage('Driver share must be a number'),
  body('merchantShare').isNumeric().withMessage('Merchant share must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { orderId, codCollected, companyShare, driverShare, merchantShare, rtoFee = 0, notes } = req.body;

    const orderCheck = await db.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const result = await db.query(
      `INSERT INTO order_settlements
         (order_id, cod_collected, company_share, driver_share, merchant_share, rto_fee, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (order_id) DO UPDATE SET
         cod_collected = EXCLUDED.cod_collected,
         company_share = EXCLUDED.company_share,
         driver_share  = EXCLUDED.driver_share,
         merchant_share = EXCLUDED.merchant_share,
         rto_fee = EXCLUDED.rto_fee,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING *`,
      [orderId, codCollected, companyShare, driverShare, merchantShare, rtoFee, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/financials/settlements/:id — تحديث حالة التسوية
router.patch('/settlements/:id', authenticateToken, authorizeRoles('admin', 'accountant'), [
  body('status').isIn(['pending', 'settled']).withMessage('Invalid status'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { status } = req.body;
    const settledAt = status === 'settled' ? new Date().toISOString() : null;
    const settledBy = status === 'settled' ? req.user.name : null;

    const result = await db.query(
      `UPDATE order_settlements
       SET status = $1, settled_at = $2, settled_by = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, settledAt, settledBy, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Settlement not found' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update settlement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
