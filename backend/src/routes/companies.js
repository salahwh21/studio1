const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/companies — list all companies (super admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if super admin
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const result = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM users WHERE company_id = c.id) as users_count,
        (SELECT COUNT(*) FROM orders WHERE company_id = c.id) as orders_count
       FROM companies c
       ORDER BY c.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/current — get current company info
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const companyId = req.companyId || req.user?.company_id || 1;

    const result = await db.query(
      `SELECT id, name, slug, logo_url, primary_color, phone, email, address, plan,
        max_users, max_orders_per_month
       FROM companies WHERE id = $1`,
      [companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/companies — create new company (super admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { name, slug, email, phone, plan = 'basic', max_users = 10, max_orders_per_month = 1000 } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    // Check slug uniqueness
    const existing = await db.query('SELECT id FROM companies WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const result = await db.query(
      `INSERT INTO companies (name, slug, email, phone, plan, max_users, max_orders_per_month)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, slug, email, phone, plan, max_users, max_orders_per_month]
    );

    // Create default admin user for the company
    const companyId = result.rows[0].id;
    const adminEmail = email || `admin@${slug}.com`;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.query(
      `INSERT INTO users (id, name, email, password, role_id, company_id)
       VALUES ($1, $2, $3, $4, 'admin', $5)`,
      [`${slug}-admin`, `مدير ${name}`, adminEmail, hashedPassword, companyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/companies/:id — update company
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Allow super admin or company admin
    if (!req.user?.is_super_admin && req.user?.company_id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, logo_url, primary_color, phone, email, address, plan, max_users, max_orders_per_month } = req.body;

    const result = await db.query(
      `UPDATE companies SET
        name = COALESCE($1, name),
        logo_url = COALESCE($2, logo_url),
        primary_color = COALESCE($3, primary_color),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        address = COALESCE($6, address),
        plan = COALESCE($7, plan),
        max_users = COALESCE($8, max_users),
        max_orders_per_month = COALESCE($9, max_orders_per_month),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, logo_url, primary_color, phone, email, address, plan, max_users, max_orders_per_month, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/companies/:id — deactivate company (super admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { id } = req.params;

    // Don't delete, just deactivate
    await db.query('UPDATE companies SET is_active = false WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
