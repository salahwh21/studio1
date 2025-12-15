-- Migration: 005 Order Settlements
-- Date: 2025-12-12
-- Adds per-order settlement record to track company/driver/merchant shares and settlement status

CREATE TABLE IF NOT EXISTS order_settlements (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    cod_collected DECIMAL(12,2) DEFAULT 0,
    company_share DECIMAL(12,2) DEFAULT 0,
    driver_share DECIMAL(12,2) DEFAULT 0,
    merchant_share DECIMAL(12,2) DEFAULT 0,
    rto_fee DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending | settled
    settled_at TIMESTAMP,
    settled_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_settlements_status ON order_settlements(status);
CREATE INDEX IF NOT EXISTS idx_order_settlements_order_id ON order_settlements(order_id);

