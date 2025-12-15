-- Migration: Add Performance Indexes for Orders Table
-- Date: 2025-12-07
-- Description: Adds indexes to improve query performance on frequently filtered/sorted columns

-- Index for status filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for date filtering and sorting
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);

-- Index for created_at sorting (default sort)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Index for driver filtering
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver);

-- Index for merchant filtering
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant);

-- Composite index for common query patterns (status + date)
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, date DESC);

-- Index for search on phone (partial match optimization)
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- Index for order_number lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Analyze tables to update statistics for query planner
ANALYZE orders;
