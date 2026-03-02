INSERT INTO
  course_templates (
    trainer_id,
    room_id,
    name,
    description,
    banner_image_url,
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
    'https://images.pexels.com/photos/8766379/pexels-photo-8766379.jpeg',
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
    'https://images.pexels.com/photos/13896069/pexels-photo-13896069.jpeg',
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
    'https://images.pexels.com/photos/14616296/pexels-photo-14616296.jpeg',
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
    'https://images.pexels.com/photos/6388524/pexels-photo-6388524.jpeg',
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
    'https://images.pexels.com/photos/4853858/pexels-photo-4853858.jpeg',
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
    'https://images.pexels.com/photos/5851030/pexels-photo-5851030.jpeg',
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
    'https://images.pexels.com/photos/8736743/pexels-photo-8736743.jpeg',
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
    'https://images.pexels.com/photos/2628210/pexels-photo-2628210.jpeg',
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
    'https://images.pexels.com/photos/9944849/pexels-photo-9944849.jpeg',
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
    'https://images.pexels.com/photos/9944253/pexels-photo-9944253.jpeg',
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
    'https://images.pexels.com/photos/9945069/pexels-photo-9945069.jpeg',
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
    'https://images.pexels.com/photos/8745630/pexels-photo-8745630.jpeg',
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
    'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.blog.de%2Fwp-content%2Fuploads%2F2023%2F01%2FWie-effektiv-ist-Wasser-Aerobic.jpg&f=1&nofb=1&ipt=f82886b3e9212769268718dd21ce0e9ae7af8d2591f03c69f0eb64c44a1ba670',
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
    'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg',
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
    'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.ostseetherme-usedom.de%2Fwp-content%2Fuploads%2F2025%2F05%2FMK14683A-scaled.jpg&f=1&nofb=1&ipt=f85bb0303685eff4a420a11c0a8187ac3afd09ac20dad4b75a322c7c12c60d99',
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
    'https://images.pexels.com/photos/27625146/pexels-photo-27625146.jpeg',
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
    'https://images.pexels.com/photos/2091400/pexels-photo-2091400.jpeg',
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
    'https://images.unsplash.com/photo-1558106340-87553f4cff67',
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
    'https://images.pexels.com/photos/8436939/pexels-photo-8436939.jpeg',
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
    'https://images.pexels.com/photos/868483/pexels-photo-868483.jpeg',
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
    'https://images.pexels.com/photos/8769173/pexels-photo-8769173.jpeg',
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
    'https://images.pexels.com/photos/25596677/pexels-photo-25596677.jpeg',
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
    'https://images.unsplash.com/photo-1758599881262-7b79a56ac284',
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
    'https://images.unsplash.com/photo-1758671916868-b853bc18d031',
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
    'https://images.pexels.com/photos/3756518/pexels-photo-3756518.jpeg',
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
    'https://images.pexels.com/photos/13993576/pexels-photo-13993576.jpeg',
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
    'https://images.pexels.com/photos/13993543/pexels-photo-13993543.jpeg',
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
    NULL,
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
    'https://images.unsplash.com/photo-1758521959654-17618e77e2e8',
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
    'https://images.pexels.com/photos/4945521/pexels-photo-4945521.jpeg',
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
    'https://images.pexels.com/photos/4803667/pexels-photo-4803667.jpeg',
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
    'https://images.pexels.com/photos/6999125/pexels-photo-6999125.jpeg',
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
    'https://images.unsplash.com/photo-1739283180407-21e27d5c0735',
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
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
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
    'https://images.pexels.com/photos/3253499/pexels-photo-3253499.jpeg',
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
    'https://images.unsplash.com/photo-1743993414654-0be2b73a9620',
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
    'https://img.redbull.com/images/c_crop,w_3840,h_1920,x_0,y_0/c_auto,w_1200,h_600/f_auto,q_auto/redbullcom/2024/6/10/tkatirybdfkbvuqos4pv/jake-dearden-wall-balls-station-hyrox-world-championship',
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
    'https://images.pexels.com/photos/4944437/pexels-photo-4944437.jpeg',
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
    'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg',
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
    'https://images.pexels.com/photos/7676548/pexels-photo-7676548.jpeg',
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
    'https://images.pexels.com/photos/3766211/pexels-photo-3766211.jpeg',
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
    'https://images.pexels.com/photos/3768895/pexels-photo-3768895.jpeg',
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
    'https://images.pexels.com/photos/864990/pexels-photo-864990.jpeg',
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
    'https://images.pexels.com/photos/17282676/pexels-photo-17282676.jpeg',
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
    'https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg',
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
    'https://images.pexels.com/photos/7974876/pexels-photo-7974876.jpeg',
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
    'https://images.pexels.com/photos/7974879/pexels-photo-7974879.jpeg',
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
    'https://images.pexels.com/photos/209948/pexels-photo-209948.jpeg',
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
    'https://images.unsplash.com/photo-1705965497662-b275283a2f70',
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
    'https://images.pexels.com/photos/6454061/pexels-photo-6454061.jpeg',
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
    'https://images.pexels.com/photos/4056513/pexels-photo-4056513.jpeg',
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
    'https://images.pexels.com/photos/4325478/pexels-photo-4325478.jpeg',
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
    'https://images.pexels.com/photos/3822688/pexels-photo-3822688.jpeg',
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
    'https://images.pexels.com/photos/4998815/pexels-photo-4998815.jpeg',
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
    'https://images.pexels.com/photos/8940491/pexels-photo-8940491.jpeg',
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
    'https://images.pexels.com/photos/8436762/pexels-photo-8436762.jpeg',
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
    'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.templepurohit.com%2Fwp-content%2Fuploads%2F2016%2F04%2FAshtanga-Yoga-of-Patanjali-8-Practices-of-Ashatnga-Yoga-1.jpg&f=1&nofb=1&ipt=98bf2e6f91a7e870fa0e223c177af2a81ccded1b2366ce917069153808d6a00e',
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
    'https://images.pexels.com/photos/16966336/pexels-photo-16966336.jpeg',
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
    'https://images.pexels.com/photos/7690217/pexels-photo-7690217.jpeg',
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
    'https://images.pexels.com/photos/5152546/pexels-photo-5152546.jpeg',
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
    'https://images.pexels.com/photos/1174103/pexels-photo-1174103.jpeg',
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
    'https://images.pexels.com/photos/11870826/pexels-photo-11870826.jpeg',
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
    'https://images.pexels.com/photos/7689278/pexels-photo-7689278.jpeg',
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
    'https://images.pexels.com/photos/4162595/pexels-photo-4162595.jpeg',
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
    'https://images.pexels.com/photos/7689280/pexels-photo-7689280.jpeg',
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
    'https://images.pexels.com/photos/6456203/pexels-photo-6456203.jpeg',
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
    'https://images.pexels.com/photos/6740332/pexels-photo-6740332.jpeg',
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
    'https://images.pexels.com/photos/5750750/pexels-photo-5750750.jpeg',
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
    'https://images.pexels.com/photos/8478707/pexels-photo-8478707.jpeg',
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
    'https://images.pexels.com/photos/6815669/pexels-photo-6815669.jpeg',
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
    'https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg',
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
    'https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg',
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
    'https://images.pexels.com/photos/12918939/pexels-photo-12918939.jpeg',
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
    'https://images.pexels.com/photos/19421169/pexels-photo-19421169.jpeg',
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
    'https://images.unsplash.com/photo-1541689186060-3b08be2fd22f',
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
    'https://images.pexels.com/photos/18075031/pexels-photo-18075031.jpeg',
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
    'https://images.unsplash.com/photo-1747240549807-fc3962949818',
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
    'https://images.pexels.com/photos/25599829/pexels-photo-25599829.jpeg',
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
    'https://images.pexels.com/photos/3984358/pexels-photo-3984358.jpeg',
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
    'https://images.pexels.com/photos/8957624/pexels-photo-8957624.jpeg',
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
    'https://images.pexels.com/photos/8957639/pexels-photo-8957639.jpeg',
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
    'https://images.pexels.com/photos/5369001/pexels-photo-5369001.jpeg',
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
    'https://images.pexels.com/photos/4804320/pexels-photo-4804320.jpeg',
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
    'https://i.shgcdn.com/923ea405-3f2b-4949-a081-604f5ffb2d88/-/format/auto/-/preview/3000x3000/-/quality/lighter/',
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
    'https://images.unsplash.com/photo-1758875569994-b87ab600f647',
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
    'https://images.pexels.com/photos/36182422/pexels-photo-36182422.jpeg',
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
    'https://images.pexels.com/photos/6295978/pexels-photo-6295978.jpeg',
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
    'https://images.unsplash.com/photo-1614091245298-3effbd8ed161',
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
    'https://images.unsplash.com/photo-1757147517623-ee9a76c9ead2',
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
    'https://images.unsplash.com/photo-1632167764165-74a3d686e9f8',
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
    'https://images.pexels.com/photos/7690207/pexels-photo-7690207.jpeg',
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
    'https://images.unsplash.com/photo-1600677396341-16965cbe9224',
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
    'https://images.unsplash.com/photo-1757147517535-d0d9f4cd5b28',
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
    'https://images.unsplash.com/photo-1743993414579-9ad1bb84038b',
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
    'https://images.unsplash.com/photo-1757147517573-2521839225c8',
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
    'https://images.unsplash.com/photo-1743993414579-9ad1bb84038b',
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
    'https://images.unsplash.com/photo-1547106510-6aec13ee41ff',
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
    'https://images.unsplash.com/photo-1604942629278-a9dbe21428f6',
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
    'https://images.unsplash.com/photo-1714738045959-3bd0634bdce2',
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
    'https://images.unsplash.com/photo-1537365587684-f490102e1225',
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
    'https://images.unsplash.com/photo-1659549450821-bd7d6776b1e6',
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
    'https://images.unsplash.com/photo-1550026593-f369f98df0af',
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
    'https://images.unsplash.com/photo-1568022877651-c8817c039fe6',
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
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
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
    'https://images.unsplash.com/photo-1602192509154-0b900ee1f851',
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
    'https://images.unsplash.com/photo-1758274537594-ae71243befa5',
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
    'https://images.unsplash.com/photo-1766069565396-b63c9254bbf0',
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
    'http://images.unsplash.com/photo-1758274536275-a0abbcf45300',
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
    'https://images.unsplash.com/photo-1737993705699-f71abda85ef5',
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
    'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3',
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
    'https://images.unsplash.com/photo-1557512724-931547195611',
    ARRAY['monday']::weekday[],
    '10:00',
    '11:00',
    '2025-02-03',
    NULL
  )
ON CONFLICT DO NOTHING;
