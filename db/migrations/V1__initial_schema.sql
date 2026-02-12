SET
  search_path TO public;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  middlename VARCHAR(50),
  address TEXT NOT NULL,
  birthdate DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  CONSTRAINT valid_email CHECK (email <> '')
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID REFERENCES members (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now ()
);

CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID NOT NULL UNIQUE REFERENCES members (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TYPE payment_type AS ENUM ('credit_card', 'iban');

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  type payment_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  UNIQUE (member_id, type)
);

CREATE TABLE credit_cards (
  payment_method_id UUID PRIMARY KEY REFERENCES payment_methods (id) ON DELETE CASCADE,
  card_number VARCHAR(19) NOT NULL,
  card_holder VARCHAR(100) NOT NULL,
  card_expiry VARCHAR(5) NOT NULL,
  card_cvc VARCHAR(4) NOT NULL
);

CREATE TABLE bank_accounts (
  payment_method_id UUID PRIMARY KEY REFERENCES payment_methods (id) ON DELETE CASCADE,
  iban VARCHAR(34) NOT NULL
);
