const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { roleId, search, page, limit } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (roleId) {
      whereClause += ` AND role_id = $${paramIndex++}`;
      params.push(roleId);
    }
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR store_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Build query - only add pagination if limit is provided
    let query = `SELECT id, name, email, store_name, role_id, avatar, whatsapp, price_list_id, created_at
       FROM users ${whereClause} ORDER BY created_at DESC`;
    
    if (limit) {
      const offset = page ? parseInt(page) * parseInt(limit) : 0;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(parseInt(limit), offset);
    }

    const result = await db.query(query, params);

    const users = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      storeName: row.store_name,
      roleId: row.role_id,
      avatar: row.avatar,
      whatsapp: row.whatsapp,
      priceListId: row.price_list_id,
      createdAt: row.created_at
    }));

    res.json({ users, totalCount });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/drivers', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, store_name, avatar FROM users WHERE role_id = 'driver' ORDER BY name`
    );

    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      storeName: row.store_name,
      avatar: row.avatar
    })));
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/merchants', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, store_name, avatar, price_list_id FROM users WHERE role_id = 'merchant' ORDER BY store_name, name`
    );

    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      storeName: row.store_name,
      avatar: row.avatar,
      priceListId: row.price_list_id
    })));
  } catch (error) {
    console.error('Get merchants error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, store_name, role_id, avatar, whatsapp, price_list_id 
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      storeName: row.store_name,
      roleId: row.role_id,
      avatar: row.avatar,
      whatsapp: row.whatsapp,
      priceListId: row.price_list_id
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('roleId').notEmpty().withMessage('Role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, roleId, storeName, avatar, whatsapp, priceListId, password = '123' } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role_id, store_name, avatar, whatsapp, price_list_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, email, hashedPassword, roleId, storeName || null, avatar || '', whatsapp || null, priceListId || null]
    );

    await db.query(
      'UPDATE roles SET user_count = user_count + 1 WHERE id = $1',
      [roleId]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      email: row.email,
      storeName: row.store_name,
      roleId: row.role_id
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roleId, storeName, avatar, whatsapp, priceListId, password } = req.body;

    const currentResult = await db.query('SELECT role_id FROM users WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const oldRoleId = currentResult.rows[0].role_id;

    let updateQuery = `
      UPDATE users SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role_id = COALESCE($3, role_id),
        store_name = COALESCE($4, store_name),
        avatar = COALESCE($5, avatar),
        whatsapp = COALESCE($6, whatsapp),
        price_list_id = COALESCE($7, price_list_id),
        updated_at = NOW()
    `;
    let params = [name, email, roleId, storeName, avatar, whatsapp, priceListId];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = $8 WHERE id = $9 RETURNING *`;
      params.push(hashedPassword, id);
    } else {
      updateQuery += ` WHERE id = $8 RETURNING *`;
      params.push(id);
    }

    const result = await db.query(updateQuery, params);

    if (roleId && roleId !== oldRoleId) {
      await db.query('UPDATE roles SET user_count = user_count - 1 WHERE id = $1', [oldRoleId]);
      await db.query('UPDATE roles SET user_count = user_count + 1 WHERE id = $1', [roleId]);
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      storeName: row.store_name,
      roleId: row.role_id
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const currentResult = await db.query('SELECT role_id FROM users WHERE id = $1', [req.params.id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const roleId = currentResult.rows[0].role_id;

    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await db.query('UPDATE roles SET user_count = user_count - 1 WHERE id = $1', [roleId]);

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk-delete', authenticateToken, [
  body('userIds').isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const { userIds } = req.body;

    const usersResult = await db.query('SELECT id, role_id FROM users WHERE id = ANY($1)', [userIds]);
    
    await db.query('BEGIN');

    for (const user of usersResult.rows) {
      await db.query('UPDATE roles SET user_count = user_count - 1 WHERE id = $1', [user.role_id]);
    }

    await db.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);

    await db.query('COMMIT');

    res.json({ deleted: usersResult.rows.length });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Bulk delete users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
