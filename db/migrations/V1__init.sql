SET
  search_path TO public;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE payment_type AS ENUM ('credit_card', 'iban');

CREATE TYPE action_type AS ENUM ('Create', 'Update', 'Delete');

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE credit_cards (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  card_number VARCHAR(19) NOT NULL,
  card_holder VARCHAR(100) NOT NULL,
  card_expiry VARCHAR(5) NOT NULL,
  card_cvc VARCHAR(4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE bank_accounts (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  iban VARCHAR(34) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  min_duration_months INTEGER NOT NULL DEFAULT 1 CHECK (min_duration_months >= 1),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans (id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  CHECK (
    end_date IS NULL
    OR end_date > start_date
  )
);

CREATE UNIQUE INDEX unique_active_subscription ON subscriptions (member_id)
WHERE
  end_date IS NULL;

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE TABLE course_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  trainer_id UUID NOT NULL REFERENCES trainers (member_id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES rooms (id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  CHECK (
    end_date IS NULL
    OR end_date >= start_date
  )
);

CREATE TABLE course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  template_id UUID NOT NULL REFERENCES course_templates (id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  UNIQUE (template_id, session_date)
);

CREATE INDEX idx_course_sessions_date ON course_sessions (session_date);

CREATE TABLE course_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  session_id UUID NOT NULL REFERENCES course_sessions (id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  UNIQUE (session_id, member_id)
);

CREATE INDEX idx_course_bookings_member ON course_bookings (member_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE SET NULL,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  action action_type NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

CREATE INDEX idx_audit_logs_member ON audit_logs (member_id);
