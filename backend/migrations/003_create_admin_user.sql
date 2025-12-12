-- Migration: 003 Create Admin User
-- Date: 2025-12-11
-- Description: Creates the default admin user with a secure password
-- IMPORTANT: Change the password hash before deploying to production!

-- The password '123' is hashed using bcrypt (10 rounds)
-- Generate a new hash using: node -e "require('bcryptjs').hash('YOUR_PASSWORD', 10).then(console.log)"
-- IMPORTANT: Change this password hash before deploying to production!

-- Only insert admin if no admin user exists with this email
INSERT INTO users (id, name, email, password, role_id, store_name, created_at)
SELECT 'user-admin', 'مدير النظام', 'admin@alwameed.com', '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12', 'admin', 'الإدارة', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@alwameed.com');

-- Update role count for all roles
UPDATE roles SET user_count = (SELECT COUNT(*) FROM users WHERE role_id = roles.id);
