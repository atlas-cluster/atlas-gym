INSERT INTO
  course_templates (
    trainer_id,
    room_id,
    name,
    description,
    weekdays,
    start_time,
    end_time,
    start_date,
    end_date
  )
VALUES
  -- ===== SPINNING ROOM =====
  -- Max Neumann: Primary spinning trainer
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Early Bird Spin',
    'Wake up and ride! High-energy morning spin to kickstart your day.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '06:30',
    '07:15',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Spin & Burn',
    'Intense 45-minute interval ride with hill climbs and sprints.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '07:00',
    '07:45',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Endurance Ride',
    'Long steady-state cycling session. Build your aerobic base.',
    ARRAY['sunday']::weekday[],
    '09:00',
    '10:30',
    '2025-01-12',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Power Cycling',
    'Threshold intervals to push your FTP. Intermediate to advanced.',
    ARRAY['monday', 'thursday']::weekday[],
    '18:00',
    '18:45',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Lunchtime Spin Express',
    'Quick 30-minute spin blast during your lunch break.',
    ARRAY['tuesday', 'wednesday', 'friday']::weekday[],
    '12:00',
    '12:30',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Saturday Spin Party',
    'Weekend vibes with themed playlists and high energy.',
    ARRAY['saturday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-11',
    NULL
  ),
  -- ===== BOXING RING =====
  -- Sarah Maier: Primary boxing trainer
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Boxing Basics',
    'Learn jab, cross, hook, and uppercut. Pads and bags provided.',
    ARRAY['monday', 'wednesday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Kickboxing Cardio',
    'Non-contact kickboxing-inspired workout for a serious sweat.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Fight Conditioning',
    'Strength and cardio circuit inspired by fighter training camps.',
    ARRAY['friday']::weekday[],
    '16:00',
    '17:00',
    '2025-01-10',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Boxing Sparring Open',
    'Supervised light sparring for intermediate and advanced boxers.',
    ARRAY['saturday']::weekday[],
    '11:00',
    '12:30',
    '2025-02-01',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Heavy Bag HIIT',
    'High-intensity intervals on the heavy bag. All levels welcome.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '12:00',
    '12:45',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Boxing for Beginners',
    'Step-by-step introduction to boxing. No experience needed.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '10:00',
    '11:00',
    '2025-02-04',
    NULL
  ),
  -- ===== POOL =====
  -- Felix Hoffmann: Primary swim trainer
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Aqua Aerobics',
    'Low-impact water-based workout. Perfect for joint-friendly exercise.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '08:00',
    '09:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Swim Technique',
    'Improve your freestyle, backstroke, and breaststroke with drills.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '07:00',
    '08:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Aqua Power',
    'High-intensity water resistance training. Builds strength without impact.',
    ARRAY['monday', 'wednesday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Lap Swimming Club',
    'Structured lane swimming with pace sets. Bring your own goggles.',
    ARRAY['tuesday', 'thursday', 'saturday']::weekday[],
    '06:00',
    '07:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Water Polo Introduction',
    'Learn the basics of water polo in a fun, relaxed setting.',
    ARRAY['saturday']::weekday[],
    '11:00',
    '12:30',
    '2025-02-01',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Aqua Yoga',
    'Gentle yoga poses adapted for the pool. Deep relaxation in warm water.',
    ARRAY['sunday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-12',
    NULL
  ),
  -- ===== PILATES STUDIO =====
  -- Maria Schmidt: Primary pilates trainer
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Morning Mat Pilates',
    'Classic mat pilates focusing on core strength and flexibility.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '07:00',
    '08:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Power Pilates',
    'Core-focused pilates with resistance bands and stability balls.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Reformer Pilates',
    'Machine-based pilates for deeper muscle engagement. Limited spots.',
    ARRAY['monday', 'wednesday']::weekday[],
    '11:00',
    '12:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Pilates for Runners',
    'Targeted pilates to improve running form, hip mobility, and core stability.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '17:00',
    '18:00',
    '2025-02-04',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Prenatal Pilates',
    'Safe, gentle pilates adapted for expectant mothers.',
    ARRAY['saturday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Barre Fusion',
    'Ballet-inspired workout blending pilates, dance, and strength.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Stretch & Restore',
    'Deep stretching and myofascial release. Perfect after intense training.',
    ARRAY['friday']::weekday[],
    '19:00',
    '20:00',
    '2025-01-10',
    NULL
  ),
  -- ===== CALISTHENICS OUTDOOR AREA =====
  -- Daniel Werner & Jonas Weber
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Boot Camp',
    'Military-inspired outdoor circuit training. Rain or shine!',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '06:00',
    '07:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Calisthenics Fundamentals',
    'Master push-ups, pull-ups, dips, and muscle-ups progressions.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '08:00',
    '09:30',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Weekend Warrior Circuit',
    'Full-body outdoor circuit to kick off the weekend.',
    ARRAY['saturday']::weekday[],
    '08:00',
    '09:30',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Street Workout',
    'Freestyle calisthenics — levers, planches, handstands, and combos.',
    ARRAY['monday', 'wednesday']::weekday[],
    '16:00',
    '17:30',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Outdoor Strength & Conditioning',
    'Bodyweight and minimal equipment strength work in the fresh air.',
    ARRAY['tuesday', 'thursday', 'saturday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Pull-Up Progressions',
    'From zero to hero — structured pull-up training for all levels.',
    ARRAY['friday']::weekday[],
    '15:00',
    '16:00',
    '2025-01-10',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Outdoor Boxing Drills',
    'Shadow boxing, footwork, and conditioning in the open air.',
    ARRAY['sunday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-12',
    NULL
  ),
  -- ===== HYROX TRAINING AREA =====
  -- Jonas Weber & Sarah Maier & Daniel Werner
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Hyrox Race Prep',
    'Full Hyrox simulation — running, ski erg, sled push/pull, wall balls, and more.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '07:00',
    '08:30',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Functional Strength',
    'Compound lifts and functional movements to build Hyrox-ready power.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Strongman Saturday',
    'Tire flips, farmer walks, atlas stones — weekend warrior edition.',
    ARRAY['saturday']::weekday[],
    '09:00',
    '11:00',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Sled & Erg Intervals',
    'Alternating sled pushes, pulls, and erg sprints. Pure conditioning.',
    ARRAY['monday', 'wednesday']::weekday[],
    '12:00',
    '13:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Wall Ball Madness',
    'Wall ball technique and endurance. A Hyrox essential.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '12:00',
    '12:45',
    '2025-02-04',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Hyrox Doubles Training',
    'Partner-based Hyrox simulation for the doubles category.',
    ARRAY['saturday']::weekday[],
    '13:00',
    '14:30',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Functional Fitness WOD',
    'Workout of the Day — constantly varied, always challenging.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Tabata Blast',
    '20 seconds on, 10 seconds off — repeat until you drop.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '17:00',
    '17:45',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Kettlebell Fury',
    'Swings, cleans, snatches — all kettlebell, all the time.',
    ARRAY['sunday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-12',
    NULL
  ),
  -- ===== DANCE STUDIO =====
  -- Sophie Mueller: Primary dance trainer
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Zumba Party',
    'High-energy Latin-inspired dance fitness. No experience needed!',
    ARRAY['monday', 'wednesday']::weekday[],
    '18:00',
    '19:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Step Aerobics',
    'Classic step workout with choreography. Great cardio burn.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Hip Hop Fitness',
    'Street dance inspired cardio workout to the latest beats.',
    ARRAY['saturday']::weekday[],
    '11:00',
    '12:00',
    '2025-02-01',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Body Pump',
    'Barbell-based group class targeting all major muscle groups.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '12:00',
    '13:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Latin Dance Fitness',
    'Salsa, bachata, and merengue moves wrapped in a fitness class.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '19:00',
    '20:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Dance Cardio Express',
    'Fast-paced 30-minute dance session. Maximum fun, minimum time.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '07:00',
    '07:30',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Contemporary Dance',
    'Expressive movement blending ballet, modern, and jazz techniques.',
    ARRAY['saturday']::weekday[],
    '14:00',
    '15:30',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Afro Dance Fitness',
    'Afrobeats-inspired dance workout. Pure joy and sweat.',
    ARRAY['sunday']::weekday[],
    '11:00',
    '12:00',
    '2025-01-12',
    NULL
  ),
  -- ===== YOGA STUDIO =====
  -- Maria Schmidt: Primary yoga trainer
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Morning Yoga Flow',
    'Energizing vinyasa flow to start your day. All levels welcome.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '07:00',
    '08:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Yin Yoga',
    'Slow, deep stretching held for minutes. Targets connective tissue.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '09:00',
    '10:15',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Hot Power Yoga',
    'Heated room, powerful sequences. Prepare to sweat and grow.',
    ARRAY['monday', 'wednesday']::weekday[],
    '18:00',
    '19:15',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Sunset Stretch & Restore',
    'Gentle stretching and guided relaxation to wind down the week.',
    ARRAY['friday']::weekday[],
    '18:00',
    '19:00',
    '2025-01-10',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Yoga for Athletes',
    'Mobility and recovery focused yoga tailored for active people.',
    ARRAY['saturday']::weekday[],
    '08:00',
    '09:00',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Sunday Meditation & Breathwork',
    'Guided meditation, pranayama, and sound healing.',
    ARRAY['sunday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-12',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Mobility & Recovery',
    'Foam rolling, dynamic stretching, and breathing exercises.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '19:00',
    '20:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Ashtanga Yoga',
    'Traditional Ashtanga primary series. Disciplined and structured.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '12:00',
    '13:15',
    '2025-02-03',
    NULL
  ),
  -- ===== CROSS-ROOM EVENING SPECIALS =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Friday Night Throwdown',
    'Team-based competitive workout to end the week. Leaderboard included.',
    ARRAY['friday']::weekday[],
    '18:00',
    '19:30',
    '2025-01-10',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Candlelight Spin',
    'Evening spin session in dim lighting with chill beats. Unwind and ride.',
    ARRAY['thursday']::weekday[],
    '20:00',
    '20:45',
    '2025-02-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Friday Night Dance Party',
    'End your week on the dance floor. All styles, all fun.',
    ARRAY['friday']::weekday[],
    '19:00',
    '20:30',
    '2025-01-10',
    NULL
  ),
  -- ===== ADDITIONAL SPINNING ROOM =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Hill Climb Challenge',
    'Progressive resistance ride simulating steep mountain climbs.',
    ARRAY['wednesday']::weekday[],
    '08:00',
    '08:45',
    '2025-01-08',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Recovery Spin',
    'Easy-pace active recovery ride. Flush out the legs.',
    ARRAY['sunday']::weekday[],
    '16:00',
    '16:45',
    '2025-02-02',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Sprint Intervals',
    '30-second all-out sprints with 90-second recovery. Repeat x12.',
    ARRAY['monday', 'friday']::weekday[],
    '09:00',
    '09:45',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Rhythm Ride',
    'Pedal to the beat — music-driven spin class with choreography on the bike.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '18:00',
    '18:45',
    '2025-02-04',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Spinning Room'
    ),
    'Spin & Stretch',
    '30 minutes spinning followed by 15 minutes guided stretching.',
    ARRAY['wednesday']::weekday[],
    '17:00',
    '17:45',
    '2025-01-08',
    NULL
  ),
  -- ===== ADDITIONAL BOXING RING =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Womens Boxing',
    'Boxing class designed for women. Supportive and empowering.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '08:00',
    '09:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Boxing Conditioning',
    'Rope skipping, shadow boxing, and bag work circuits.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '17:00',
    '18:00',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Pad Work Masterclass',
    'Partner pad work drills for timing, accuracy, and combination flow.',
    ARRAY['saturday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Boxing Footwork Clinic',
    'Focused session on stance, movement, angles, and ring generalship.',
    ARRAY['wednesday']::weekday[],
    '19:00',
    '20:00',
    '2025-01-08',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Boxing Ring'
    ),
    'Sunday Open Gym Boxing',
    'Open session — bag work, shadow boxing, or light sparring. Trainer supervised.',
    ARRAY['sunday']::weekday[],
    '10:00',
    '12:00',
    '2025-01-12',
    NULL
  ),
  -- ===== ADDITIONAL POOL =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Deep Water Running',
    'Zero-impact running in deep water with flotation belts. Excellent rehab workout.',
    ARRAY['monday', 'wednesday']::weekday[],
    '12:00',
    '12:45',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Masters Swim Squad',
    'Structured training for experienced swimmers. Technique and endurance.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Kids Swim Lessons',
    'Swimming fundamentals for children ages 6-12.',
    ARRAY['saturday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Open Water Prep',
    'Triathlon and open water skills — sighting, drafting, and bilateral breathing.',
    ARRAY['sunday']::weekday[],
    '07:00',
    '08:30',
    '2025-01-12',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pool'
    ),
    'Aqua Zumba',
    'Dance party in the pool! Latin rhythms meet water resistance.',
    ARRAY['friday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-10',
    NULL
  ),
  -- ===== ADDITIONAL PILATES STUDIO =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Pilates for Back Pain',
    'Therapeutic pilates targeting lower back and spinal health.',
    ARRAY['monday', 'wednesday']::weekday[],
    '14:00',
    '15:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Advanced Reformer Flow',
    'Challenging reformer sequences for experienced practitioners.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '11:00',
    '12:00',
    '2025-02-04',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Pilates & TRX Combo',
    'Blend of mat pilates and TRX suspension training. Total body challenge.',
    ARRAY['monday', 'wednesday']::weekday[],
    '08:00',
    '09:00',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Core Blast',
    '30 minutes of pure core work — planks, crunches, and stability drills.',
    ARRAY['tuesday', 'thursday', 'saturday']::weekday[],
    '13:00',
    '13:30',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Pilates for Swimmers',
    'Shoulder mobility, core control, and rotational strength for swimmers.',
    ARRAY['friday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-10',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Pilates Studio'
    ),
    'Sunday Slow Pilates',
    'Mindful, slow-tempo pilates with extended holds. Deep work.',
    ARRAY['sunday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-12',
    NULL
  ),
  -- ===== ADDITIONAL CALISTHENICS OUTDOOR AREA =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Handstand Workshop',
    'Progressive handstand training — wall drills to freestanding holds.',
    ARRAY['friday']::weekday[],
    '08:00',
    '09:30',
    '2025-01-10',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Sunrise Mobility Flow',
    'Dynamic stretching and animal flow movements in the fresh morning air.',
    ARRAY['monday', 'wednesday', 'friday']::weekday[],
    '07:00',
    '07:45',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Weighted Calisthenics',
    'Dips, pull-ups, and push-ups with added weight. Strength-focused.',
    ARRAY['monday', 'wednesday']::weekday[],
    '12:00',
    '13:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Rings & Bars',
    'Gymnastics rings and bar skills — muscle-ups, levers, and skin the cats.',
    ARRAY['thursday']::weekday[],
    '16:00',
    '17:30',
    '2025-01-09',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Obstacle Course Training',
    'Spartan/Tough Mudder prep — climbing, crawling, jumping, and carrying.',
    ARRAY['saturday']::weekday[],
    '12:00',
    '13:30',
    '2025-01-11',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Calisthenics Outdoor Area'
    ),
    'Outdoor HIIT Circuit',
    'Bodyweight HIIT using the outdoor stations. No equipment needed.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '06:00',
    '06:45',
    '2025-02-04',
    NULL
  ),
  -- ===== ADDITIONAL HYROX TRAINING AREA =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Ski Erg Technique Lab',
    'Perfect your ski erg form. Pacing strategies for race day.',
    ARRAY['monday']::weekday[],
    '10:00',
    '10:45',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Sled Push Masterclass',
    'Technique, body positioning, and pacing for the sled push station.',
    ARRAY['wednesday']::weekday[],
    '10:00',
    '10:45',
    '2025-01-08',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Sandbag Lunges Clinic',
    'Build lunge endurance and technique for the Hyrox sandbag carry.',
    ARRAY['tuesday']::weekday[],
    '15:00',
    '15:45',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Rowing Power',
    'Rowing technique and erg intervals. Short, sharp, and effective.',
    ARRAY['thursday', 'saturday']::weekday[],
    '07:00',
    '07:45',
    '2025-01-09',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Burpee Broad Jump Drills',
    'Improve your BBJ efficiency with technique work and conditioning.',
    ARRAY['monday', 'wednesday']::weekday[],
    '15:00',
    '15:45',
    '2025-02-03',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Hyrox Open Workout',
    'Self-directed Hyrox training with coach guidance. Pick your weakness.',
    ARRAY['sunday']::weekday[],
    '08:00',
    '09:30',
    '2025-01-12',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'AMRAP Madness',
    'As Many Rounds As Possible — mixed modality, clock is ticking.',
    ARRAY['tuesday', 'friday']::weekday[],
    '08:00',
    '08:45',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Farmers Walk & Carry',
    'Grip and loaded carry variations. Functional strength at its purest.',
    ARRAY['wednesday']::weekday[],
    '16:00',
    '16:45',
    '2025-02-05',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Hyrox Training Area'
    ),
    'Endurance Engine',
    'Long chipper-style workout mixing running, rowing, and ski erg.',
    ARRAY['saturday']::weekday[],
    '15:00',
    '16:30',
    '2025-01-11',
    NULL
  ),
  -- ===== ADDITIONAL DANCE STUDIO =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Bollywood Dance Fitness',
    'Energetic Bollywood-inspired choreography. Colourful and fun.',
    ARRAY['monday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'K-Pop Dance',
    'Learn iconic K-Pop choreography and perform as a group.',
    ARRAY['wednesday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-08',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Reggaeton Burn',
    'Latin urban dance fitness — perreo meets cardio.',
    ARRAY['thursday']::weekday[],
    '19:30',
    '20:15',
    '2025-02-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Dance Technique Basics',
    'Foundations of movement — posture, rhythm, coordination, and expression.',
    ARRAY['tuesday']::weekday[],
    '10:00',
    '11:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Ballet Barre',
    'Classical ballet technique at the barre. Grace, strength, and poise.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '08:00',
    '09:00',
    '2025-01-07',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Jazz Dance',
    'Classic jazz technique with high-energy combos. Leaps and turns included.',
    ARRAY['wednesday']::weekday[],
    '16:00',
    '17:00',
    '2025-02-05',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Dance Studio'
    ),
    'Capoeira Fitness',
    'Brazilian martial art meets dance. Ginga, kicks, and acrobatics.',
    ARRAY['saturday']::weekday[],
    '09:00',
    '10:00',
    '2025-01-11',
    NULL
  ),
  -- ===== ADDITIONAL YOGA STUDIO =====
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Hatha Yoga Basics',
    'Traditional hatha poses with focus on alignment and breathwork. Beginners welcome.',
    ARRAY['tuesday', 'thursday']::weekday[],
    '07:00',
    '08:00',
    '2025-02-04',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Yoga Nidra',
    'Guided yogic sleep meditation. Deep relaxation and stress relief.',
    ARRAY['wednesday']::weekday[],
    '20:00',
    '21:00',
    '2025-01-08',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Acro Yoga Partners',
    'Partner-based acro yoga — flying, basing, and spotting fundamentals.',
    ARRAY['saturday']::weekday[],
    '14:00',
    '15:30',
    '2025-02-01',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Rocket Yoga',
    'Fast-paced, dynamic Ashtanga-derived flow. Arm balances and inversions.',
    ARRAY['monday', 'friday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-06',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Yoga for Climbers',
    'Finger, wrist, and shoulder mobility with hip openers for climbers.',
    ARRAY['wednesday']::weekday[],
    '17:00',
    '18:00',
    '2025-01-08',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Breathwork & Cold Exposure',
    'Wim Hof inspired breathing techniques and mindset training.',
    ARRAY['saturday']::weekday[],
    '11:00',
    '12:00',
    '2025-02-01',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Restorative Yoga',
    'Prop-supported poses held for 5+ minutes. Total nervous system reset.',
    ARRAY['sunday']::weekday[],
    '17:00',
    '18:15',
    '2025-01-12',
    NULL
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    ),
    (
      SELECT
        id
      FROM
        rooms
      WHERE
        name = 'Yoga Studio'
    ),
    'Yoga Dance Fusion',
    'Creative blend of yoga flows and dance movement. Expressive and freeing.',
    ARRAY['monday']::weekday[],
    '10:00',
    '11:00',
    '2025-02-03',
    NULL
  )
ON CONFLICT DO NOTHING;

-- Seed banner images — one individual image per course template
-- ===== SPINNING / INDOOR CYCLING =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
WHERE
  name = 'Early Bird Spin';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Spin & Burn';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE
  name = 'Endurance Ride';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Power Cycling';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800'
WHERE
  name = 'Lunchtime Spin Express';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1517649281203-dad836b5e5a4?w=800'
WHERE
  name = 'Saturday Spin Party';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1508880871954-f9b85dba8f42?w=800'
WHERE
  name = 'Candlelight Spin';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
WHERE
  name = 'Hill Climb Challenge';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Recovery Spin';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE
  name = 'Sprint Intervals';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800'
WHERE
  name = 'Rhythm Ride';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Spin & Stretch';

-- ===== BOXING / KICKBOXING =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
WHERE
  name = 'Boxing Basics';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1552072805-7dd2eab1eda6?w=800'
WHERE
  name = 'Kickboxing Cardio';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Fight Conditioning';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
WHERE
  name = 'Boxing Sparring Open';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1552072805-7dd2eab1eda6?w=800'
WHERE
  name = 'Heavy Bag HIIT';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
WHERE
  name = 'Boxing for Beginners';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Outdoor Boxing Drills';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1552072805-7dd2eab1eda6?w=800'
WHERE
  name = 'Womens Boxing';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
WHERE
  name = 'Boxing Conditioning';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1552072805-7dd2eab1eda6?w=800'
WHERE
  name = 'Pad Work Masterclass';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
WHERE
  name = 'Boxing Footwork Clinic';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1552072805-7dd2eab1eda6?w=800'
WHERE
  name = 'Sunday Open Gym Boxing';

-- ===== SWIMMING / AQUA =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
WHERE
  name = 'Aqua Aerobics';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800'
WHERE
  name = 'Swim Technique';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800'
WHERE
  name = 'Aqua Power';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
WHERE
  name = 'Lap Swimming Club';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800'
WHERE
  name = 'Water Polo Introduction';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800'
WHERE
  name = 'Aqua Yoga';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
WHERE
  name = 'Deep Water Running';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800'
WHERE
  name = 'Masters Swim Squad';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800'
WHERE
  name = 'Kids Swim Lessons';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
WHERE
  name = 'Open Water Prep';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800'
WHERE
  name = 'Aqua Zumba';

-- ===== PILATES (MAT) =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Morning Mat Pilates';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Power Pilates';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Pilates for Runners';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Prenatal Pilates';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Pilates for Back Pain';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Pilates & TRX Combo';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Core Blast';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Pilates for Swimmers';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Sunday Slow Pilates';

-- ===== PILATES (REFORMER / BARRE) =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Reformer Pilates';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Advanced Reformer Flow';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'
WHERE
  name = 'Barre Fusion';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Stretch & Restore';

-- ===== YOGA =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Morning Yoga Flow';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Yin Yoga';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Hot Power Yoga';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE
  name = 'Sunset Stretch & Restore';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Yoga for Athletes';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Ashtanga Yoga';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Hatha Yoga Basics';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Acro Yoga Partners';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Rocket Yoga';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Yoga for Climbers';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE
  name = 'Restorative Yoga';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'
WHERE
  name = 'Yoga Dance Fusion';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Sunrise Yoga';

-- ===== MEDITATION / BREATHWORK =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800'
WHERE
  name = 'Yoga Nidra';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Sunday Meditation & Breathwork';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800'
WHERE
  name = 'Breathwork & Cold Exposure';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name = 'Mobility & Recovery';

-- ===== OUTDOOR CALISTHENICS / BOOT CAMP =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Boot Camp';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Calisthenics Fundamentals';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE
  name = 'Weekend Warrior Circuit';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Street Workout';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Outdoor Strength & Conditioning';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Weighted Calisthenics';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Outdoor HIIT Circuit';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Obstacle Course Training';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name = 'Sunrise Mobility Flow';

-- ===== GYMNASTICS / BODYWEIGHT SKILLS =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Pull-Up Progressions';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Handstand Workshop';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Rings & Bars';

-- ===== HYROX / FUNCTIONAL FITNESS =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Hyrox Race Prep';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
WHERE
  name = 'Functional Strength';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Wall Ball Madness';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Hyrox Doubles Training';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Functional Fitness WOD';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Tabata Blast';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Hyrox Open Workout';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE
  name = 'AMRAP Madness';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1541534260-64898e44af73?w=800'
WHERE
  name = 'Endurance Engine';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Friday Night Throwdown';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Burpee Broad Jump Drills';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1541534260-64898e44af73?w=800'
WHERE
  name = 'Sled & Erg Intervals';

-- ===== KETTLEBELL / STRONGMAN / LOADED CARRIES =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=800'
WHERE
  name = 'Kettlebell Fury';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Strongman Saturday';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=800'
WHERE
  name = 'Farmers Walk & Carry';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Sandbag Lunges Clinic';

-- ===== ROWING / SKI ERG / SLED =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1541534260-64898e44af73?w=800'
WHERE
  name = 'Rowing Power';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name = 'Ski Erg Technique Lab';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800'
WHERE
  name = 'Sled Push Masterclass';

-- ===== DANCE (LATIN, AFRO, BOLLYWOOD, K-POP) =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name = 'Zumba Party';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'
WHERE
  name = 'Latin Dance Fitness';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name = 'Dance Cardio Express';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'
WHERE
  name = 'Afro Dance Fitness';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name = 'Friday Night Dance Party';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'
WHERE
  name = 'Bollywood Dance Fitness';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name = 'K-Pop Dance';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'
WHERE
  name = 'Reggaeton Burn';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name = 'Dance Technique Basics';

-- ===== HIP HOP / URBAN / CONTEMPORARY / JAZZ =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'
WHERE
  name = 'Hip Hop Fitness';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name = 'Contemporary Dance';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'
WHERE
  name = 'Jazz Dance';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800'
WHERE
  name = 'Capoeira Fitness';

-- ===== BALLET =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'
WHERE
  name = 'Ballet Barre';

-- ===== AEROBICS / GROUP WEIGHTS =====
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name = 'Step Aerobics';

UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name = 'Body Pump';
