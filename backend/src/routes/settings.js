const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all settings (optional auth for development)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1; // Default to company 1
    
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

      return res.json({
        success: true,
        data: insertResult.rows[0].settings_data,
        updated_at: insertResult.rows[0].updated_at
      });
    }

    res.json({
      success: true,
      data: result.rows[0].settings_data,
      updated_at: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// Update all settings (optional auth for development)
router.put('/', optionalAuth, async (req, res) => {
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
router.patch('/:section', optionalAuth, async (req, res) => {
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
router.post('/reset', optionalAuth, async (req, res) => {
  try {
    const companyId = req.user?.company_id || 1;

    await pool.query(
      'DELETE FROM settings WHERE company_id = $1',
      [companyId]
    );

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

module.exports = router;
