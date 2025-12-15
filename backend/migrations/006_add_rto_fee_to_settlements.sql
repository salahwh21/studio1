-- Migration: 006 Seed RTO fee values into settlements (idempotent)
-- Date: 2025-12-12

-- Ensure rto_fee column exists (safety if migration order changed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='order_settlements' AND column_name='rto_fee'
  ) THEN
    ALTER TABLE order_settlements ADD COLUMN rto_fee DECIMAL(12,2) DEFAULT 0;
  END IF;
END$$;

-- Pre-compute RTO fee for existing settlements based on return statuses
UPDATE order_settlements os
SET rto_fee = COALESCE(o.delivery_fee, 0) + COALESCE(o.additional_cost, 0),
    company_share = company_share - (COALESCE(o.delivery_fee, 0) + COALESCE(o.additional_cost, 0)),
    updated_at = NOW()
FROM orders o
WHERE os.order_id = o.id
  AND o.status IN ('RETURNED', 'مرتجع', 'BRANCH_RETURNED', 'مرجع للفرع', 'MERCHANT_RETURNED', 'مرجع للتاجر');

