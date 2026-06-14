-- Production indexes for 500+ orders/day workload
-- Covers: search, filtering, pagination, financial queries

-- Composite index for common filter+sort pattern (status filter with date sort)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

-- Composite index for driver-scoped queries (driver portal)
CREATE INDEX IF NOT EXISTS idx_orders_driver_status ON orders(driver, status);

-- Composite index for merchant-scoped queries (merchant portal)
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant, status);

-- Date range filter (common in reports)
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(date, status);

-- Settlement status join optimization
CREATE INDEX IF NOT EXISTS idx_order_settlements_order_id_status ON order_settlements(order_id, status);

-- Search optimization: trigram index for ILIKE queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_orders_recipient_trgm ON orders USING gin(recipient gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_phone_trgm ON orders USING gin(phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_reference_number_trgm ON orders USING gin(reference_number gin_trgm_ops);

-- Financial queries: driver payments
CREATE INDEX IF NOT EXISTS idx_orders_driver_status_delivery ON orders(driver, status) WHERE status = 'تم التوصيل';

