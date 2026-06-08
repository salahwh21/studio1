const db = require('./src/db.js');

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_audit_logs (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        actor_id VARCHAR(50) NOT NULL,
        actor_name VARCHAR(100),
        actor_role VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        outcome VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Audit table created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
