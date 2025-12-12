-- Performance optimization indexes
-- Run this to improve query performance

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);
CREATE INDEX IF NOT EXISTS idx_orders_region ON orders(region);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, date);
CREATE INDEX IF NOT EXISTS idx_orders_driver_status ON orders(driver, status);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant, status);

-- Users table indexes (already exist but let's ensure)
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Analyze tables for better query planning
ANALYZE orders;
ANALYZE users;
ANALYZE roles;

-- Vacuum to reclaim storage and update statistics
VACUUM ANALYZE orders;
VACUUM ANALYZE users;
