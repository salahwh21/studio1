-- Migration: 016 Add order_number sequence
-- Replaces MAX(order_number)+1 pattern to prevent race conditions

-- Create sequence starting from current max
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(order_number), 0) INTO max_num FROM orders;
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH %s', max_num + 1);
END $$;
