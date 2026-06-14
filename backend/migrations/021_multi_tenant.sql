-- =============================================
-- Multi-tenant support
-- =============================================

-- Companies/Tenants table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#F96941',
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    plan VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    max_orders_per_month INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) DEFAULT 1;

-- Add company_id to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) DEFAULT 1;

-- Add company_id to areas if not exists
ALTER TABLE areas ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) DEFAULT 1;

-- Add company_id to drivers if not exists
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) DEFAULT 1;

-- Create indexes for tenant isolation
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_areas_company_id ON areas(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON drivers(company_id);

-- Insert default company if not exists
INSERT INTO companies (id, name, slug, email)
VALUES (1, 'الوميض', 'alwameed', 'admin@alwameed.com')
ON CONFLICT (id) DO NOTHING;

-- Update sequence
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- Company admins (super users who can manage multiple companies)
CREATE TABLE IF NOT EXISTS super_admins (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
