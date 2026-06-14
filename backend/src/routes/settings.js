const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Get all settings (optional auth for development)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1; // Default to company 1
    
    const cacheKey = `settings:company:${companyId}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const result = await pool.query(
      'SELECT settings_data, updated_at FROM settings WHERE company_id = $1',
      [companyId]
    );

    if (result.rows.length === 0) {
      // If no settings exist, create default settings
      const defaultSettings = {
        notifications: {
          manualTemplates: [],
          aiSettings: { useAI: false, aiTone: 'friendly', rules: [] }
        },
        orders: {
          orderPrefix: 'ORD-',
          defaultStatus: 'PENDING',
          refPrefix: 'REF-',
          archiveStartStatus: 'COMPLETED',
          archiveAfterDays: 90,
          archiveWarningDays: 7
        },
        login: {
          companyName: 'الوميض',
          welcomeMessage: 'مرحباً',
          loginLogo: null,
          headerLogo: null,
          loginBg: null,
          reportsLogo: null,
          policyLogo: null,
          favicon: null,
          showForgotPassword: true,
          socialLinks: { whatsapp: '', instagram: '', facebook: '' }
        },
        regional: {
          currency: 'JOD',
          currencySymbol: 'د.أ',
          currencySymbolPosition: 'after',
          thousandsSeparator: ',',
          decimalSeparator: '.',
          language: 'ar',
          timezone: 'Asia/Amman',
          dateFormat: 'DD/MM/YYYY',
          firstDayOfWeek: 'saturday',
          unitsSystem: 'metric'
        },
        ui: {
          density: 'comfortable',
          borderRadius: '0.5',
          iconStrokeWidth: 2,
          iconLibrary: 'lucide'
        },
        policy: {
          elements: [],
          paperSize: 'custom',
          customDimensions: { width: 100, height: 150 },
          margins: { top: 5, right: 5, bottom: 5, left: 5 }
        },
        menuVisibility: {
          merchant: ['dashboard:view', 'orders:view', 'financials:view', 'merchant-portal:use'],
          driver: ['driver-app:use']
        },
        aiAgent: { enabled: true }
      };

      const insertResult = await pool.query(
        'INSERT INTO settings (company_id, settings_data, created_by) VALUES ($1, $2, $3) RETURNING settings_data, updated_at',
        [companyId, JSON.stringify(defaultSettings), req.user?.email || 'system']
      );

      const responseData = {
        success: true,
        data: insertResult.rows[0].settings_data,
        updated_at: insertResult.rows[0].updated_at
      };
      await setCache(cacheKey, responseData, 3600); // 1 hour cache
      return res.json(responseData);
    }

    const responseData = {
      success: true,
      data: result.rows[0].settings_data,
      updated_at: result.rows[0].updated_at
    };
    await setCache(cacheKey, responseData, 3600);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// Update all settings (optional auth for development)
router.put('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1;
    const settingsData = req.body;

    const result = await pool.query(
      `INSERT INTO settings (company_id, settings_data, updated_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (company_id)
       DO UPDATE SET
         settings_data = $2,
         updated_by = $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING settings_data, updated_at`,
      [companyId, JSON.stringify(settingsData), req.user?.email || 'system']
    );

    await invalidateCache(`settings:company:${companyId}`);

    res.json({
      success: true,
      data: result.rows[0].settings_data,
      updated_at: result.rows[0].updated_at,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// Update specific settings section (optional auth for development)
router.patch('/:section', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1;
    const { section } = req.params;
    const sectionData = req.body;

    // First, get current settings
    const currentResult = await pool.query(
      'SELECT settings_data FROM settings WHERE company_id = $1',
      [companyId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Settings not found'
      });
    }

    const currentSettings = currentResult.rows[0].settings_data;
    currentSettings[section] = sectionData;

    // Update with merged settings
    const result = await pool.query(
      `UPDATE settings
       SET settings_data = $1,
           updated_by = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $3
       RETURNING settings_data, updated_at`,
      [JSON.stringify(currentSettings), req.user?.email || 'system', companyId]
    );

    await invalidateCache(`settings:company:${companyId}`);

    res.json({
      success: true,
      data: result.rows[0].settings_data,
      updated_at: result.rows[0].updated_at,
      message: `${section} settings updated successfully`
    });
  } catch (error) {
    console.error('Error updating settings section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings section'
    });
  }
});

// Reset settings to default (optional auth for development)
router.post('/reset', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1;

    await pool.query(
      'DELETE FROM settings WHERE company_id = $1',
      [companyId]
    );

    await invalidateCache(`settings:company:${companyId}`);

    res.json({
      success: true,
      message: 'Settings reset to default successfully'
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset settings'
    });
  }
});

// ── Email Config ──
// نخزن إعدادات SMTP في env أو في جدول settings كـ JSONB
// نستخدم متغيرات البيئة كمصدر حقيقي، الصفحة تكتب مباشرة للـ .env عبر الذاكرة

const nodemailer = require('nodemailer');

// GET /api/settings/email-config — يعيد الإعدادات (بدون الـ password)
router.get('/email-config', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT settings_data->'smtp' as smtp FROM settings WHERE company_id = 1"
        );
        const smtp = result.rows[0]?.smtp || {};
        res.json({
            host: smtp.host || process.env.SMTP_HOST || '',
            port: parseInt(smtp.port || process.env.SMTP_PORT || '587'),
            secure: smtp.secure || process.env.SMTP_SECURE === 'true',
            user: smtp.user || process.env.SMTP_USER || '',
        });
    } catch (err) {
        console.error('Get email config error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/settings/email-config — يحفظ في قاعدة البيانات
router.put('/email-config', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { host, port, secure, user, pass } = req.body;
    if (!host || !user || !pass) return res.status(400).json({ error: 'بيانات ناقصة' });

    try {
        const smtpConfig = { host, port: port || 587, secure: secure || false, user, pass };

        await pool.query(
            `UPDATE settings
             SET settings_data = jsonb_set(COALESCE(settings_data, '{}'), '{smtp}', $1::jsonb),
                 updated_at = NOW()
             WHERE company_id = 1`,
            [JSON.stringify(smtpConfig)]
        );

        // Update process.env for current session (used by nodemailer elsewhere)
        process.env.SMTP_HOST = host;
        process.env.SMTP_PORT = String(port || 587);
        process.env.SMTP_SECURE = String(secure || false);
        process.env.SMTP_USER = user;
        process.env.SMTP_PASS = pass;

        await invalidateCache('settings:company:1');
        res.json({ success: true });
    } catch (err) {
        console.error('Save email config error:', err);
        res.status(500).json({ error: 'فشل حفظ الإعدادات' });
    }
});

// POST /api/settings/email-config/test — يرسل رسالة اختبار
router.post('/email-config/test', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { host, port, secure, user, pass, to } = req.body;
    if (!host || !user || !pass || !to) return res.status(400).json({ error: 'بيانات ناقصة' });

    try {
        const transporter = nodemailer.createTransport({
            host,
            port: parseInt(port || 587),
            secure: secure === true || secure === 'true',
            auth: { user, pass },
        });

        await transporter.sendMail({
            from: `"${process.env.COMPANY_NAME || 'الوميض'}" <${user}>`,
            to,
            subject: 'اختبار إعدادات البريد — الوميض',
            html: `<div dir="rtl" style="font-family:sans-serif;padding:24px">
                <h2 style="color:#f97316">✅ الاختبار نجح!</h2>
                <p>إعدادات البريد الإلكتروني تعمل بشكل صحيح.</p>
                <p style="color:#999;font-size:12px">تم الإرسال من نظام الوميض لإدارة التوصيل</p>
            </div>`,
        });

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message || 'فشل الإرسال' });
    }
});

module.exports = router;
