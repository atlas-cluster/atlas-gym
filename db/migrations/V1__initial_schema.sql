-- Flyway migration will have already created the schema, but we include it here for completeness
CREATE SCHEMA IF NOT EXISTS gym_manager;
SET search_path TO gym_manager;


CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_firstname  VARCHAR(50)  NOT NULL,
    user_lastname   VARCHAR(50)  NOT NULL,
    user_middlename VARCHAR(50),
    user_email      CITEXT       NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    user_address    TEXT         NOT NULL,
    user_birthdate  DATE         NOT NULL,
    user_phone      VARCHAR(20)  NOT NULL,
    CONSTRAINT valid_email CHECK (user_email <> '')
);

-- Payment methods table
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

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trainers table
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
