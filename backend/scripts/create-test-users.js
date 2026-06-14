const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const hash = await bcrypt.hash('123', 10);
  console.log('Hash generated:', hash);

  const client = await pool.connect();
  try {
    // Merchant
    await client.query(`
      INSERT INTO users (id, name, email, password, role_id, store_name)
      VALUES ('user-merchant-test', 'تاجر تجريبي', 'merchant@alwameed.com', $1, 'merchant', 'متجر الوميض')
      ON CONFLICT (email) DO UPDATE SET password = $1, role_id = 'merchant'
    `, [hash]);
    console.log('✅ merchant@alwameed.com — password: 123');

    // Driver
    await client.query(`
      INSERT INTO users (id, name, email, password, role_id)
      VALUES ('user-driver-test', 'سائق تجريبي', 'driver@alwameed.com', $1, 'driver')
      ON CONFLICT (email) DO UPDATE SET password = $1, role_id = 'driver'
    `, [hash]);
    console.log('✅ driver@alwameed.com — password: 123');

    // Verify
    const result = await client.query(
      `SELECT email, role_id FROM users WHERE email IN ('merchant@alwameed.com', 'driver@alwameed.com', 'admin@alwameed.com')`
    );
    console.log('\nUsers in DB:');
    result.rows.forEach(r => console.log(' -', r.email, '→', r.role_id));

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
