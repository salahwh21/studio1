const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ============================================
// SMS Integration (Twilio or local gateway)
// ============================================

async function sendSMS(phone, message) {
  const provider = process.env.SMS_PROVIDER || 'none';

  if (provider === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured');
      return { success: false, error: 'SMS not configured' };
    }

    try {
      const twilio = require('twilio')(accountSid, authToken);
      const result = await twilio.messages.create({
        body: message,
        from: fromNumber,
        to: phone.startsWith('+') ? phone : `+${phone}`,
      });
      return { success: true, sid: result.sid };
    } catch (err) {
      console.error('Twilio error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Local SMS gateway (HTTP API)
  if (provider === 'local' && process.env.SMS_GATEWAY_URL) {
    try {
      const response = await fetch(process.env.SMS_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message,
          api_key: process.env.SMS_GATEWAY_KEY,
        }),
      });
      const data = await response.json();
      return { success: data.success || response.ok, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'No SMS provider configured' };
}

// ============================================
// Automated notifications helper
// ============================================

async function sendOrderNotification(orderId, eventType) {
  try {
    // Get order details
    const orderResult = await db.query(
      'SELECT id, recipient, phone, whatsapp, cod, status, merchant FROM orders WHERE id = $1',
      [orderId]
    );
    if (orderResult.rows.length === 0) return;
    const order = orderResult.rows[0];

    // Get notification settings
    const settingsResult = await db.query(
      "SELECT settings_data->'notifications' AS settings FROM settings WHERE company_id = 1"
    );
    const settings = settingsResult.rows[0]?.settings || {};

    // Check if this event type should trigger notification
    const autoNotify = settings.autoNotify || {};
    if (!autoNotify[eventType]) return;

    // Get message template
    const templates = settings.autoTemplates || {};
    let message = templates[eventType];
    if (!message) return;

    // Replace placeholders
    message = message
      .replace(/\{recipient\}/g, order.recipient || '')
      .replace(/\{orderId\}/g, order.id?.slice(-6) || '')
      .replace(/\{status\}/g, order.status || '')
      .replace(/\{cod\}/g, order.cod || '0');

    // Determine phone
    const rawPhone = order.whatsapp || order.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('962') ? cleanPhone : `962${cleanPhone.replace(/^0/, '')}`;

    // Send via preferred channel
    const channel = settings.preferredChannel || 'whatsapp';

    if (channel === 'sms') {
      const result = await sendSMS(phoneWithCode, message);
      await logNotification(orderId, 'sms', 'system', message, phoneWithCode, result.success);
    } else {
      // WhatsApp API (if configured) or just log
      await logNotification(orderId, 'whatsapp_auto', 'system', message, phoneWithCode, true);
    }
  } catch (err) {
    console.error('Auto notification error:', err);
  }
}

async function logNotification(orderId, channel, sentBy, message, phone, success = true) {
  try {
    await db.query(
      `INSERT INTO notification_logs (order_id, channel, sent_by, message_preview, phone, success)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, channel, sentBy, message.slice(0, 200), phone, success]
    );
  } catch (_) {}
}

// Export for use in other routes
module.exports.sendOrderNotification = sendOrderNotification;
module.exports.sendSMS = sendSMS;

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

// POST /api/notifications/sms — send SMS to order recipient
router.post('/sms', authenticateToken, async (req, res) => {
  try {
    const { orderId, message } = req.body;

    if (!orderId || !message) {
      return res.status(400).json({ error: 'orderId and message are required' });
    }

    // Fetch order
    const orderResult = await db.query(
      'SELECT id, recipient, phone, whatsapp FROM orders WHERE id = $1',
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderResult.rows[0];

    // Determine phone
    const rawPhone = order.whatsapp || order.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('962') ? cleanPhone : `962${cleanPhone.replace(/^0/, '')}`;

    // Send SMS
    const result = await sendSMS(phoneWithCode, message);

    // Log
    await logNotification(orderId, 'sms', req.user?.name || req.user?.id, message, phoneWithCode, result.success);

    if (result.success) {
      res.json({ success: true, phone: phoneWithCode });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('SMS error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/notifications/test-sms — test SMS configuration
router.post('/test-sms', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const result = await sendSMS(phone, 'رسالة تجريبية من نظام الوميض');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications/settings — get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT settings_data->'notifications' AS settings FROM settings WHERE company_id = 1"
    );
    res.json(result.rows[0]?.settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/settings — update notification settings
router.put('/settings', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const settings = req.body;

    await db.query(
      `UPDATE settings
       SET settings_data = jsonb_set(COALESCE(settings_data, '{}'), '{notifications}', $1::jsonb)
       WHERE company_id = 1`,
      [JSON.stringify(settings)]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.sendOrderNotification = sendOrderNotification;
module.exports.sendSMS = sendSMS;
