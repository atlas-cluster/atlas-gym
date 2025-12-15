-- Sample user for local development
-- Email: demo@atlas.gym
-- Password: password123
INSERT INTO gym_manager.users (
    user_email,
    password_hash,
    user_firstname,
    user_lastname,
    user_middlename,
    user_birthdate,
    user_address,
    user_phone,
    payment_type,
    payment_info
) VALUES (
    'demo@atlas.gym',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    'Demo',
    'User',
    NULL,
    '1990-01-01',
    '123 Demo Street, Atlas City',
    '+1234567890',
    'credit_card',
    '4111 1111 1111 1111'
);

