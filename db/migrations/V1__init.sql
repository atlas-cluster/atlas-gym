SET
  search_path TO public;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE payment_type AS ENUM ('credit_card', 'iban');

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  middlename VARCHAR(50),
  address TEXT NOT NULL,
  birthdate DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  payment_type payment_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  CONSTRAINT valid_email CHECK (email <> '')
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE trainers (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE credit_cards (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  card_number VARCHAR(19) NOT NULL,
  card_holder VARCHAR(100) NOT NULL,
  card_expiry VARCHAR(5) NOT NULL,
  card_cvc VARCHAR(4) NOT NULL
);

CREATE TABLE bank_accounts (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  iban VARCHAR(34) NOT NULL
);

CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  min_duration_months INTEGER NOT NULL DEFAULT 1 CHECK (min_duration_months >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans (id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE UNIQUE INDEX unique_active_subscription ON subscriptions (member_id)
WHERE
  end_date IS NULL;
