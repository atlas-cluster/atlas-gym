-- Migration: 001
-- Description: Initial schema - Create users, sessions, and payment_methods tables

-- Create schema
CREATE SCHEMA IF NOT EXISTS gym_manager;

-- Enable CITEXT extension for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Set search path
SET search_path TO gym_manager;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type        VARCHAR(20) NOT NULL,
    card_number         VARCHAR(19),
    card_expiry         VARCHAR(7),
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

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
