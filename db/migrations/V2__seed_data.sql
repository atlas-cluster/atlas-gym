-- Seed data for testing

-- Insert test user
INSERT INTO gym_manager.users (
    user_email,
    password_hash,
    user_firstname,
    user_lastname,
    user_middlename,
    user_birthdate,
    user_address,
    user_phone
) VALUES (
             'admin',
             '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK', -- admin
             'Demo',
             'User',
             NULL,
             '1990-01-01',
             '123 Demo Street, Atlas City',
             '+1234567890'
         );

-- Insert payment method for test user
INSERT INTO gym_manager.payment_methods (
    user_id,
    payment_type,
    card_number,
    card_expiry
) VALUES (
             (SELECT id FROM gym_manager.users WHERE user_email = 'admin'),
             'credit_card',
             '4000000000000000',
             '12/2025'
         );

-- Insert trainer for test user
INSERT INTO gym_manager.trainers (
    user_id
) VALUES (
    (SELECT id FROM gym_manager.users WHERE user_email = 'admin')
);

-- Insert regular user (not a trainer)
INSERT INTO gym_manager.users (
    user_email,
    password_hash,
    user_firstname,
    user_lastname,
    user_middlename,
    user_birthdate,
    user_address,
    user_phone
) VALUES (
             'user',
             '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK', -- admin
             'Regular',
             'Member',
             NULL,
             '1995-05-15',
             '456 Regular Road, Atlas City',
             '+0987654321'
         );

-- Insert payment method for regular user
INSERT INTO gym_manager.payment_methods (
    user_id,
    payment_type,
    card_number,
    card_expiry
) VALUES (
             (SELECT id FROM gym_manager.users WHERE user_email = 'user'),
             'credit_card',
             '4111111111111111',
             '10/2026'
         );
