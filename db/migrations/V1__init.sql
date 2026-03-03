SET
  search_path TO public;

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS citext;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ENUMS
CREATE TYPE payment_type AS ENUM('credit_card', 'iban');

CREATE TYPE action_type AS ENUM('Create', 'Update', 'Delete');

CREATE TYPE weekday AS ENUM(
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

-- TABLES
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  middlename VARCHAR(50),
  address TEXT NOT NULL,
  birthdate DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  payment_type payment_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_email CHECK (email <> '')
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trainers (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credit_cards (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  card_number VARCHAR(19) NOT NULL,
  card_holder VARCHAR(100) NOT NULL,
  card_expiry VARCHAR(5) NOT NULL,
  card_cvc VARCHAR(4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bank_accounts (
  member_id UUID PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  iban VARCHAR(34) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  min_duration_months INTEGER NOT NULL DEFAULT 1 CHECK (min_duration_months >= 1),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    end_date IS NULL
    OR end_date > start_date
  ),
  CONSTRAINT prevent_overlapping_subscriptions EXCLUDE USING GIST (
    member_id
    WITH
      =,
      daterange (start_date, COALESCE(end_date, 'infinity'), '[]')
    WITH
      &&
  )
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE course_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainers (member_id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms (id) ON DELETE SET NULL,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  weekdays weekday[] NOT NULL CHECK (array_length(weekdays, 1) > 0),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    end_date IS NULL
    OR end_date >= start_date
  )
);

CREATE TABLE course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES course_templates (id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  -- Override columns: when NULL, the value is inherited from the template.
  -- When set, the session has a per-session override that template updates won't touch.
  trainer_id_override UUID REFERENCES trainers (member_id) ON DELETE SET NULL,
  room_id_override UUID REFERENCES rooms (id) ON DELETE SET NULL,
  start_time_override TIME,
  end_time_override TIME,
  name_override VARCHAR(50),
  description_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, session_date)
);

CREATE INDEX idx_course_sessions_date ON course_sessions (session_date);

CREATE TABLE course_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions (id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, member_id)
);

CREATE INDEX idx_course_bookings_member ON course_bookings (member_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members (id) ON DELETE SET NULL,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  action action_type NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

CREATE INDEX idx_audit_logs_member ON audit_logs (member_id);

-- OVERLAP VALIDATION TRIGGERS
CREATE OR REPLACE FUNCTION validate_course_template_overlap () RETURNS TRIGGER AS $$
DECLARE
  conflict RECORD;
BEGIN
  -- Check trainer overlap
  IF NEW.trainer_id IS NOT NULL THEN
    SELECT ct.name INTO conflict
    FROM course_templates ct
    WHERE ct.id != NEW.id
      AND ct.trainer_id = NEW.trainer_id
      AND ct.weekdays && NEW.weekdays
      AND (NEW.start_time, NEW.end_time) OVERLAPS (ct.start_time, ct.end_time)
      AND daterange(NEW.start_date, COALESCE(NEW.end_date, 'infinity'), '[]')
       && daterange(ct.start_date, COALESCE(ct.end_date, 'infinity'), '[]')
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'Trainer schedule conflict: overlaps with course "%"', conflict.name
        USING ERRCODE = '23P01',
              CONSTRAINT = 'prevent_trainer_time_overlap';
    END IF;
  END IF;

  -- Check room overlap
  IF NEW.room_id IS NOT NULL THEN
    SELECT ct.name INTO conflict
    FROM course_templates ct
    WHERE ct.id != NEW.id
      AND ct.room_id = NEW.room_id
      AND ct.weekdays && NEW.weekdays
      AND (NEW.start_time, NEW.end_time) OVERLAPS (ct.start_time, ct.end_time)
      AND daterange(NEW.start_date, COALESCE(NEW.end_date, 'infinity'), '[]')
       && daterange(ct.start_date, COALESCE(ct.end_date, 'infinity'), '[]')
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'Room schedule conflict: overlaps with course "%"', conflict.name
        USING ERRCODE = '23P01',
              CONSTRAINT = 'prevent_room_time_overlap';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_course_template_overlap BEFORE INSERT
OR
UPDATE ON course_templates FOR EACH ROW
EXECUTE FUNCTION validate_course_template_overlap ();

CREATE OR REPLACE FUNCTION validate_course_session_overlap () RETURNS TRIGGER AS $$
DECLARE
  eff_trainer_id UUID;
  eff_room_id    UUID;
  eff_start      TIME;
  eff_end        TIME;
  conflict       RECORD;
BEGIN
  SELECT
    COALESCE(NEW.trainer_id_override, ct.trainer_id),
    COALESCE(NEW.room_id_override, ct.room_id),
    COALESCE(NEW.start_time_override, NEW.start_time),
    COALESCE(NEW.end_time_override, NEW.end_time)
  INTO eff_trainer_id, eff_room_id, eff_start, eff_end
  FROM course_templates ct
  WHERE ct.id = NEW.template_id;
  IF eff_trainer_id IS NOT NULL THEN
    SELECT COALESCE(cs.name_override, ct.name) AS session_name INTO conflict
    FROM course_sessions cs
    JOIN course_templates ct ON ct.id = cs.template_id
    WHERE cs.id != NEW.id
      AND (TG_OP != 'INSERT' OR cs.template_id != NEW.template_id)
      AND cs.session_date = NEW.session_date
      AND cs.is_cancelled = FALSE
      AND COALESCE(cs.trainer_id_override, ct.trainer_id) = eff_trainer_id
      AND (eff_start, eff_end) OVERLAPS (
            COALESCE(cs.start_time_override, cs.start_time),
            COALESCE(cs.end_time_override, cs.end_time)
          )
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'Session trainer conflict on %: overlaps with session "%"', NEW.session_date, conflict.session_name
        USING ERRCODE = '23P01',
              CONSTRAINT = 'prevent_session_trainer_overlap';
    END IF;
  END IF;

  -- Check room overlap on the same date
  IF eff_room_id IS NOT NULL THEN
    SELECT COALESCE(cs.name_override, ct.name) AS session_name INTO conflict
    FROM course_sessions cs
    JOIN course_templates ct ON ct.id = cs.template_id
    WHERE cs.id != NEW.id
      AND (TG_OP != 'INSERT' OR cs.template_id != NEW.template_id)
      AND cs.session_date = NEW.session_date
      AND cs.is_cancelled = FALSE
      AND COALESCE(cs.room_id_override, ct.room_id) = eff_room_id
      AND (eff_start, eff_end) OVERLAPS (
            COALESCE(cs.start_time_override, cs.start_time),
            COALESCE(cs.end_time_override, cs.end_time)
          )
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'Session room conflict on %: overlaps with session "%"', NEW.session_date, conflict.session_name
        USING ERRCODE = '23P01',
              CONSTRAINT = 'prevent_session_room_overlap';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_course_session_overlap BEFORE INSERT
OR
UPDATE ON course_sessions FOR EACH ROW
EXECUTE FUNCTION validate_course_session_overlap ();

-- BOOKING OVERLAP VALIDATION TRIGGER
-- Prevents a member from booking two course sessions that overlap in time on the same day.
CREATE OR REPLACE FUNCTION validate_booking_no_overlap () RETURNS TRIGGER AS $$
DECLARE
  new_date  DATE;
  new_start TIME;
  new_end   TIME;
  conflict  TEXT;
BEGIN
  -- Resolve the effective date and times for the session being booked
  SELECT
    cs.session_date,
    COALESCE(cs.start_time_override, cs.start_time),
    COALESCE(cs.end_time_override, cs.end_time)
  INTO new_date, new_start, new_end
  FROM course_sessions cs
  WHERE cs.id = NEW.session_id;

  -- Check for overlapping bookings by the same member on the same day
  SELECT COALESCE(cs2.name_override, ct2.name) INTO conflict
  FROM course_bookings cb
  JOIN course_sessions cs2 ON cs2.id = cb.session_id
  JOIN course_templates ct2 ON ct2.id = cs2.template_id
  WHERE cb.member_id = NEW.member_id
    AND cb.session_id != NEW.session_id
    AND cs2.session_date = new_date
    AND cs2.is_cancelled = FALSE
    AND (new_start, new_end) OVERLAPS (
          COALESCE(cs2.start_time_override, cs2.start_time),
          COALESCE(cs2.end_time_override, cs2.end_time)
        )
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'Booking conflict: overlaps with already booked session "%"', conflict
      USING ERRCODE = '23P01',
            CONSTRAINT = 'prevent_booking_time_overlap';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_booking_no_overlap BEFORE INSERT
OR
UPDATE ON course_bookings FOR EACH ROW
EXECUTE FUNCTION validate_booking_no_overlap ();

-- TRAINER SELF-BOOKING VALIDATION TRIGGER
-- Prevents a trainer from booking a session they are teaching.
CREATE OR REPLACE FUNCTION validate_no_self_booking () RETURNS TRIGGER AS $$
DECLARE
  eff_trainer_id UUID;
  session_name   TEXT;
BEGIN
  SELECT
    COALESCE(cs.trainer_id_override, ct.trainer_id),
    COALESCE(cs.name_override, ct.name)
  INTO eff_trainer_id, session_name
  FROM course_sessions cs
  JOIN course_templates ct ON ct.id = cs.template_id
  WHERE cs.id = NEW.session_id;

  IF eff_trainer_id IS NOT NULL AND eff_trainer_id = NEW.member_id THEN
    RAISE EXCEPTION 'Cannot book your own session "%"', session_name
      USING ERRCODE = '23P01',
            CONSTRAINT = 'prevent_trainer_self_booking';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_no_self_booking BEFORE INSERT
OR
UPDATE ON course_bookings FOR EACH ROW
EXECUTE FUNCTION validate_no_self_booking ();

-- Auto-removes a trainer's booking when they are assigned to that session.
CREATE OR REPLACE FUNCTION remove_self_booking_on_session_update () RETURNS TRIGGER AS $$
DECLARE
  eff_trainer_id UUID;
BEGIN
  IF NEW.trainer_id_override IS DISTINCT FROM OLD.trainer_id_override THEN
    SELECT COALESCE(NEW.trainer_id_override, ct.trainer_id)
    INTO eff_trainer_id
    FROM course_templates ct
    WHERE ct.id = NEW.template_id;

    IF eff_trainer_id IS NOT NULL THEN
      INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
      SELECT cb.member_id, 'Delete'::action_type, cb.id, 'course_booking',
        'Booking auto-cancelled: assigned as trainer for session ' || COALESCE(NEW.name_override, ct.name)
      FROM course_bookings cb
      JOIN course_templates ct ON ct.id = NEW.template_id
      WHERE cb.session_id = NEW.id
        AND cb.member_id = eff_trainer_id;

      DELETE FROM course_bookings
      WHERE session_id = NEW.id
        AND member_id = eff_trainer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_self_booking_on_session BEFORE
UPDATE ON course_sessions FOR EACH ROW
EXECUTE FUNCTION remove_self_booking_on_session_update ();

-- Auto-removes a trainer's bookings when they are assigned to a template,
-- for all sessions that inherit the trainer from the template.
CREATE OR REPLACE FUNCTION remove_self_booking_on_template_update () RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trainer_id IS DISTINCT FROM OLD.trainer_id AND NEW.trainer_id IS NOT NULL THEN
    -- Log before deleting
    INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
    SELECT cb.member_id, 'Delete'::action_type, cb.id, 'course_booking',
      'Booking auto-cancelled: assigned as trainer for course ' || NEW.name
    FROM course_bookings cb
    JOIN course_sessions cs ON cs.id = cb.session_id
    WHERE cb.member_id = NEW.trainer_id
      AND cs.template_id = NEW.id
      AND cs.trainer_id_override IS NULL;

    DELETE FROM course_bookings
    WHERE member_id = NEW.trainer_id
      AND session_id IN (
        SELECT cs.id
        FROM course_sessions cs
        WHERE cs.template_id = NEW.id
          AND cs.trainer_id_override IS NULL
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_self_booking_on_template BEFORE
UPDATE ON course_templates FOR EACH ROW
EXECUTE FUNCTION remove_self_booking_on_template_update ();
