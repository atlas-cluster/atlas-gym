UPDATE course_sessions
SET
  is_cancelled = FALSE
WHERE
  session_date >= CURRENT_DATE - INTERVAL '1 month'
  AND session_date <= CURRENT_DATE + INTERVAL '1 month';

UPDATE course_sessions
SET
  is_cancelled = TRUE
WHERE
  id IN (
    SELECT
      id
    FROM
      course_sessions
    WHERE
      session_date >= CURRENT_DATE - INTERVAL '1 month'
      AND session_date <= CURRENT_DATE + INTERVAL '1 month'
    ORDER BY
      md5('cancel-seed' || id::text)
    LIMIT
      (
        SELECT
          GREATEST(1, (COUNT(*) * 15 / 1000))
        FROM
          course_sessions
        WHERE
          session_date >= CURRENT_DATE - INTERVAL '1 month'
          AND session_date <= CURRENT_DATE + INTERVAL '1 month'
      )
  );

DELETE FROM course_bookings
WHERE
  session_id IN (
    SELECT
      id
    FROM
      course_sessions
    WHERE
      session_date >= CURRENT_DATE - INTERVAL '1 month'
      AND session_date <= CURRENT_DATE + INTERVAL '1 month'
  );

DO $$
DECLARE
  pass INT;
  m_id UUID;
  s RECORD;
  conflict_found BOOLEAN;
BEGIN
  FOR pass IN 1..2 LOOP
    FOR m_id IN
      SELECT m.id
      FROM members m
      JOIN subscriptions sub ON sub.member_id = m.id
      WHERE sub.start_date <= CURRENT_DATE
        AND (sub.end_date IS NULL OR sub.end_date >= CURRENT_DATE - INTERVAL '1 month')
      ORDER BY m.email
    LOOP
      FOR s IN
        SELECT cs.id AS session_id,
               cs.session_date,
               COALESCE(cs.start_time_override, cs.start_time) AS eff_start,
               COALESCE(cs.end_time_override, cs.end_time) AS eff_end
        FROM course_sessions cs
        JOIN course_templates ct ON ct.id = cs.template_id
        WHERE cs.session_date >= CURRENT_DATE - INTERVAL '1 month'
          AND cs.session_date <= CURRENT_DATE + INTERVAL '1 month'
          AND cs.is_cancelled = FALSE
          AND COALESCE(cs.trainer_id_override, ct.trainer_id) != m_id
        ORDER BY md5(pass::text || m_id::text || cs.id::text)
        LIMIT 20
      LOOP
        SELECT EXISTS (
          SELECT 1
          FROM course_bookings cb
          JOIN course_sessions cs2 ON cs2.id = cb.session_id
          WHERE cb.member_id = m_id
            AND cs2.session_date = s.session_date
            AND (s.eff_start, s.eff_end) OVERLAPS (
                  COALESCE(cs2.start_time_override, cs2.start_time),
                  COALESCE(cs2.end_time_override, cs2.end_time)
                )
        ) INTO conflict_found;

        IF NOT conflict_found THEN
          INSERT INTO course_bookings (session_id, member_id)
          VALUES (s.session_id, m_id)
          ON CONFLICT (session_id, member_id) DO NOTHING;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;
