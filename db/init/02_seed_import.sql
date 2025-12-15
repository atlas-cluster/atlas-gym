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
    'admin@demo.com',
    '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK', -- admin
    'Demo',
    'User',
    NULL,
    '1990-01-01',
    '123 Demo Street, Atlas City',
    '+1234567890',
    'credit_card',
    '4111 1111 1111 1111'
);

