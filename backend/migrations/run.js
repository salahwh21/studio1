const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  store_name VARCHAR(255),
  role_id VARCHAR(100) NOT NULL,
  avatar TEXT DEFAULT '',
  whatsapp VARCHAR(50),
  price_list_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_count INTEGER DEFAULT 0,
  permissions TEXT[] DEFAULT '{}'
);

-- Statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100) DEFAULT 'Circle',
  color VARCHAR(20) DEFAULT '#607D8B',
  is_active BOOLEAN DEFAULT true,
  reason_codes TEXT[] DEFAULT '{}',
  set_by_roles TEXT[] DEFAULT '{}',
  visible_to JSONB DEFAULT '{"admin": true, "driver": true, "merchant": true}',
  permissions JSONB DEFAULT '{}',
  flow JSONB DEFAULT '{}',
  triggers JSONB DEFAULT '{}'
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id VARCHAR(100) REFERENCES cities(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number INTEGER NOT NULL,
  source VARCHAR(50) DEFAULT 'Manual',
  reference_number VARCHAR(255),
  recipient VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(255),
  status VARCHAR(100) DEFAULT 'بالانتظار',
  previous_status VARCHAR(100) DEFAULT '',
  driver VARCHAR(255),
  merchant VARCHAR(255),
  cod DECIMAL(10, 2) DEFAULT 0,
  item_price DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 1.5,
  additional_cost DECIMAL(10, 2) DEFAULT 0,
  driver_fee DECIMAL(10, 2) DEFAULT 1.0,
  driver_additional_fare DECIMAL(10, 2) DEFAULT 0,
  date DATE,
  notes TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver payment slips table
CREATE TABLE IF NOT EXISTS driver_payment_slips (
  id VARCHAR(100) PRIMARY KEY,
  driver_name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  item_count INTEGER DEFAULT 0,
  order_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant payment slips table
CREATE TABLE IF NOT EXISTS merchant_payment_slips (
  id VARCHAR(100) PRIMARY KEY,
  merchant_name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  item_count INTEGER DEFAULT 0,
  status VARCHAR(100) DEFAULT 'جاهز للتسليم',
  order_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver return slips table
CREATE TABLE IF NOT EXISTS driver_return_slips (
  id VARCHAR(100) PRIMARY KEY,
  driver_name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  item_count INTEGER DEFAULT 0,
  order_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant return slips table
CREATE TABLE IF NOT EXISTS merchant_return_slips (
  id VARCHAR(100) PRIMARY KEY,
  merchant VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  items INTEGER DEFAULT 0,
  status VARCHAR(100) DEFAULT 'جاهز للتسليم',
  order_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_regions_city_id ON regions(city_id);
`;

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running database migration...');
    await client.query(schema);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
