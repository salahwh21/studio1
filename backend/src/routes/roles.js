const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM roles ORDER BY name'
    );

    const roles = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      userCount: row.user_count,
      permissions: row.permissions || []
    }));

    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM roles WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      description: row.description,
      userCount: row.user_count,
      permissions: row.permissions || []
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, permissions = [] } = req.body;
    const id = name.toLowerCase().replace(/\s+/g, '-');

    const existing = await db.query('SELECT id FROM roles WHERE id = $1', [id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    const result = await db.query(
      `INSERT INTO roles (id, name, description, permissions, user_count)
       VALUES ($1, $2, $3, $4, 0) RETURNING *`,
      [id, name, description || '', permissions]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      description: row.description,
      userCount: row.user_count,
      permissions: row.permissions
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE roles SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id = $3 RETURNING *`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      description: row.description,
      userCount: row.user_count,
      permissions: row.permissions
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/permissions', authenticateToken, [
  body('permissions').isArray().withMessage('Permissions must be an array')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const result = await db.query(
      `UPDATE roles SET permissions = $1 WHERE id = $2 RETURNING *`,
      [permissions, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      permissions: row.permissions
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const usersCheck = await db.query('SELECT COUNT(*) FROM users WHERE role_id = $1', [req.params.id]);
    if (parseInt(usersCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete role with assigned users' });
    }

    const result = await db.query('DELETE FROM roles WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
