INSERT INTO
  subscriptions (
    member_id,
    plan_id,
    start_date,
    end_date,
    created_at
  )
SELECT
  m.id,
  p.id,
  start_date,
  end_date,
  start_date::timestamptz
FROM
  (
    VALUES
      -- Active subscriptions (no end_date, started in the past)
      (1, 1, CURRENT_DATE - INTERVAL '45 days', NULL), -- admin: Flex Gym Basic, active for 45 days
      (2, 12, CURRENT_DATE - INTERVAL '8 months', NULL), -- Lena: All-In 12M, 8 months in
      (3, 6, CURRENT_DATE - INTERVAL '3 months', NULL), -- Jonas: Gym Basic 12M, 3 months in
      (4, 9, CURRENT_DATE - INTERVAL '6 months', NULL), -- Maria: Gym + Courses 12M, 6 months in
      (5, 3, CURRENT_DATE - INTERVAL '2 months', NULL), -- Lukas: Flex All-In, 2 months active
      (7, 8, CURRENT_DATE - INTERVAL '4 months', NULL), -- Tim: Gym + Courses 6M, 4 months in
      (8, 11, CURRENT_DATE - INTERVAL '2 months', NULL), -- Hannah: All-In 6M, 2 months in
      (9, 5, CURRENT_DATE - INTERVAL '5 months', NULL), -- Max: Gym Basic 6M, 5 months in
      (11, 22, CURRENT_DATE - INTERVAL '4 months', NULL), -- Paul: Personal Training Pro 6M, 4 months in
      (13, 2, CURRENT_DATE - INTERVAL '1 month', NULL), -- Ben: Flex Gym Plus, 1 month active
      (15, 14, CURRENT_DATE - INTERVAL '2 months', NULL), -- Nico: Student Courses, 2 months in
      (17, 6, CURRENT_DATE - INTERVAL '9 months', NULL), -- Daniel: Gym Basic 12M, 9 months in
      (19, 12, CURRENT_DATE - INTERVAL '10 months', NULL), -- Felix: All-In 12M, 10 months in
      (21, 1, CURRENT_DATE - INTERVAL '15 days', NULL), -- Tom: Flex Gym Basic, 15 days active
      (23, 7, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jan: Gym + Courses 3M, 2 months in
      (25, 24, CURRENT_DATE - INTERVAL '11 months', NULL), -- Leon: Corporate Basic 12M, 11 months in
      (26, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Anna: Gym Basic 3M, 2 months in
      (28, 10, CURRENT_DATE - INTERVAL '1 month', NULL), -- Julia: All-In 3M, 1 month in
      (30, 15, CURRENT_DATE - INTERVAL '1 month', NULL), -- Lisa: Student All-In, 1 month in
      (32, 3, CURRENT_DATE - INTERVAL '20 days', NULL), -- Laura: Flex All-In, 20 days active
      (34, 9, CURRENT_DATE - INTERVAL '7 months', NULL), -- Nina: Gym + Courses 12M, 7 months in
      (36, 11, CURRENT_DATE - INTERVAL '3 months', NULL), -- Julia: All-In 6M, 3 months in
      (38, 5, CURRENT_DATE - INTERVAL '4 months', NULL), -- Emma: Gym Basic 6M, 4 months in
      (40, 16, CURRENT_DATE - INTERVAL '25 days', NULL), -- Katharina: Senior Gym Basic, 25 days active
      (42, 2, CURRENT_DATE - INTERVAL '2 months', NULL), -- Sophie: Flex Gym Plus, 2 months active
      (44, 12, CURRENT_DATE - INTERVAL '5 months', NULL), -- Marie: All-In 12M, 5 months in
      (46, 7, CURRENT_DATE - INTERVAL '1 month', NULL), -- Elena: Gym + Courses 3M, 1 month in
      (48, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jana: Gym Basic 3M, 2 months in
      (50, 21, CURRENT_DATE - INTERVAL '2 months', NULL), -- Vanessa: Personal Training Starter 3M, 2 months in
      (52, 6, CURRENT_DATE - INTERVAL '8 months', NULL), -- Melanie: Gym Basic 12M, 8 months in
      (54, 9, CURRENT_DATE - INTERVAL '3 months', NULL), -- Jennifer: Gym + Courses 12M, 3 months in
      (56, 1, CURRENT_DATE - INTERVAL '10 days', NULL), -- Sabrina: Flex Gym Basic, 10 days active
      (58, 11, CURRENT_DATE - INTERVAL '4 months', NULL), -- Andrea: All-In 6M, 4 months in
      (60, 14, CURRENT_DATE - INTERVAL '1 month', NULL), -- Christina: Student Courses, 1 month in
      (62, 3, CURRENT_DATE - INTERVAL '1 month', NULL), -- Marcel: Flex All-In, 1 month active
      (64, 6, CURRENT_DATE - INTERVAL '6 months', NULL), -- Jasmin: Gym Basic 12M, 6 months in
      (66, 12, CURRENT_DATE - INTERVAL '9 months', NULL), -- Tanja: All-In 12M, 9 months in
      (68, 8, CURRENT_DATE - INTERVAL '5 months', NULL), -- Sandra: Gym + Courses 6M, 5 months in
      (70, 2, CURRENT_DATE - INTERVAL '3 months', NULL), -- Daniela: Flex Gym Plus, 3 months active
      (72, 10, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jessica: All-In 3M, 2 months in
      (74, 13, CURRENT_DATE - INTERVAL '1 month', NULL), -- Sabine: Student Gym Basic, 1 month in
      (76, 5, CURRENT_DATE - INTERVAL '3 months', NULL), -- Petra: Gym Basic 6M, 3 months in
      (78, 11, CURRENT_DATE - INTERVAL '1 month', NULL), -- Anke: All-In 6M, 1 month in
      (80, 1, CURRENT_DATE - INTERVAL '5 days', NULL), -- Monika: Flex Gym Basic, 5 days active
      (82, 6, CURRENT_DATE - INTERVAL '10 months', NULL), -- Kerstin: Gym Basic 12M, 10 months in
      (84, 17, CURRENT_DATE - INTERVAL '15 days', NULL), -- Martina: Senior Courses, 15 days active
      (86, 3, CURRENT_DATE - INTERVAL '2 months', NULL), -- Claudia: Flex All-In, 2 months active
      (88, 9, CURRENT_DATE - INTERVAL '4 months', NULL), -- Birgit: Gym + Courses 12M, 4 months in
      (90, 7, CURRENT_DATE - INTERVAL '1 month', NULL), -- Anja: Gym + Courses 3M, 1 month in
      (92, 12, CURRENT_DATE - INTERVAL '7 months', NULL), -- Silke: All-In 12M, 7 months in
      (94, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Simone: Gym Basic 3M, 2 months in
      (96, 22, CURRENT_DATE - INTERVAL '5 months', NULL), -- Susanne: Personal Training Pro 6M, 5 months in
      (98, 2, CURRENT_DATE - INTERVAL '1 month', NULL), -- Doris: Flex Gym Plus, 1 month active
      -- Cancelled subscriptions (end_date in the future, still active until then)
      (
        6,
        5,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Sophie: Gym Basic 6M, cancelled, ends next month
      (
        10,
        11,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Lea: All-In 6M, cancelled, ends next month
      (
        12,
        9,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Juliane: Gym + Courses 12M, cancelled, ends next month
      (
        14,
        6,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Emily: Gym Basic 12M, cancelled, ends next month
      (
        16,
        8,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Lara: Gym + Courses 6M, cancelled, ends next month
      (
        18,
        12,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Sarah: All-In 12M, cancelled, ends in 2 months
      (
        20,
        7,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Mila: Gym + Courses 3M, cancelled, ends next month
      (
        22,
        10,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Nora: All-In 3M, cancelled, ends next month
      (
        24,
        4,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Clara: Gym Basic 3M, cancelled, ends next month
      (
        27,
        8,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Marco: Gym + Courses 6M, cancelled, ends next month
      (
        29,
        6,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- David: Gym Basic 12M, cancelled, ends in 2 months
      (
        31,
        11,
        CURRENT_DATE - INTERVAL '4 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Simon: All-In 6M, cancelled, ends in 2 months
      (
        33,
        9,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE + INTERVAL '4 months'
      ), -- Alexander: Gym + Courses 12M, cancelled, ends in 4 months
      (
        35,
        5,
        CURRENT_DATE - INTERVAL '4 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Philip: Gym Basic 6M, cancelled, ends in 2 months
      (
        37,
        12,
        CURRENT_DATE - INTERVAL '9 months',
        CURRENT_DATE + INTERVAL '3 months'
      ), -- Sebastian: All-In 12M, cancelled, ends in 3 months
      (
        39,
        7,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Florian: Gym + Courses 3M, cancelled, ends next month
      (
        41,
        10,
        CURRENT_DATE - INTERVAL '1 month',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Moritz: All-In 3M, cancelled, ends in 2 months
      (
        43,
        4,
        CURRENT_DATE - INTERVAL '1 month',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Tobias: Gym Basic 3M, cancelled, ends in 2 months
      (
        45,
        8,
        CURRENT_DATE - INTERVAL '3 months',
        CURRENT_DATE + INTERVAL '3 months'
      ), -- Chris: Gym + Courses 6M, cancelled, ends in 3 months
      (
        47,
        6,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE + INTERVAL '4 months'
      ), -- Robin: Gym Basic 12M, cancelled, ends in 4 months
      -- Ended subscriptions (end_date in the past, subscription fully expired)
      (
        49,
        4,
        CURRENT_DATE - INTERVAL '7 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Oliver: Gym Basic 3M, ended 4 months ago
      (
        51,
        7,
        CURRENT_DATE - INTERVAL '9 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Fabian: Gym + Courses 3M, ended 6 months ago
      (
        53,
        10,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Dennis: All-In 3M, ended 5 months ago
      (
        55,
        5,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Stefan: Gym Basic 6M, ended 5 months ago
      (
        57,
        8,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Patrick: Gym + Courses 6M, ended 4 months ago
      (
        59,
        11,
        CURRENT_DATE - INTERVAL '12 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Matthias: All-In 6M, ended 6 months ago
      (
        61,
        6,
        CURRENT_DATE - INTERVAL '18 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Dominik: Gym Basic 12M, ended 6 months ago
      (
        63,
        9,
        CURRENT_DATE - INTERVAL '18 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Nicole: Gym + Courses 12M, ended 6 months ago
      (
        65,
        12,
        CURRENT_DATE - INTERVAL '20 months',
        CURRENT_DATE - INTERVAL '8 months'
      ), -- Christian: All-In 12M, ended 8 months ago
      (
        67,
        4,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE - INTERVAL '2 months'
      ), -- Kevin: Gym Basic 3M, ended 2 months ago
      (
        69,
        7,
        CURRENT_DATE - INTERVAL '6 months',
        CURRENT_DATE - INTERVAL '3 months'
      ), -- Manuel: Gym + Courses 3M, ended 3 months ago
      (
        71,
        5,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Thomas: Gym Basic 6M, ended 4 months ago
      (
        73,
        10,
        CURRENT_DATE - INTERVAL '7 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Markus: All-In 3M, ended 4 months ago
      (
        75,
        6,
        CURRENT_DATE - INTERVAL '15 months',
        CURRENT_DATE - INTERVAL '3 months'
      ), -- Michael: Gym Basic 12M, ended 3 months ago
      (
        77,
        8,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Rene: Gym + Courses 6M, ended 5 months ago
      (
        79,
        11,
        CURRENT_DATE - INTERVAL '13 months',
        CURRENT_DATE - INTERVAL '7 months'
      ), -- Sven: All-In 6M, ended 7 months ago
      (
        81,
        9,
        CURRENT_DATE - INTERVAL '17 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Andreas: Gym + Courses 12M, ended 5 months ago
      (
        83,
        4,
        CURRENT_DATE - INTERVAL '6 months',
        CURRENT_DATE - INTERVAL '3 months'
      ), -- Jens: Gym Basic 3M, ended 3 months ago
      (
        85,
        12,
        CURRENT_DATE - INTERVAL '19 months',
        CURRENT_DATE - INTERVAL '7 months'
      ), -- Heiko: All-In 12M, ended 7 months ago
      (
        87,
        7,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Frank: Gym + Courses 3M, ended 5 months ago
      -- Future subscriptions (start_date in the future, will begin later)
      (
        10,
        12,
        CURRENT_DATE + INTERVAL '1 month' + INTERVAL '1 day',
        NULL
      ), -- Lea: All-In 12M future subscription (after current ends)
      (
        12,
        6,
        CURRENT_DATE + INTERVAL '1 month' + INTERVAL '1 day',
        NULL
      ), -- Juliane: Gym Basic 12M future subscription
      (
        14,
        9,
        CURRENT_DATE + INTERVAL '1 month' + INTERVAL '1 day',
        NULL
      ), -- Emily: Gym + Courses 12M future subscription
      (
        18,
        11,
        CURRENT_DATE + INTERVAL '2 months' + INTERVAL '1 day',
        NULL
      ), -- Sarah: All-In 6M future subscription
      (
        20,
        4,
        CURRENT_DATE + INTERVAL '1 month' + INTERVAL '1 day',
        NULL
      ), -- Mila: Gym Basic 3M future subscription
      (
        22,
        11,
        CURRENT_DATE + INTERVAL '1 month' + INTERVAL '1 day',
        NULL
      ), -- Nora: All-In 6M future subscription
      (
        24,
        5,
        CURRENT_DATE + INTERVAL '1 month' + INTERVAL '1 day',
        NULL
      ), -- Clara: Gym Basic 6M future subscription
      (
        29,
        9,
        CURRENT_DATE + INTERVAL '2 months' + INTERVAL '1 day',
        NULL
      ), -- David: Gym + Courses 12M future subscription
      (
        33,
        12,
        CURRENT_DATE + INTERVAL '4 months' + INTERVAL '1 day',
        NULL
      ), -- Alexander: All-In 12M future subscription
      (
        37,
        6,
        CURRENT_DATE + INTERVAL '3 months' + INTERVAL '1 day',
        NULL
      ), -- Sebastian: Gym Basic 12M future subscription
      (
        41,
        11,
        CURRENT_DATE + INTERVAL '2 months' + INTERVAL '1 day',
        NULL
      ), -- Moritz: All-In 6M future subscription
      (
        45,
        9,
        CURRENT_DATE + INTERVAL '3 months' + INTERVAL '1 day',
        NULL
      ), -- Chris: Gym + Courses 12M future subscription
      -- Active subscriptions (~55 members, no end_date)
      (101, 1, CURRENT_DATE - INTERVAL '30 days', NULL), -- Hendrik: Flex Gym Basic
      (102, 12, CURRENT_DATE - INTERVAL '7 months', NULL), -- Ingrid: All-In 12M
      (103, 6, CURRENT_DATE - INTERVAL '4 months', NULL), -- Kai: Gym Basic 12M
      (104, 9, CURRENT_DATE - INTERVAL '5 months', NULL), -- Carolin: Gym + Courses 12M
      (105, 3, CURRENT_DATE - INTERVAL '3 months', NULL), -- Torsten: Flex All-In
      (106, 8, CURRENT_DATE - INTERVAL '2 months', NULL), -- Verena: Gym + Courses 6M
      (107, 11, CURRENT_DATE - INTERVAL '1 month', NULL), -- Steffen: All-In 6M
      (108, 5, CURRENT_DATE - INTERVAL '4 months', NULL), -- Katja: Gym Basic 6M
      (109, 22, CURRENT_DATE - INTERVAL '3 months', NULL), -- Volker: Personal Training Pro 6M
      (110, 2, CURRENT_DATE - INTERVAL '2 months', NULL), -- Britta: Flex Gym Plus
      (111, 14, CURRENT_DATE - INTERVAL '1 month', NULL), -- Ralph: Student Courses
      (112, 6, CURRENT_DATE - INTERVAL '8 months', NULL), -- Diana: Gym Basic 12M
      (113, 12, CURRENT_DATE - INTERVAL '9 months', NULL), -- Guenter: All-In 12M
      (114, 1, CURRENT_DATE - INTERVAL '20 days', NULL), -- Heike: Flex Gym Basic
      (115, 7, CURRENT_DATE - INTERVAL '2 months', NULL), -- Joerg: Gym + Courses 3M
      (
        116,
        24,
        CURRENT_DATE - INTERVAL '10 months',
        NULL
      ), -- Ute: Corporate Basic 12M
      (117, 4, CURRENT_DATE - INTERVAL '1 month', NULL), -- Norbert: Gym Basic 3M
      (118, 10, CURRENT_DATE - INTERVAL '2 months', NULL), -- Elke: All-In 3M
      (119, 15, CURRENT_DATE - INTERVAL '3 months', NULL), -- Lars: Student All-In
      (120, 3, CURRENT_DATE - INTERVAL '25 days', NULL), -- Margit: Flex All-In
      (121, 9, CURRENT_DATE - INTERVAL '6 months', NULL), -- Stefan R: Gym + Courses 12M
      (122, 11, CURRENT_DATE - INTERVAL '4 months', NULL), -- Petra L: All-In 6M
      (123, 5, CURRENT_DATE - INTERVAL '3 months', NULL), -- Axel: Gym Basic 6M
      (124, 16, CURRENT_DATE - INTERVAL '15 days', NULL), -- Renate: Senior Gym Basic
      (125, 2, CURRENT_DATE - INTERVAL '1 month', NULL), -- Klaus: Flex Gym Plus
      (126, 12, CURRENT_DATE - INTERVAL '6 months', NULL), -- Ines: All-In 12M
      (127, 7, CURRENT_DATE - INTERVAL '2 months', NULL), -- Gerd: Gym + Courses 3M
      (128, 4, CURRENT_DATE - INTERVAL '1 month', NULL), -- Sonja: Gym Basic 3M
      (129, 21, CURRENT_DATE - INTERVAL '2 months', NULL), -- Armin: Personal Training Starter 3M
      (130, 6, CURRENT_DATE - INTERVAL '7 months', NULL), -- Gabi: Gym Basic 12M
      (131, 9, CURRENT_DATE - INTERVAL '4 months', NULL), -- Ernst: Gym + Courses 12M
      (132, 1, CURRENT_DATE - INTERVAL '10 days', NULL), -- Iris: Flex Gym Basic
      (133, 11, CURRENT_DATE - INTERVAL '5 months', NULL), -- Dieter: All-In 6M
      (134, 14, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jutta: Student Courses
      (135, 3, CURRENT_DATE - INTERVAL '1 month', NULL), -- Peter: Flex All-In
      (136, 8, CURRENT_DATE - INTERVAL '4 months', NULL), -- Beate: Gym + Courses 6M
      (137, 12, CURRENT_DATE - INTERVAL '8 months', NULL), -- Franz: All-In 12M
      (138, 17, CURRENT_DATE - INTERVAL '20 days', NULL), -- Ursula: Senior Courses
      (139, 2, CURRENT_DATE - INTERVAL '3 months', NULL), -- Hans: Flex Gym Plus
      (140, 6, CURRENT_DATE - INTERVAL '9 months', NULL), -- Erika: Gym Basic 12M
      (141, 10, CURRENT_DATE - INTERVAL '1 month', NULL), -- Walter: All-In 3M
      (
        142,
        25,
        CURRENT_DATE - INTERVAL '10 months',
        NULL
      ), -- Monika S: Corporate All-In 12M
      (143, 5, CURRENT_DATE - INTERVAL '2 months', NULL), -- Lothar: Gym Basic 6M
      (144, 9, CURRENT_DATE - INTERVAL '5 months', NULL), -- Roswitha: Gym + Courses 12M
      (145, 1, CURRENT_DATE - INTERVAL '7 days', NULL), -- Rainer: Flex Gym Basic
      (146, 11, CURRENT_DATE - INTERVAL '3 months', NULL), -- Helga: All-In 6M
      (
        147,
        23,
        CURRENT_DATE - INTERVAL '11 months',
        NULL
      ), -- Detlef: Personal Training Elite 12M
      (148, 3, CURRENT_DATE - INTERVAL '2 months', NULL), -- Christa: Flex All-In
      (149, 7, CURRENT_DATE - INTERVAL '1 month', NULL), -- Juergen: Gym + Courses 3M
      (150, 12, CURRENT_DATE - INTERVAL '4 months', NULL), -- Angelika: All-In 12M
      (151, 18, CURRENT_DATE - INTERVAL '10 days', NULL), -- Wolf: Senior All-In
      (152, 8, CURRENT_DATE - INTERVAL '5 months', NULL), -- Hannelore: Gym + Courses 6M
      (153, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Hartmut: Gym Basic 3M
      (154, 6, CURRENT_DATE - INTERVAL '6 months', NULL), -- Ilse: Gym Basic 12M
      (155, 19, CURRENT_DATE - INTERVAL '5 months', NULL), -- Manfred: Off-Peak Saver 6M
      -- Very recent subscriptions (current month) so subscription flow chart has data
      (89, 1, CURRENT_DATE - INTERVAL '2 days', NULL), -- Recent: Flex Gym Basic, 2 days ago
      (91, 3, CURRENT_DATE - INTERVAL '1 day', NULL), -- Recent: Flex All-In, yesterday
      (93, 2, CURRENT_DATE, NULL), -- Recent: Flex Gym Plus, today
      (95, 6, CURRENT_DATE - INTERVAL '3 days', NULL), -- Recent: Gym Basic 12M, 3 days ago
      (97, 9, CURRENT_DATE - INTERVAL '1 day', NULL), -- Recent: Gym + Courses 12M, yesterday
      (99, 12, CURRENT_DATE - INTERVAL '2 days', NULL), -- Recent: All-In 12M, 2 days ago
      (100, 11, CURRENT_DATE, NULL), -- Recent: All-In 6M, today
      -- Cancelled subscriptions (~25 members, end_date in the future)
      (
        156,
        5,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Karin: Gym Basic 6M, cancelled
      (
        157,
        11,
        CURRENT_DATE - INTERVAL '4 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Otto: All-In 6M, cancelled
      (
        158,
        9,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Elfriede: Gym + Courses 12M, cancelled
      (
        159,
        6,
        CURRENT_DATE - INTERVAL '9 months',
        CURRENT_DATE + INTERVAL '3 months'
      ), -- Bernhard: Gym Basic 12M, cancelled
      (
        160,
        8,
        CURRENT_DATE - INTERVAL '3 months',
        CURRENT_DATE + INTERVAL '3 months'
      ), -- Ruth: Gym + Courses 6M, cancelled
      (
        161,
        12,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Helmut: All-In 12M, cancelled
      (
        162,
        7,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Gertrud: Gym + Courses 3M, cancelled
      (
        163,
        10,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Horst E: All-In 3M, cancelled
      (
        164,
        4,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Liesel: Gym Basic 3M, cancelled
      (
        165,
        11,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Siegfried: All-In 6M, cancelled
      (
        166,
        6,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Edith: Gym Basic 12M, cancelled
      (
        167,
        5,
        CURRENT_DATE - INTERVAL '4 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Werner: Gym Basic 6M, cancelled
      (
        168,
        9,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE + INTERVAL '4 months'
      ), -- Sigrid: Gym + Courses 12M, cancelled
      (
        169,
        12,
        CURRENT_DATE - INTERVAL '7 months',
        CURRENT_DATE + INTERVAL '5 months'
      ), -- Karl: All-In 12M, cancelled
      (
        170,
        8,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Maria O: Gym + Courses 6M, cancelled
      (
        171,
        3,
        CURRENT_DATE - INTERVAL '1 month',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Heinrich: Flex All-In, cancelled
      (
        172,
        7,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Gudrun: Gym + Courses 3M, cancelled
      (
        173,
        10,
        CURRENT_DATE - INTERVAL '1 month',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Erwin: All-In 3M, cancelled
      (
        174,
        4,
        CURRENT_DATE - INTERVAL '1 month',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Waltraud: Gym Basic 3M, cancelled
      (
        175,
        11,
        CURRENT_DATE - INTERVAL '3 months',
        CURRENT_DATE + INTERVAL '3 months'
      ), -- Wilfried: All-In 6M, cancelled
      (
        176,
        6,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE + INTERVAL '4 months'
      ), -- Rosemarie: Gym Basic 12M, cancelled
      (
        177,
        9,
        CURRENT_DATE - INTERVAL '9 months',
        CURRENT_DATE + INTERVAL '3 months'
      ), -- Alfred: Gym + Courses 12M, cancelled
      (
        178,
        2,
        CURRENT_DATE - INTERVAL '2 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Hilde: Flex Gym Plus, cancelled
      (
        179,
        5,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE + INTERVAL '1 month'
      ), -- Friedrich: Gym Basic 6M, cancelled
      (
        180,
        12,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE + INTERVAL '2 months'
      ), -- Elisabeth: All-In 12M, cancelled
      -- Ended subscriptions (~20 members, end_date in the past)
      (
        181,
        4,
        CURRENT_DATE - INTERVAL '7 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Rudolf: Gym Basic 3M, ended
      (
        182,
        7,
        CURRENT_DATE - INTERVAL '9 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Martha: Gym + Courses 3M, ended
      (
        183,
        10,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Gerhard: All-In 3M, ended
      (
        184,
        5,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Hildegard: Gym Basic 6M, ended
      (
        185,
        8,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Theo: Gym + Courses 6M, ended
      (
        186,
        11,
        CURRENT_DATE - INTERVAL '12 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Lore: All-In 6M, ended
      (
        187,
        6,
        CURRENT_DATE - INTERVAL '18 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Konrad: Gym Basic 12M, ended
      (
        188,
        9,
        CURRENT_DATE - INTERVAL '18 months',
        CURRENT_DATE - INTERVAL '6 months'
      ), -- Herta: Gym + Courses 12M, ended
      (
        189,
        12,
        CURRENT_DATE - INTERVAL '20 months',
        CURRENT_DATE - INTERVAL '8 months'
      ), -- Anton: All-In 12M, ended
      (
        190,
        4,
        CURRENT_DATE - INTERVAL '5 months',
        CURRENT_DATE - INTERVAL '2 months'
      ), -- Berta: Gym Basic 3M, ended
      (
        191,
        7,
        CURRENT_DATE - INTERVAL '6 months',
        CURRENT_DATE - INTERVAL '3 months'
      ), -- Helmut G (no sub yet, reuse 161+future): ended
      (
        192,
        5,
        CURRENT_DATE - INTERVAL '10 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Gertrud: ended
      (
        193,
        10,
        CURRENT_DATE - INTERVAL '7 months',
        CURRENT_DATE - INTERVAL '4 months'
      ), -- Horst E: ended (separate period)
      (
        194,
        6,
        CURRENT_DATE - INTERVAL '15 months',
        CURRENT_DATE - INTERVAL '3 months'
      ), -- Liesel: ended
      (
        195,
        8,
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Siegfried: ended
      (
        196,
        11,
        CURRENT_DATE - INTERVAL '13 months',
        CURRENT_DATE - INTERVAL '7 months'
      ), -- Edith: ended
      (
        197,
        9,
        CURRENT_DATE - INTERVAL '17 months',
        CURRENT_DATE - INTERVAL '5 months'
      ), -- Werner: ended
      (
        198,
        4,
        CURRENT_DATE - INTERVAL '6 months',
        CURRENT_DATE - INTERVAL '3 months'
      ), -- Sigrid: ended
      (
        199,
        12,
        CURRENT_DATE - INTERVAL '19 months',
        CURRENT_DATE - INTERVAL '7 months'
      ), -- Karl: ended
      (
        200,
        7,
        CURRENT_DATE - INTERVAL '8 months',
        CURRENT_DATE - INTERVAL '5 months'
      ) -- Maria O: ended
  ) AS data (member_id, plan_id, start_date, end_date)
  CROSS JOIN LATERAL (
    SELECT
      id
    FROM
      members
    WHERE
      members.email = (
        SELECT
          email
        FROM
          members
        ORDER BY
          id
        LIMIT
          1
        OFFSET
          (data.member_id - 1)
      )
  ) m
  CROSS JOIN LATERAL (
    SELECT
      id
    FROM
      plans
    ORDER BY
      id
    LIMIT
      1
    OFFSET
      (data.plan_id - 1)
  ) p;

-- Now that subscriptions exist, backfill realistic created_at timestamps.
-- Members WITH subscriptions: created 1-14 days before their first subscription.
-- Members WITHOUT subscriptions: spread across the last 18 months.
UPDATE members
SET
  created_at = sub.new_created_at
FROM
  (
    SELECT
      m.id,
      (
        MIN(s.start_date) - ((HASHTEXT (m.id::text) & 13) + 1) * INTERVAL '1 day'
      )::timestamptz AS new_created_at
    FROM
      members m
      JOIN subscriptions s ON s.member_id = m.id
    GROUP BY
      m.id
    UNION ALL
    SELECT
      m.id,
      (
        CURRENT_DATE - INTERVAL '18 months' + (
          ROW_NUMBER() OVER (
            ORDER BY
              m.id
          )
        ) * INTERVAL '5 days'
      )::timestamptz
    FROM
      members m
      LEFT JOIN subscriptions s ON s.member_id = m.id
    WHERE
      s.id IS NULL
  ) sub
WHERE
  members.id = sub.id;

-- Trainers: created_at matches their member created_at
UPDATE trainers
SET
  created_at = m.created_at
FROM
  members m
WHERE
  trainers.member_id = m.id;

-- Credit cards: created_at matches their member created_at
UPDATE credit_cards
SET
  created_at = m.created_at
FROM
  members m
WHERE
  credit_cards.member_id = m.id;

-- Bank accounts: created_at matches their member created_at
UPDATE bank_accounts
SET
  created_at = m.created_at
FROM
  members m
WHERE
  bank_accounts.member_id = m.id;
