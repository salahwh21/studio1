const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const sqlFile = path.join(__dirname, 'migrations', '004_create_settings_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🔄 Running migration: 004_create_settings_table.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
