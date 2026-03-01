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

-- Seed banner images for all course templates, matched to course category
-- Spinning / Indoor Cycling
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
WHERE
  name IN (
    'Early Bird Spin',
    'Spin & Burn',
    'Endurance Ride',
    'Power Cycling',
    'Lunchtime Spin Express',
    'Saturday Spin Party',
    'Candlelight Spin',
    'Hill Climb Challenge',
    'Recovery Spin',
    'Sprint Intervals',
    'Rhythm Ride',
    'Spin & Stretch'
  );

-- Boxing / Kickboxing
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1549719312-75785eb2d6b0?w=800'
WHERE
  name IN (
    'Boxing Basics',
    'Kickboxing Cardio',
    'Fight Conditioning',
    'Boxing Sparring Open',
    'Heavy Bag HIIT',
    'Boxing for Beginners',
    'Outdoor Boxing Drills',
    'Womens Boxing',
    'Boxing Conditioning',
    'Pad Work Masterclass',
    'Boxing Footwork Clinic',
    'Sunday Open Gym Boxing'
  );

-- Swimming / Aqua
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
WHERE
  name IN (
    'Aqua Aerobics',
    'Swim Technique',
    'Aqua Power',
    'Lap Swimming Club',
    'Water Polo Introduction',
    'Aqua Yoga',
    'Deep Water Running',
    'Masters Swim Squad',
    'Kids Swim Lessons',
    'Open Water Prep',
    'Aqua Zumba'
  );

-- Pilates (mat and general)
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
WHERE
  name IN (
    'Morning Mat Pilates',
    'Power Pilates',
    'Pilates for Runners',
    'Prenatal Pilates',
    'Pilates for Back Pain',
    'Pilates & TRX Combo',
    'Core Blast',
    'Pilates for Swimmers',
    'Sunday Slow Pilates'
  );

-- Pilates (reformer / barre)
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
WHERE
  name IN (
    'Reformer Pilates',
    'Advanced Reformer Flow',
    'Barre Fusion',
    'Stretch & Restore'
  );

-- Yoga
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
WHERE
  name IN (
    'Morning Yoga Flow',
    'Yin Yoga',
    'Hot Power Yoga',
    'Sunset Stretch & Restore',
    'Yoga for Athletes',
    'Ashtanga Yoga',
    'Hatha Yoga Basics',
    'Acro Yoga Partners',
    'Rocket Yoga',
    'Yoga for Climbers',
    'Restorative Yoga',
    'Yoga Dance Fusion',
    'Sunrise Yoga'
  );

-- Meditation / Breathwork
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1545389336-cf090fa865b8?w=800'
WHERE
  name IN (
    'Yoga Nidra',
    'Sunday Meditation & Breathwork',
    'Breathwork & Cold Exposure',
    'Mobility & Recovery'
  );

-- Outdoor Calisthenics / Boot Camp
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
WHERE
  name IN (
    'Boot Camp',
    'Calisthenics Fundamentals',
    'Weekend Warrior Circuit',
    'Street Workout',
    'Outdoor Strength & Conditioning',
    'Weighted Calisthenics',
    'Outdoor HIIT Circuit',
    'Obstacle Course Training',
    'Sunrise Mobility Flow'
  );

-- Gymnastics / Bodyweight Skills (pull-ups, handstands, rings)
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1580086319284-3328b1d61b45?w=800'
WHERE
  name IN (
    'Pull-Up Progressions',
    'Handstand Workshop',
    'Rings & Bars'
  );

-- Hyrox / Functional Fitness / CrossFit
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
WHERE
  name IN (
    'Hyrox Race Prep',
    'Functional Strength',
    'Wall Ball Madness',
    'Hyrox Doubles Training',
    'Functional Fitness WOD',
    'Tabata Blast',
    'Hyrox Open Workout',
    'AMRAP Madness',
    'Endurance Engine',
    'Friday Night Throwdown',
    'Burpee Broad Jump Drills',
    'Sled & Erg Intervals'
  );

-- Kettlebell / Strongman / Loaded Carries
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1549576490-b0332880b21f?w=800'
WHERE
  name IN (
    'Kettlebell Fury',
    'Strongman Saturday',
    'Farmers Walk & Carry',
    'Sandbag Lunges Clinic'
  );

-- Rowing / Ski Erg
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1541534260-64898e44af73?w=800'
WHERE
  name IN (
    'Rowing Power',
    'Ski Erg Technique Lab',
    'Sled Push Masterclass'
  );

-- Dance (Latin, Afro, hip hop, contemporary, general)
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE
  name IN (
    'Zumba Party',
    'Latin Dance Fitness',
    'Dance Cardio Express',
    'Afro Dance Fitness',
    'Friday Night Dance Party',
    'Bollywood Dance Fitness',
    'K-Pop Dance',
    'Reggaeton Burn',
    'Dance Technique Basics'
  );

-- Hip Hop / Urban Dance
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1535525153316-2d8dba50e5b6?w=800'
WHERE
  name IN (
    'Hip Hop Fitness',
    'Contemporary Dance',
    'Jazz Dance',
    'Capoeira Fitness'
  );

-- Ballet / Barre (dance)
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'
WHERE
  name = 'Ballet Barre';

-- Aerobics / Step / Group Weights
UPDATE course_templates
SET
  banner_image_url = 'https://images.unsplash.com/photo-1524594081293-190a1c8c7b6d?w=800'
WHERE
  name IN ('Step Aerobics', 'Body Pump');
