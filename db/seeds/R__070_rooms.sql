INSERT INTO
  rooms (name, description)
VALUES
  (
    'Spinning Room',
    'Equipped with 25 stationary bikes, sound system, and dimmable lights.'
  ),
  (
    'Boxing Ring',
    'Full-size boxing ring with heavy bags and speed bags along the walls.'
  ),
  (
    'Pool',
    'Indoor heated pool (25m) with adjacent warm-up space.'
  ),
  (
    'Pilates Studio',
    'Reformer and mat pilates studio with mirrors and resistance equipment.'
  ),
  (
    'Calisthenics Outdoor Area',
    'Outdoor park with pull-up bars, dip stations, monkey bars, and parallettes.'
  ),
  (
    'Hyrox Training Area',
    'Functional fitness zone with ski ergs, sleds, wall balls, and rowing machines.'
  ),
  (
    'Dance Studio',
    'Sprung floor studio with full mirror wall, perfect for dance and aerobics.'
  ),
  (
    'Yoga Studio',
    'Quiet, warm room with mirrors and wooden flooring, ideal for yoga and meditation.'
  )
ON CONFLICT (name) DO NOTHING;
