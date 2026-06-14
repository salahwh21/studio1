-- Migration: 015 Fix test users (correct column names, no phone column)
-- bcrypt hash of '123' with 10 rounds

INSERT INTO users (id, name, email, password, role_id, store_name, created_at)
VALUES (
    'user-merchant-test',
    'تاجر تجريبي',
    'merchant@alwameed.com',
    '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12',
    'merchant',
    'متجر الوميض',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password   = '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12',
    role_id    = 'merchant',
    store_name = 'متجر الوميض';

INSERT INTO users (id, name, email, password, role_id, created_at)
VALUES (
    'user-driver-test',
    'سائق تجريبي',
    'driver@alwameed.com',
    '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12',
    'driver',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12',
    role_id  = 'driver';

UPDATE users
SET password = '$2a$10$1iEieX6R5Joa/4t4nckcyuDQzjDDUcTBneiF150ROsjwJIY2MoG12'
WHERE email = 'admin@alwameed.com';

UPDATE roles SET user_count = (SELECT COUNT(*) FROM users WHERE role_id = roles.id);
