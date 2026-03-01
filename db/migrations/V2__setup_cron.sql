SET
  search_path TO public;

-- Function to generate course sessions for all templates up to 1 year in advance.
-- Inserts sessions for each weekday the template is scheduled on, within its date range.
CREATE OR REPLACE FUNCTION generate_course_sessions () RETURNS void AS $$
DECLARE
    t RECORD;
    d DATE;
    wd TEXT;
    target_dow INT;
    range_start DATE;
    range_end DATE;
BEGIN
    FOR t IN SELECT * FROM course_templates LOOP
            range_start := GREATEST(t.start_date, CURRENT_DATE);
            range_end   := LEAST(
                    COALESCE(t.end_date, CURRENT_DATE + INTERVAL '1 year'),
                    CURRENT_DATE + INTERVAL '1 year'
                           );

            FOREACH wd IN ARRAY t.weekdays LOOP
                    target_dow := CASE wd
                                      WHEN 'monday'    THEN 1
                                      WHEN 'tuesday'   THEN 2
                                      WHEN 'wednesday' THEN 3
                                      WHEN 'thursday'  THEN 4
                                      WHEN 'friday'    THEN 5
                                      WHEN 'saturday'  THEN 6
                                      WHEN 'sunday'    THEN 0
                        END;

                    d := range_start + ((target_dow - EXTRACT(DOW FROM range_start)::INT + 7) % 7);

                    WHILE d <= range_end LOOP
                            INSERT INTO course_sessions (template_id, session_date, start_time, end_time)
                            VALUES (t.id, d, t.start_time, t.end_time)
                            ON CONFLICT (template_id, session_date) DO NOTHING;

                            d := d + 7;
                        END LOOP;
                END LOOP;
        END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for INSERT or UPDATE on course_templates.
-- On INSERT: generates sessions for the new template.
-- On UPDATE: propagates template changes to future sessions while preserving per-session overrides.
CREATE OR REPLACE FUNCTION generate_sessions_for_template () RETURNS TRIGGER AS $$
DECLARE
    d DATE;
    wd TEXT;
    target_dow INT;
    range_start DATE;
    range_end DATE;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- 1. Delete future sessions whose weekday is no longer in the template's weekday list.
        --    These sessions are orphaned since the template no longer runs on that day.
        DELETE FROM course_sessions
        WHERE template_id = NEW.id
          AND session_date >= CURRENT_DATE
          AND NOT (
            CASE EXTRACT(DOW FROM session_date)::INT
              WHEN 0 THEN 'sunday'
              WHEN 1 THEN 'monday'
              WHEN 2 THEN 'tuesday'
              WHEN 3 THEN 'wednesday'
              WHEN 4 THEN 'thursday'
              WHEN 5 THEN 'friday'
              WHEN 6 THEN 'saturday'
            END = ANY(NEW.weekdays::TEXT[])
          );

        -- 2. Delete future sessions that fall outside the new date range
        DELETE FROM course_sessions
        WHERE template_id = NEW.id
          AND session_date >= CURRENT_DATE
          AND (session_date < NEW.start_date OR (NEW.end_date IS NOT NULL AND session_date > NEW.end_date));

        -- 3. Propagate template changes to future sessions, but only for non-overridden fields.
        UPDATE course_sessions
        SET
            start_time = CASE WHEN start_time_override IS NULL THEN NEW.start_time ELSE start_time END,
            end_time   = CASE WHEN end_time_override IS NULL   THEN NEW.end_time   ELSE end_time END,
            updated_at = NOW()
        WHERE template_id = NEW.id
          AND session_date >= CURRENT_DATE;
    END IF;

    -- Generate new sessions for any dates that don't have one yet
    range_start := GREATEST(NEW.start_date, CURRENT_DATE);
    range_end   := LEAST(
            COALESCE(NEW.end_date, CURRENT_DATE + INTERVAL '1 year'),
            CURRENT_DATE + INTERVAL '1 year'
                   );

    FOREACH wd IN ARRAY NEW.weekdays LOOP
            target_dow := CASE wd
                              WHEN 'monday'    THEN 1
                              WHEN 'tuesday'   THEN 2
                              WHEN 'wednesday' THEN 3
                              WHEN 'thursday'  THEN 4
                              WHEN 'friday'    THEN 5
                              WHEN 'saturday'  THEN 6
                              WHEN 'sunday'    THEN 0
                END;

            d := range_start + ((target_dow - EXTRACT(DOW FROM range_start)::INT + 7) % 7);

            WHILE d <= range_end LOOP
                    INSERT INTO course_sessions (template_id, session_date, start_time, end_time)
                    VALUES (NEW.id, d, NEW.start_time, NEW.end_time)
                    ON CONFLICT (template_id, session_date) DO NOTHING;

                    d := d + 7;
                END LOOP;
        END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT
  cron.schedule (
    'cleanup-gym-sessions',
    '0 4 * * *',
    'DELETE FROM sessions WHERE expires_at < now()'
  );

-- Auto-generate sessions when a course template is created or updated
CREATE TRIGGER trg_generate_sessions
AFTER INSERT
OR
UPDATE ON course_templates FOR EACH ROW
EXECUTE FUNCTION generate_sessions_for_template ();

-- Daily cron job to extend the session window
SELECT
  cron.schedule (
    'generate-course-sessions',
    '0 3 * * *',
    'SELECT generate_course_sessions()'
  );

-- Daily cron job to delete course sessions older than 1 year
SELECT
  cron.schedule (
    'cleanup-course-sessions',
    '30 4 * * *',
    'DELETE FROM course_sessions WHERE session_date < CURRENT_DATE - INTERVAL ''1 year'''
  );

-- Generate sessions for all existing templates on init
SELECT
  generate_course_sessions ();
