-- Extension aktivieren (erfordert Superuser, was der DB_USER im Docker meist ist)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job planen: Jeden Morgen um 04:00 Uhr abgelaufene Sessions löschen
SELECT
  cron.schedule (
    'cleanup-gym-sessions',
    '0 4 * * *',
    'DELETE FROM sessions WHERE expires_at < now()'
  );
