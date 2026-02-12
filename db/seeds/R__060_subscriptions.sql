-- Get plan IDs and member IDs for creating subscriptions
DO $$
DECLARE
  basic_plan_id INTEGER;
  standard_plan_id INTEGER;
  premium_plan_id INTEGER;
  student_plan_id INTEGER;
  member_ids UUID[];
BEGIN
  -- Get plan IDs
  SELECT id INTO basic_plan_id FROM plans WHERE name = 'Basic';
  SELECT id INTO standard_plan_id FROM plans WHERE name = 'Standard';
  SELECT id INTO premium_plan_id FROM plans WHERE name = 'Premium';
  SELECT id INTO student_plan_id FROM plans WHERE name = 'Student';

  -- Get some member IDs
  SELECT ARRAY(SELECT id FROM members ORDER BY created_at LIMIT 15) INTO member_ids;

  -- Create active subscriptions for some members
  IF array_length(member_ids, 1) >= 1 THEN
    INSERT INTO subscriptions (member_id, plan_id, start_date, end_date)
    VALUES 
      (member_ids[1], standard_plan_id, CURRENT_DATE - INTERVAL '2 months', NULL),
      (member_ids[2], premium_plan_id, CURRENT_DATE - INTERVAL '1 month', NULL),
      (member_ids[3], basic_plan_id, CURRENT_DATE - INTERVAL '3 months', NULL),
      (member_ids[4], standard_plan_id, CURRENT_DATE - INTERVAL '1 month', NULL),
      (member_ids[5], premium_plan_id, CURRENT_DATE - INTERVAL '4 months', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create some ended subscriptions
  IF array_length(member_ids, 1) >= 6 THEN
    INSERT INTO subscriptions (member_id, plan_id, start_date, end_date)
    VALUES 
      (member_ids[6], basic_plan_id, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '3 months'),
      (member_ids[7], student_plan_id, CURRENT_DATE - INTERVAL '8 months', CURRENT_DATE - INTERVAL '2 months'),
      (member_ids[8], standard_plan_id, CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE - INTERVAL '6 months')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
