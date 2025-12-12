-- Migration: 001 Initial Schema
-- Date: 2025-12-11
-- Description: Complete initial database schema for the Delivery Platform

-- =============================================
-- EXTENSION: UUID (optional, for future use)
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_count INTEGER DEFAULT 0,
    permissions TEXT[] DEFAULT '{}'
);

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    store_name VARCHAR(255),
    role_id VARCHAR(100) NOT NULL REFERENCES roles(id),
    avatar TEXT DEFAULT '',
    whatsapp VARCHAR(50),
    price_list_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: statuses
-- =============================================
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

-- =============================================
-- TABLE: cities
-- =============================================
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- =============================================
-- TABLE: regions
-- =============================================
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id VARCHAR(100) REFERENCES cities(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: orders
-- =============================================
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

-- =============================================
-- TABLE: drivers (for real-time tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
    is_online BOOLEAN DEFAULT false,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: order_tracking (GPS history)
-- =============================================
CREATE TABLE IF NOT EXISTS order_tracking (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    driver_latitude DECIMAL(10, 8),
    driver_longitude DECIMAL(11, 8),
    status VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: driver_payment_slips
-- =============================================
CREATE TABLE IF NOT EXISTS driver_payment_slips (
    id VARCHAR(100) PRIMARY KEY,
    driver_name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    item_count INTEGER DEFAULT 0,
    order_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: merchant_payment_slips
-- =============================================
CREATE TABLE IF NOT EXISTS merchant_payment_slips (
    id VARCHAR(100) PRIMARY KEY,
    merchant_name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    item_count INTEGER DEFAULT 0,
    status VARCHAR(100) DEFAULT 'جاهز للتسليم',
    order_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: driver_return_slips
-- =============================================
CREATE TABLE IF NOT EXISTS driver_return_slips (
    id VARCHAR(100) PRIMARY KEY,
    driver_name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    item_count INTEGER DEFAULT 0,
    order_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: merchant_return_slips
-- =============================================
CREATE TABLE IF NOT EXISTS merchant_return_slips (
    id VARCHAR(100) PRIMARY KEY,
    merchant VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    items INTEGER DEFAULT 0,
    status VARCHAR(100) DEFAULT 'جاهز للتسليم',
    order_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: settings (application configuration)
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER DEFAULT 1 UNIQUE,
    settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- =============================================
-- INDEXES: Performance optimization
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Regions indexes
CREATE INDEX IF NOT EXISTS idx_regions_city_id ON regions(city_id);

-- Orders indexes (critical for performance)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_company_id ON settings(company_id);
CREATE INDEX IF NOT EXISTS idx_settings_data ON settings USING GIN (settings_data);

-- Order tracking indexes
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_recorded_at ON order_tracking(recorded_at DESC);

-- =============================================
-- TRIGGERS: Auto-update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders
DROP TRIGGER IF EXISTS orders_updated_at_trigger ON orders;
CREATE TRIGGER orders_updated_at_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users
DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to settings
DROP TRIGGER IF EXISTS settings_updated_at_trigger ON settings;
CREATE TRIGGER settings_updated_at_trigger
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS: Documentation
-- =============================================
COMMENT ON TABLE orders IS 'Main orders table for delivery tracking';
COMMENT ON TABLE drivers IS 'Driver real-time location and status';
COMMENT ON TABLE order_tracking IS 'GPS tracking history for orders';
COMMENT ON TABLE settings IS 'Application-wide settings stored as JSONB';
