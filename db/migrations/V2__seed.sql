-- Seed data for testing

-- Insert test user
INSERT INTO gym_manager.users (
    email,
    password_hash,
    firstname,
    lastname,
    middlename,
    birthdate,
    address,
    phone
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
WITH new_pm AS (
    INSERT INTO gym_manager.payment_methods (user_id, type)
    VALUES ((SELECT id FROM gym_manager.users WHERE email = 'admin'), 'credit_card')
    RETURNING id
)
INSERT INTO gym_manager.credit_cards (payment_method_id, card_number, card_holder, card_expiry, card_cvc)
SELECT id, '4000000000000000', 'Demo User', '12/25', '123' FROM new_pm;

-- Insert trainer for test user
INSERT INTO gym_manager.trainers (
    user_id
) VALUES (
             (SELECT id FROM gym_manager.users WHERE email = 'admin')
         );

-- Insert regular user (not a trainer)
INSERT INTO gym_manager.users (
    email,
    password_hash,
    firstname,
    lastname,
    middlename,
    birthdate,
    address,
    phone
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
WITH new_pm_user AS (
    INSERT INTO gym_manager.payment_methods (user_id, type)
    VALUES ((SELECT id FROM gym_manager.users WHERE email = 'user'), 'credit_card')
    RETURNING id
)
INSERT INTO gym_manager.credit_cards (payment_method_id, card_number, card_holder, card_expiry, card_cvc)
SELECT id, '4111111111111111', 'Regular Member', '12/28', '456' FROM new_pm_user;
