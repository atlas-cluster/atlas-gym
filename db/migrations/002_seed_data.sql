-- Migration: 002
-- Description: Seed initial data with demo user

SET search_path TO gym_manager;

-- Insert demo user
INSERT INTO users (
    user_email,
    password_hash,
    user_firstname,
    user_lastname,
    user_middlename,
    user_birthdate,
    user_address,
    user_phone
) VALUES (
    'admin@admin.com',
    '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK', -- admin
    'Demo',
    'User',
    NULL,
    '1990-01-01',
    '123 Demo Street, Atlas City',
    '+1234567890'
) ON CONFLICT (user_email) DO NOTHING;

-- Insert payment method for demo user
INSERT INTO payment_methods (
    user_id,
    payment_type,
    card_number,
    card_expiry
)
SELECT 
    id,
    'credit_card',
    '5469238897741608',
    '12/2025'
FROM users 
WHERE user_email = 'admin@admin.com'
ON CONFLICT DO NOTHING;
