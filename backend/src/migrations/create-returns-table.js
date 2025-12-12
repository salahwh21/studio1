const db = require('../config/database');

async function runMigration() {
    try {
        console.log('Creating merchant_return_slips table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS merchant_return_slips (
        id VARCHAR(255) PRIMARY KEY,
        merchant_name VARCHAR(255) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        item_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'ready',
        order_ids TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
