-- Create active subscriptions for some members
INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '2 months',
  NULL
FROM
  members m,
  plans p
WHERE
  p.name = 'Standard'
LIMIT
  1;

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '1 month',
  NULL
FROM
  members m,
  plans p
WHERE
  p.name = 'Premium'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '3 months',
  NULL
FROM
  members m,
  plans p
WHERE
  p.name = 'Basic'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '1 month',
  NULL
FROM
  members m,
  plans p
WHERE
  p.name = 'Standard'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '4 months',
  NULL
FROM
  members m,
  plans p
WHERE
  p.name = 'Premium'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;

-- Create some ended subscriptions
INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE - INTERVAL '3 months'
FROM
  members m,
  plans p
WHERE
  p.name = 'Basic'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '8 months',
  CURRENT_DATE - INTERVAL '2 months'
FROM
  members m,
  plans p
WHERE
  p.name = 'Student'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  CURRENT_DATE - INTERVAL '1 year',
  CURRENT_DATE - INTERVAL '6 months'
FROM
  members m,
  plans p
WHERE
  p.name = 'Standard'
  AND m.id NOT IN (
    SELECT
      member_id
    FROM
      subscriptions
  )
LIMIT
  1;
