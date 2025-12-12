/**
 * Migration Runner with Version Tracking
 * 
 * This script runs SQL migrations in order and tracks which ones have been applied.
 * It creates a `schema_migrations` table to store applied migration versions.
 * 
 * Usage:
 *   npm run migrate           - Run all pending migrations
 *   npm run migrate:status    - Show migration status
 *   npm run migrate:reset     - Drop all tables and re-run migrations (DANGEROUS!)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Migration files to run in order
const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_seed_data.sql',
  '003_create_admin_user.sql',
  '004_create_settings_table.sql',
  '005_add_orders_indexes.sql'
];

/**
 * Create the schema_migrations table if it doesn't exist
 */
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      checksum VARCHAR(64)
    );
  `);
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(client) {
  const result = await client.query('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map(row => row.version);
}

/**
 * Calculate simple checksum for a file
 */
function getFileChecksum(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Run a single migration file
 */
async function runMigration(client, filename) {
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Migration file not found: ${filename} (skipping)`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const checksum = getFileChecksum(sql);

  console.log(`📦 Running migration: ${filename}`);

  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING',
      [filename, checksum]
    );
    console.log(`✅ Migration applied: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migration...\n');

    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    console.log(`📋 Already applied: ${applied.length} migrations`);

    let newMigrations = 0;

    for (const migration of MIGRATIONS) {
      if (!applied.includes(migration)) {
        await runMigration(client, migration);
        newMigrations++;
      } else {
        console.log(`⏭️  Skipping (already applied): ${migration}`);
      }
    }

    console.log(`\n✨ Migration complete! ${newMigrations} new migrations applied.`);

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Show migration status
 */
async function status() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    console.log('\n📊 Migration Status:\n');
    console.log('─'.repeat(60));

    for (const migration of MIGRATIONS) {
      const isApplied = applied.includes(migration);
      const status = isApplied ? '✅ Applied' : '⏳ Pending';
      console.log(`${status}  ${migration}`);
    }

    console.log('─'.repeat(60));
    console.log(`\nTotal: ${applied.length}/${MIGRATIONS.length} applied\n`);

  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Reset database (DANGEROUS!)
 */
async function reset() {
  const client = await pool.connect();

  try {
    console.log('⚠️  WARNING: This will DROP ALL TABLES!\n');
    console.log('Dropping all tables...');

    // Drop all tables in reverse order
    const tables = [
      'schema_migrations',
      'order_tracking',
      'drivers',
      'driver_return_slips',
      'merchant_return_slips',
      'driver_payment_slips',
      'merchant_payment_slips',
      'orders',
      'regions',
      'cities',
      'statuses',
      'settings',
      'users',
      'roles'
    ];

    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`  Dropped: ${table}`);
    }

    console.log('\n🔄 Re-running all migrations...\n');

    // Re-run migrations
    await ensureMigrationsTable(client);

    for (const migration of MIGRATIONS) {
      await runMigration(client, migration);
    }

    console.log('\n✨ Database reset complete!');

  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'status':
    status();
    break;
  case 'reset':
    reset();
    break;
  default:
    migrate();
}
