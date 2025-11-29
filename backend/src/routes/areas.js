const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/cities', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cities ORDER BY name');
    
    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name
    }));

    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/cities/:cityId/regions', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM regions WHERE city_id = $1 ORDER BY name',
      [req.params.cityId]
    );

    const regions = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      cityId: row.city_id
    }));

    res.json(regions);
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const citiesResult = await db.query('SELECT * FROM cities ORDER BY name');
    const regionsResult = await db.query('SELECT * FROM regions ORDER BY name');

    const cities = citiesResult.rows.map(city => ({
      id: city.id,
      name: city.name,
      regions: regionsResult.rows
        .filter(r => r.city_id === city.id)
        .map(r => ({ id: r.id, name: r.name }))
    }));

    res.json(cities);
  } catch (error) {
    console.error('Get all areas error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/cities', authenticateToken, [
  body('name').notEmpty().withMessage('City name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const id = `CITY_${Date.now()}`;

    const result = await db.query(
      'INSERT INTO cities (id, name) VALUES ($1, $2) RETURNING *',
      [id, name]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name
    });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/regions', authenticateToken, [
  body('name').notEmpty().withMessage('Region name is required'),
  body('cityId').notEmpty().withMessage('City ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, cityId } = req.body;
    const id = `REG_${Date.now()}`;

    const result = await db.query(
      'INSERT INTO regions (id, name, city_id) VALUES ($1, $2, $3) RETURNING *',
      [id, name, cityId]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      cityId: result.rows[0].city_id
    });
  } catch (error) {
    console.error('Create region error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/cities/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM regions WHERE city_id = $1', [req.params.id]);
    
    const result = await db.query('DELETE FROM cities WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/regions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM regions WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    console.error('Delete region error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
