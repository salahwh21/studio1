const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications/templates — list WhatsApp templates from settings
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1;
    const result = await db.query(
      "SELECT settings_data->'notifications'->'manualTemplates' AS templates FROM settings WHERE company_id = $1",
      [companyId]
    );
    const templates = result.rows[0]?.templates || [];
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/notifications/whatsapp — build a WhatsApp message URL for an order
// Returns the wa.me URL that the frontend should open
router.post('/whatsapp', authenticateToken, async (req, res) => {
  try {
    const { orderId, templateKey, customMessage } = req.body;

    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    // Fetch the order details
    const orderResult = await db.query(
      'SELECT id, recipient, phone, whatsapp, address, region, city, cod, status FROM orders WHERE id = $1',
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderResult.rows[0];

    const companyId = req.user?.company_id || 1;
    let messageText = customMessage;

    // If templateKey provided, load template from settings
    if (!messageText && templateKey) {
      const settingsResult = await db.query(
        "SELECT settings_data->'notifications'->'manualTemplates' AS templates FROM settings WHERE company_id = $1",
        [companyId]
      );
      const templates = settingsResult.rows[0]?.templates || [];
      const template = templates.find(t => t.key === templateKey || t.name === templateKey);
      if (template?.content) {
        messageText = template.content
          .replace(/\{recipient\}/g, order.recipient || '')
          .replace(/\{orderId\}/g, order.id?.slice(-6) || '')
          .replace(/\{status\}/g, order.status || '')
          .replace(/\{cod\}/g, order.cod || '0')
          .replace(/\{address\}/g, order.address || '')
          .replace(/\{region\}/g, order.region || '')
          .replace(/\{city\}/g, order.city || '');
      }
    }

    // Default message if nothing provided
    if (!messageText) {
      messageText = [
        `رقم الطلب: #${order.id?.slice(-6)}`,
        '',
        `الاسم: ${order.recipient}`,
        `العنوان: ${[order.address, order.region, order.city].filter(Boolean).join(', ')}`,
        '',
        `المبلغ المطلوب: ${order.cod}`,
        `حالة الطلب: ${order.status}`,
        '',
        '- شكراً لتعاملكم معنا -',
      ].join('\n');
    }

    // Determine the phone number to use
    const rawPhone = order.whatsapp || order.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('962') ? cleanPhone : `962${cleanPhone.replace(/^0/, '')}`;

    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${phoneWithCode}?text=${encoded}`;

    // Log the notification attempt
    try {
      await db.query(
        `INSERT INTO notification_logs (order_id, channel, sent_by, message_preview, phone)
         VALUES ($1, 'whatsapp', $2, $3, $4)`,
        [orderId, req.user?.name || req.user?.id, messageText.slice(0, 200), phoneWithCode]
      );
    } catch (_) {
      // Table might not exist yet — non-fatal
    }

    res.json({ url: waUrl, phone: phoneWithCode, message: messageText });
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/notifications/logs — list notification history (admin/accountant only)
router.get('/logs', authenticateToken, authorizeRoles('admin', 'accountant', 'customer_service'), async (req, res) => {
  try {
    const { orderId, limit = 50, page = 0 } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    let query = `SELECT * FROM notification_logs`;
    const params = [];
    if (orderId) {
      query += ` WHERE order_id = $1`;
      params.push(orderId);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    // Table might not exist yet
    res.json({ logs: [] });
  }
});

module.exports = router;
