const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgresql://postgres:Sbreen$1967@localhost:5432/delivery_db' });

async function inspectDb() {
    try {
        let output = '📦 الجداول الموجودة في قاعدة البيانات:\n\n';

        // 1. Get all tables
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        for (const row of tablesRes.rows) {
            const tableName = row.table_name;

            // 2. Get columns for each table
            const colsRes = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 
                ORDER BY ordinal_position
            `, [tableName]);

            // 3. Get row count
            const countRes = await pool.query(`SELECT count(*) FROM "${tableName}"`);
            const count = countRes.rows[0].count;

            output += `🔹 جدول: ${tableName} (${count} سجل)\n`;
            output += `   الأعمدة: ${colsRes.rows.map(c => c.column_name).join(', ')}\n`;
            output += '--------------------------------------------------\n';
        }

        fs.writeFileSync('db_summary.txt', output);
        console.log('Done writing to db_summary.txt');

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

inspectDb();
