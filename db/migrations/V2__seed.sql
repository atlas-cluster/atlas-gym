-- Seed data for testing

-- Insert test member
INSERT INTO gym_manager.members (
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
             'Member',
             NULL,
             '1990-01-01',
             '123 Demo Street, Atlas City',
             '+1234567890'
         );

-- Insert payment method for test member
WITH new_pm AS (
    INSERT INTO gym_manager.payment_methods (member_id, type)
    VALUES ((SELECT id FROM gym_manager.members WHERE email = 'admin'), 'credit_card')
    RETURNING id
)
INSERT INTO gym_manager.credit_cards (payment_method_id, card_number, card_holder, card_expiry, card_cvc)
SELECT id, '4000000000000000', 'Demo Member', '12/25', '123' FROM new_pm;

-- Insert trainer for test member
INSERT INTO gym_manager.trainers (
    member_id
) VALUES (
             (SELECT id FROM gym_manager.members WHERE email = 'admin')
         );

-- Insert regular member (not a trainer)
INSERT INTO gym_manager.members (
    email,
    password_hash,
    firstname,
    lastname,
    middlename,
    birthdate,
    address,
    phone
) VALUES (
             'member',
             '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK',
             'Regular',
             'Member',
             NULL,
             '1995-05-15',
             '456 Regular Road, Atlas City',
             '+0987654321'
         );

-- Insert payment method for regular member
WITH new_pm_member AS (
    INSERT INTO gym_manager.payment_methods (member_id, type)
    VALUES ((SELECT id FROM gym_manager.members WHERE email = 'member'), 'credit_card')
    RETURNING id
)
INSERT INTO gym_manager.credit_cards (payment_method_id, card_number, card_holder, card_expiry, card_cvc)
SELECT id, '4111111111111111', 'Regular Member', '12/28', '456' FROM new_pm_member;
