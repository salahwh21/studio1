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
  '004_create_settings_table.sql'
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
 * Split SQL content into individual statements
 * Handles semicolons, but preserves them in string literals and comments
 */
function splitSQLStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = null;
  let inComment = false;
  let commentType = null; // '--' or '/*'
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';
    const prevChar = sql[i - 1] || '';
    
    // Handle string literals
    if (!inComment && (char === "'" || char === '"')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = null;
      }
      currentStatement += char;
      continue;
    }
    
    // Handle comments
    if (!inString) {
      // Single-line comment
      if (char === '-' && nextChar === '-') {
        inComment = true;
        commentType = '--';
        currentStatement += char;
        continue;
      }
      
      // Multi-line comment start
      if (char === '/' && nextChar === '*') {
        inComment = true;
        commentType = '/*';
        currentStatement += char;
        continue;
      }
      
      // Multi-line comment end
      if (inComment && commentType === '/*' && char === '*' && nextChar === '/') {
        inComment = false;
        commentType = null;
        currentStatement += char;
        continue;
      }
      
      // End of single-line comment (newline)
      if (inComment && commentType === '--' && char === '\n') {
        inComment = false;
        commentType = null;
      }
    }
    
    // If we're in a comment, just add the character
    if (inComment) {
      currentStatement += char;
      continue;
    }
    
    // Check for statement delimiter (semicolon not in string or comment)
    if (!inString && !inComment && char === ';') {
      currentStatement += char;
      const trimmed = currentStatement.trim();
      if (trimmed && trimmed !== ';') {
        statements.push(trimmed);
      }
      currentStatement = '';
      continue;
    }
    
    currentStatement += char;
  }
  
  // Add remaining statement if any
  const trimmed = currentStatement.trim();
  if (trimmed && trimmed !== ';') {
    statements.push(trimmed);
  }
  
  return statements.filter(stmt => stmt.length > 0);
}

/**
 * Run a single migration file
 */
async function runMigration(client, filename) {
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    const error = new Error(`Migration file not found: ${filename}`);
    console.error(`❌ ${error.message}`);
    console.error(`   Expected path: ${filePath}`);
    throw error;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const checksum = getFileChecksum(sql);

  console.log(`📦 Running migration: ${filename}`);

    try {
    // Split SQL into individual statements
    const statements = splitSQLStatements(sql);
    
    if (statements.length === 0) {
      console.warn(`⚠️  No SQL statements found in ${filename}`);
      return true;
    }
    
    // Execute each statement individually within a transaction
    await client.query('BEGIN');
    
    try {
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        // Skip empty statements or statements that are only comments/whitespace
        if (statement && !statement.match(/^[\s-]*$/)) {
          await client.query(statement);
        }
      }
      
      // Record migration as applied
      await client.query(
        'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING',
        [filename, checksum]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Migration applied: ${filename} (${statements.length} statement(s))`);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`   Error: ${error.message}`);
    if (error.position) {
      console.error(`   Position: ${error.position}`);
    }
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
        const success = await runMigration(client, migration);
        if (success) {
          newMigrations++;
        }
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

    let missingFiles = 0;

    for (const migration of MIGRATIONS) {
      const filePath = path.join(__dirname, migration);
      const fileExists = fs.existsSync(filePath);
      const isApplied = applied.includes(migration);
      
      if (!fileExists) {
        console.log(`❌ Missing  ${migration}`);
        missingFiles++;
      } else {
        const status = isApplied ? '✅ Applied' : '⏳ Pending';
        console.log(`${status}  ${migration}`);
      }
    }

    console.log('─'.repeat(60));
    console.log(`\nTotal: ${applied.length}/${MIGRATIONS.length} applied`);
    
    if (missingFiles > 0) {
      console.log(`⚠️  Warning: ${missingFiles} migration file(s) are missing!\n`);
      process.exit(1);
    } else {
      console.log('');
    }

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
      // Use proper identifier quoting for table names (PostgreSQL identifiers)
      // Note: DDL statements don't support parameterized queries, but we quote identifiers
      // to prevent issues with special characters or reserved words
      const quotedTable = `"${table.replace(/"/g, '""')}"`;
      await client.query(`DROP TABLE IF EXISTS ${quotedTable} CASCADE`);
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

(async () => {
  try {
    switch (command) {
      case 'status':
        await status();
        break;
      case 'reset':
        await reset();
        break;
      default:
        await migrate();
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
