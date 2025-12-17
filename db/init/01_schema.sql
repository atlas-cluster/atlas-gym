DROP SCHEMA IF EXISTS gym_manager CASCADE;
CREATE SCHEMA gym_manager;
SET search_path TO gym_manager;

-- Enable CITEXT extension for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

DROP TABLE IF EXISTS
    users,
    sessions,
    payment_methods
CASCADE;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_firstname  VARCHAR(50)  NOT NULL,
    user_lastname   VARCHAR(50)  NOT NULL,
    user_middlename VARCHAR(50),
    user_email      CITEXT       NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    user_address    TEXT,
    user_birthdate  DATE         NOT NULL,
    user_phone      VARCHAR(20),
    CONSTRAINT valid_email CHECK (user_email <> '')
);

CREATE TABLE payment_methods (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type        VARCHAR(20) NOT NULL,  -- 'credit_card' or 'iban'
    
    -- Credit card fields (only populated when payment_type = 'credit_card')
    card_number         VARCHAR(19),  -- Full card number
    card_expiry         VARCHAR(7),   -- Format: MM/YYYY
    
    -- IBAN fields (only populated when payment_type = 'iban')
    iban                VARCHAR(34),
    
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT valid_payment_type CHECK (payment_type IN ('credit_card', 'iban')),
    CONSTRAINT check_credit_card_fields CHECK (
        (payment_type = 'credit_card' AND card_number IS NOT NULL AND card_expiry IS NOT NULL)
        OR payment_type != 'credit_card'
    ),
    CONSTRAINT check_iban_fields CHECK (
        (payment_type = 'iban' AND iban IS NOT NULL)
        OR payment_type != 'iban'
    )
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- -- -----------------------------
-- -- Trainer-License
-- -- -----------------------------
-- CREATE TABLE trainer_license (
--     trainer_license_id     SERIAL PRIMARY KEY,
--     trainer_license_name   VARCHAR(50) NOT NULL,
--     trainer_license_description VARCHAR(200)
-- );
--
-- -- -----------------------------
-- -- Trainer
-- -- -----------------------------
-- CREATE TABLE trainer (
--     trainer_id         SERIAL PRIMARY KEY,
--     user_id            INT NOT NULL,
--     trainer_license_id INT NOT NULL,
--     trainer_start_date DATE NOT NULL,
--     trainer_end_date   DATE,
--
--     CONSTRAINT fk_trainer_user
--         FOREIGN KEY (user_id)
--         REFERENCES app_user (user_id)
--         ON DELETE CASCADE,
--
--     CONSTRAINT fk_trainer_license
--         FOREIGN KEY (trainer_license_id)
--         REFERENCES trainer_license (trainer_license_id)
--         ON DELETE RESTRICT
-- );
--
-- -- -----------------------------
-- -- Rooms
-- -- -----------------------------
-- CREATE TABLE rooms (
--     room_id       SERIAL PRIMARY KEY,
--     room_name     VARCHAR(20) NOT NULL,
--     room_capacity INT NOT NULL
-- );
--
-- -- -----------------------------
-- -- Course
-- -- -----------------------------
-- CREATE TABLE course (
--     course_id     SERIAL PRIMARY KEY,
--     trainer_id    INT NOT NULL,
--     room_id       INT NOT NULL,
--     course_name   VARCHAR(100) NOT NULL,
--     course_start_date DATE NOT NULL,
--     course_end_date   DATE NOT NULL,
--
--     CONSTRAINT fk_course_trainer
--         FOREIGN KEY (trainer_id)
--         REFERENCES trainer (trainer_id)
--         ON DELETE RESTRICT,
--
--     CONSTRAINT fk_course_room
--         FOREIGN KEY (room_id)
--         REFERENCES rooms (room_id)
--         ON DELETE RESTRICT
-- );
--
-- -- -----------------------------
-- -- Course-Reservation
-- -- -----------------------------
-- CREATE TABLE course_reservation (
--     course_reservation_id SERIAL PRIMARY KEY,
--     user_id   INT NOT NULL,
--     course_id INT NOT NULL,
--
--     CONSTRAINT fk_course_reservation_user
--         FOREIGN KEY (user_id)
--         REFERENCES app_user (user_id)
--         ON DELETE CASCADE,
--
--     CONSTRAINT fk_course_reservation_course
--         FOREIGN KEY (course_id)
--         REFERENCES course (course_id)
--         ON DELETE CASCADE
-- );
--
-- -- -----------------------------
-- -- Equipment
-- -- -----------------------------
-- CREATE TABLE equipment (
--     equipment_id          SERIAL PRIMARY KEY,
--     equipment_name        VARCHAR(50) NOT NULL,
--     equipment_manufacturer VARCHAR(50) NOT NULL,
--     equipment_buy_date    DATE NOT NULL,
--     equipment_is_operational BOOLEAN NOT NULL
-- );
--
-- -- -----------------------------
-- -- Course-Equipment
-- -- -----------------------------
-- CREATE TABLE course_equipment (
--     course_equipment_id SERIAL PRIMARY KEY,
--     course_id           INT NOT NULL,
--     equipment_id        INT NOT NULL,
--
--     CONSTRAINT fk_course_equipment_course
--         FOREIGN KEY (course_id)
--         REFERENCES course (course_id)
--         ON DELETE CASCADE,
--
--     CONSTRAINT fk_course_equipment_equipment
--         FOREIGN KEY (equipment_id)
--         REFERENCES equipment (equipment_id)
--         ON DELETE CASCADE
-- );
--
-- -- -----------------------------
-- -- Session (OHNE session_type_id)
-- -- -----------------------------
-- CREATE TABLE sessions (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   expires_at TIMESTAMP NOT NULL,
--   created_at TIMESTAMP DEFAULT now()
-- );
--
-- -- -----------------------------
-- -- Membership
-- -- -----------------------------
-- CREATE TABLE membership (
--     membership_id SERIAL PRIMARY KEY,
--     membership_name VARCHAR(50) NOT NULL,
--     membership_price INT NOT NULL,
--     membership_min_duration DATE NOT NULL
-- );
--
-- -- -----------------------------
-- -- Contracts
-- -- -----------------------------
-- CREATE TABLE contracts (
--     contract_id      SERIAL PRIMARY KEY,
--     user_id          INT NOT NULL,
--     membership_id    INT NOT NULL,
--     contract_cancellation_date DATE NOT NULL,
--     contract_start_date DATE NOT NULL,
--     contract_end_date   DATE,
--
--     CONSTRAINT fk_contract_user
--         FOREIGN KEY (user_id)
--         REFERENCES app_user (user_id)
--         ON DELETE CASCADE,
--
--     CONSTRAINT fk_contract_membership
--         FOREIGN KEY (membership_id)
--         REFERENCES membership (membership_id)
--         ON DELETE RESTRICT
-- );
--
-- -- -----------------------------
-- -- Payment Method & Status
-- -- -----------------------------
-- CREATE TABLE payment_method (
--     payment_method_id SERIAL PRIMARY KEY,
--     payment_method_name VARCHAR(50) NOT NULL,
--     payment_method_description VARCHAR(200)
-- );
--
-- CREATE TABLE payment_status (
--     payment_status_id SERIAL PRIMARY KEY,
--     payment_status_label VARCHAR(50) NOT NULL,
--     payment_status_description VARCHAR(200)
-- );
--
-- -- -----------------------------
-- -- Payment
-- -- -----------------------------
-- CREATE TABLE payment (
--     payment_id      SERIAL PRIMARY KEY,
--     contract_id     INT NOT NULL,
--     payment_date    DATE NOT null,
--     payment_amount  DECIMAL NOT NULL,
--     payment_method_id INT NOT NULL,
--     payment_status_id INT NOT NULL,
--
--     CONSTRAINT fk_payment_contract
--         FOREIGN KEY (contract_id)
--         REFERENCES contracts (contract_id)
--         ON DELETE CASCADE,
--
--     CONSTRAINT fk_payment_method
--         FOREIGN KEY (payment_method_id)
--         REFERENCES payment_method (payment_method_id)
--         ON DELETE RESTRICT,
--
--     CONSTRAINT fk_payment_status
--         FOREIGN KEY (payment_status_id)
--         REFERENCES payment_status (payment_status_id)
--         ON DELETE RESTRICT
-- );
