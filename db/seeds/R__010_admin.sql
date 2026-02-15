-- Insert one admin member for testing
INSERT INTO
  members (
    email,
    password_hash,
    firstname,
    lastname,
    middlename,
    birthdate,
    address,
    phone,
    payment_type
  )
VALUES
  (
    'admin',
    '$2a$10$3W1fOUdvSq7DxxuqP58T1OR0AViu42IxdZtBgxNeWUXlNx0j3HfjK',
    'admin',
    'admin',
    NULL,
    '2000-01-01',
    'Test Address 123',
    '+491234567890',
    'credit_card'
  );

-- Make admin a trainer
INSERT INTO
  trainers (member_id)
VALUES
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'admin'
    )
  );
