const { Pool } = require('pg');
require('dotenv').config();

const sslConfig = () => {
  const dbUrl = process.env.DATABASE_URL || '';

  if (process.env.DATABASE_SSL === 'false') return false;

  if (dbUrl.includes('sslmode=verify-full') || dbUrl.includes('sslmode=verify-ca')) {
    return { rejectUnauthorized: true };
  }

  if (dbUrl.includes('sslmode=require') || dbUrl.includes('sslmode=prefer')) {
    return { rejectUnauthorized: false };
  }

  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }

  return false;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig(),
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: false,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
