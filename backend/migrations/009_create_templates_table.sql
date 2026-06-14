-- Migration: 009 Create Templates Table
-- Date: 2025-12-29
-- Description: جدول حفظ قوالب البوالص والتقارير

-- =============================================
-- TABLE: templates
-- =============================================
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    html TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES: Performance optimization
-- =============================================
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);

-- =============================================
-- TRIGGER: Auto-update timestamp
-- =============================================
DROP TRIGGER IF EXISTS templates_updated_at_trigger ON templates;
CREATE TRIGGER templates_updated_at_trigger
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS: Documentation
-- =============================================
COMMENT ON TABLE templates IS 'Stores user-defined templates for policies, reports, and tables';
COMMENT ON COLUMN templates.settings IS 'JSONB storing template configuration like fonts, colors, fields, etc.';
COMMENT ON COLUMN templates.html IS 'Generated HTML content of the template';
