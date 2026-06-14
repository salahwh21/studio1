CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
  channel VARCHAR(50) DEFAULT 'whatsapp',
  sent_by VARCHAR(255),
  phone VARCHAR(50),
  message_preview TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
