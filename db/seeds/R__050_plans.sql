INSERT INTO
  plans (name, price, min_duration_months, description, is_default)
VALUES
  (
    'Basic',
    29.99,
    1,
    'Perfect for beginners. Access to gym equipment during off-peak hours.',
    false
  ),
  (
    'Standard',
    49.99,
    3,
    'Most popular plan. Full gym access, group classes, and personal locker.',
    true
  ),
  (
    'Premium',
    79.99,
    6,
    'Ultimate fitness experience. All Standard benefits plus sauna, pool, and 4 personal training sessions per month.',
    false
  ),
  (
    'Student',
    24.99,
    1,
    'Special discount for students. Basic gym access with valid student ID.',
    false
  ),
  (
    'Family',
    129.99,
    12,
    'Share the fitness journey. Plan for up to 4 family members with all Premium benefits.',
    false
  ),
  (
    'Senior',
    34.99,
    1,
    'Designed for seniors 65+. Full gym access with specialized senior fitness classes.',
    false
  )
ON CONFLICT (name) DO NOTHING;
