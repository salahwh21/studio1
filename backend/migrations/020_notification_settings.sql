-- Add success column to notification_logs if not exists
ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_order_created ON notification_logs(order_id, created_at DESC);
