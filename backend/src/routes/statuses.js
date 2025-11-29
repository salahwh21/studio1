const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM statuses ORDER BY id');

    const statuses = result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      icon: row.icon,
      color: row.color,
      isActive: row.is_active,
      reasonCodes: row.reason_codes || [],
      setByRoles: row.set_by_roles || [],
      visibleTo: row.visible_to || { admin: true, driver: true, merchant: true },
      permissions: row.permissions || {},
      flow: row.flow || {},
      triggers: row.triggers || {}
    }));

    res.json(statuses);
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM statuses WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      code: row.code,
      name: row.name,
      icon: row.icon,
      color: row.color,
      isActive: row.is_active,
      reasonCodes: row.reason_codes || [],
      setByRoles: row.set_by_roles || [],
      visibleTo: row.visible_to,
      permissions: row.permissions,
      flow: row.flow,
      triggers: row.triggers
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, [
  body('code').notEmpty().withMessage('Code is required'),
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      code,
      name,
      icon = 'Circle',
      color = '#607D8B',
      isActive = true,
      reasonCodes = [],
      setByRoles = [],
      visibleTo = { admin: true, driver: true, merchant: true },
      permissions = {},
      flow = {},
      triggers = {}
    } = req.body;

    const id = `STS_${Date.now()}`;

    const result = await db.query(
      `INSERT INTO statuses (id, code, name, icon, color, is_active, reason_codes, set_by_roles, visible_to, permissions, flow, triggers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [id, code, name, icon, color, isActive, reasonCodes, setByRoles, visibleTo, permissions, flow, triggers]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      code: row.code,
      name: row.name,
      color: row.color,
      isActive: row.is_active
    });
  } catch (error) {
    console.error('Create status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings = {
      code: 'code',
      name: 'name',
      icon: 'icon',
      color: 'color',
      isActive: 'is_active',
      reasonCodes: 'reason_codes',
      setByRoles: 'set_by_roles',
      visibleTo: 'visible_to',
      permissions: 'permissions',
      flow: 'flow',
      triggers: 'triggers'
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMappings)) {
      if (updates[jsKey] !== undefined) {
        fields.push(`${dbKey} = $${paramIndex++}`);
        values.push(updates[jsKey]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await db.query(
      `UPDATE statuses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      code: row.code,
      name: row.name,
      color: row.color,
      isActive: row.is_active
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const ordersCheck = await db.query(
      'SELECT COUNT(*) FROM orders WHERE status = (SELECT name FROM statuses WHERE id = $1)',
      [req.params.id]
    );
    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete status with associated orders' });
    }

    const result = await db.query('DELETE FROM statuses WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
