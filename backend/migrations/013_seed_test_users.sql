-- Migration: 013 Seed Test Users
-- Adds sample merchant and driver accounts for testing
-- Password for all accounts: 123

-- Merchant test user
INSERT INTO users (id, name, email, password, role_id, store_name, created_at)
SELECT
    'user-merchant-test',
    'تاجر تجريبي',
    'merchant@alwameed.com',
    '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12',
    'merchant',
    'متجر الوميض',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'merchant@alwameed.com');

-- Driver test user
INSERT INTO users (id, name, email, password, role_id, created_at)
SELECT
    'user-driver-test',
    'سائق تجريبي',
    'driver@alwameed.com',
    '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12',
    'driver',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver@alwameed.com');

-- Update role counts
UPDATE roles SET user_count = (SELECT COUNT(*) FROM users WHERE role_id = roles.id);
