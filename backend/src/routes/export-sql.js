const express = require('express');
const router = express.Router();
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Helper to format values for SQL
const formatValue = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (val instanceof Date) return `'${val.toISOString()}'`;
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    // Escape single quotes for SQL text
    return `'${String(val).replace(/'/g, "''")}'`;
};

const generateInsert = (tableName, rows) => {
    if (!rows || rows.length === 0) return '';

    const columns = Object.keys(rows[0]);
    const cleanColumns = columns.map(c => `"${c}"`).join(', '); // Quote identifiers

    let sql = `-- Data for ${tableName} (${rows.length} rows)\n`;

    rows.forEach(row => {
        const values = columns.map(col => formatValue(row[col])).join(', ');
        sql += `INSERT INTO "${tableName}" (${cleanColumns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
    });

    return sql + '\n';
};

router.get('/', async (req, res) => {
    try {
        let sqlDump = `-- Database Export for Delivery System\n-- Generated at: ${new Date().toISOString()}\n\n`;

        // 1. Users & Roles (Essential)
        const roles = await db.query('SELECT * FROM roles');
        sqlDump += generateInsert('roles', roles.rows);

        const users = await db.query('SELECT * FROM users');
        sqlDump += generateInsert('users', users.rows);

        // 2. Settings & Templates
        const settings = await db.query('SELECT * FROM settings');
        sqlDump += generateInsert('settings', settings.rows);

        const templates = await db.query('SELECT * FROM templates');
        sqlDump += generateInsert('templates', templates.rows);

        // 3. Orders (The Core Data)
        const orders = await db.query('SELECT * FROM orders ORDER BY created_at ASC');
        sqlDump += generateInsert('orders', orders.rows);

        // 4. Areas (If customized)
        const areas = await db.query('SELECT * FROM areas');
        sqlDump += generateInsert('areas', areas.rows);

        // Set Headers for Download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_full_${timestamp}.sql`;

        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(sqlDump);

    } catch (error) {
        console.error('Export SQL Error:', error);
        res.status(500).send('-- Error generating backup');
    }
});

module.exports = router;
