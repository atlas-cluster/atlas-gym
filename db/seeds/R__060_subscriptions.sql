-- Subscriptions seed with dates relative to CURRENT_DATE
-- About 70-80% of members will have subscriptions
-- Mix of active, cancelled, ended, and future subscriptions

INSERT INTO
  subscriptions (member_id, plan_id, start_date, end_date)
SELECT
  m.id,
  p.id,
  start_date,
  end_date
FROM
  (
    VALUES
      -- Active subscriptions (no end_date, started in the past)
      (1, 1, CURRENT_DATE - INTERVAL '45 days', NULL),  -- admin: Flex Gym Basic, active for 45 days
      (2, 12, CURRENT_DATE - INTERVAL '8 months', NULL), -- Lena: All-In 12M, 8 months in
      (3, 6, CURRENT_DATE - INTERVAL '3 months', NULL),  -- Jonas: Gym Basic 12M, 3 months in
      (4, 9, CURRENT_DATE - INTERVAL '6 months', NULL),  -- Maria: Gym + Courses 12M, 6 months in
      (5, 3, CURRENT_DATE - INTERVAL '2 months', NULL),  -- Lukas: Flex All-In, 2 months active
      (7, 8, CURRENT_DATE - INTERVAL '4 months', NULL),  -- Tim: Gym + Courses 6M, 4 months in
      (8, 11, CURRENT_DATE - INTERVAL '2 months', NULL), -- Hannah: All-In 6M, 2 months in
      (9, 5, CURRENT_DATE - INTERVAL '5 months', NULL),  -- Max: Gym Basic 6M, 5 months in
      (11, 22, CURRENT_DATE - INTERVAL '4 months', NULL), -- Paul: Personal Training Pro 6M, 4 months in
      (13, 2, CURRENT_DATE - INTERVAL '1 month', NULL),  -- Ben: Flex Gym Plus, 1 month active
      (15, 14, CURRENT_DATE - INTERVAL '2 months', NULL), -- Nico: Student Courses, 2 months in
      (17, 6, CURRENT_DATE - INTERVAL '9 months', NULL), -- Daniel: Gym Basic 12M, 9 months in
      (19, 12, CURRENT_DATE - INTERVAL '10 months', NULL), -- Felix: All-In 12M, 10 months in
      (21, 1, CURRENT_DATE - INTERVAL '15 days', NULL),  -- Tom: Flex Gym Basic, 15 days active
      (23, 7, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jan: Gym + Courses 3M, 2 months in
      (25, 24, CURRENT_DATE - INTERVAL '11 months', NULL), -- Leon: Corporate Basic 12M, 11 months in
      (26, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Anna: Gym Basic 3M, 2 months in
      (28, 10, CURRENT_DATE - INTERVAL '1 month', NULL), -- Julia: All-In 3M, 1 month in
      (30, 15, CURRENT_DATE - INTERVAL '1 month', NULL), -- Lisa: Student All-In, 1 month in
      (32, 3, CURRENT_DATE - INTERVAL '20 days', NULL),  -- Laura: Flex All-In, 20 days active
      (34, 9, CURRENT_DATE - INTERVAL '7 months', NULL), -- Nina: Gym + Courses 12M, 7 months in
      (36, 11, CURRENT_DATE - INTERVAL '3 months', NULL), -- Julia: All-In 6M, 3 months in
      (38, 5, CURRENT_DATE - INTERVAL '4 months', NULL), -- Emma: Gym Basic 6M, 4 months in
      (40, 16, CURRENT_DATE - INTERVAL '25 days', NULL), -- Katharina: Senior Gym Basic, 25 days active
      (42, 2, CURRENT_DATE - INTERVAL '2 months', NULL), -- Sophie: Flex Gym Plus, 2 months active
      (44, 12, CURRENT_DATE - INTERVAL '5 months', NULL), -- Marie: All-In 12M, 5 months in
      (46, 7, CURRENT_DATE - INTERVAL '1 month', NULL),  -- Elena: Gym + Courses 3M, 1 month in
      (48, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jana: Gym Basic 3M, 2 months in
      (50, 21, CURRENT_DATE - INTERVAL '2 months', NULL), -- Vanessa: Personal Training Starter 3M, 2 months in
      (52, 6, CURRENT_DATE - INTERVAL '8 months', NULL), -- Melanie: Gym Basic 12M, 8 months in
      (54, 9, CURRENT_DATE - INTERVAL '3 months', NULL), -- Jennifer: Gym + Courses 12M, 3 months in
      (56, 1, CURRENT_DATE - INTERVAL '10 days', NULL),  -- Sabrina: Flex Gym Basic, 10 days active
      (58, 11, CURRENT_DATE - INTERVAL '4 months', NULL), -- Andrea: All-In 6M, 4 months in
      (60, 14, CURRENT_DATE - INTERVAL '1 month', NULL), -- Christina: Student Courses, 1 month in
      (62, 3, CURRENT_DATE - INTERVAL '1 month', NULL),  -- Marcel: Flex All-In, 1 month active
      (64, 6, CURRENT_DATE - INTERVAL '6 months', NULL), -- Jasmin: Gym Basic 12M, 6 months in
      (66, 12, CURRENT_DATE - INTERVAL '9 months', NULL), -- Tanja: All-In 12M, 9 months in
      (68, 8, CURRENT_DATE - INTERVAL '5 months', NULL), -- Sandra: Gym + Courses 6M, 5 months in
      (70, 2, CURRENT_DATE - INTERVAL '3 months', NULL), -- Daniela: Flex Gym Plus, 3 months active
      (72, 10, CURRENT_DATE - INTERVAL '2 months', NULL), -- Jessica: All-In 3M, 2 months in
      (74, 13, CURRENT_DATE - INTERVAL '1 month', NULL), -- Sabine: Student Gym Basic, 1 month in
      (76, 5, CURRENT_DATE - INTERVAL '3 months', NULL), -- Petra: Gym Basic 6M, 3 months in
      (78, 11, CURRENT_DATE - INTERVAL '1 month', NULL), -- Anke: All-In 6M, 1 month in
      (80, 1, CURRENT_DATE - INTERVAL '5 days', NULL),   -- Monika: Flex Gym Basic, 5 days active
      (82, 6, CURRENT_DATE - INTERVAL '10 months', NULL), -- Kerstin: Gym Basic 12M, 10 months in
      (84, 17, CURRENT_DATE - INTERVAL '15 days', NULL), -- Martina: Senior Courses, 15 days active
      (86, 3, CURRENT_DATE - INTERVAL '2 months', NULL), -- Claudia: Flex All-In, 2 months active
      (88, 9, CURRENT_DATE - INTERVAL '4 months', NULL), -- Birgit: Gym + Courses 12M, 4 months in
      (90, 7, CURRENT_DATE - INTERVAL '1 month', NULL),  -- Anja: Gym + Courses 3M, 1 month in
      (92, 12, CURRENT_DATE - INTERVAL '7 months', NULL), -- Silke: All-In 12M, 7 months in
      (94, 4, CURRENT_DATE - INTERVAL '2 months', NULL), -- Simone: Gym Basic 3M, 2 months in
      (96, 22, CURRENT_DATE - INTERVAL '5 months', NULL), -- Susanne: Personal Training Pro 6M, 5 months in
      (98, 2, CURRENT_DATE - INTERVAL '1 month', NULL),  -- Doris: Flex Gym Plus, 1 month active
      
      -- Cancelled subscriptions (end_date in the future, still active until then)
      (6, 5, CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE + INTERVAL '1 month'), -- Sophie: Gym Basic 6M, cancelled, ends next month
      (10, 11, CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE + INTERVAL '1 month'), -- Lea: All-In 6M, cancelled, ends next month
      (12, 9, CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE + INTERVAL '1 month'), -- Juliane: Gym + Courses 12M, cancelled, ends next month
      (14, 6, CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE + INTERVAL '1 month'), -- Emily: Gym Basic 12M, cancelled, ends next month
      (16, 8, CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE + INTERVAL '1 month'), -- Lara: Gym + Courses 6M, cancelled, ends next month
      (18, 12, CURRENT_DATE - INTERVAL '10 months', CURRENT_DATE + INTERVAL '2 months'), -- Sarah: All-In 12M, cancelled, ends in 2 months
      (20, 7, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '1 month'), -- Mila: Gym + Courses 3M, cancelled, ends next month
      (22, 10, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '1 month'), -- Nora: All-In 3M, cancelled, ends next month
      (24, 4, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '1 month'), -- Clara: Gym Basic 3M, cancelled, ends next month
      (27, 8, CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE + INTERVAL '1 month'), -- Marco: Gym + Courses 6M, cancelled, ends next month
      (29, 6, CURRENT_DATE - INTERVAL '10 months', CURRENT_DATE + INTERVAL '2 months'), -- David: Gym Basic 12M, cancelled, ends in 2 months
      (31, 11, CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE + INTERVAL '2 months'), -- Simon: All-In 6M, cancelled, ends in 2 months
      (33, 9, CURRENT_DATE - INTERVAL '8 months', CURRENT_DATE + INTERVAL '4 months'), -- Alexander: Gym + Courses 12M, cancelled, ends in 4 months
      (35, 5, CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE + INTERVAL '2 months'), -- Philip: Gym Basic 6M, cancelled, ends in 2 months
      (37, 12, CURRENT_DATE - INTERVAL '9 months', CURRENT_DATE + INTERVAL '3 months'), -- Sebastian: All-In 12M, cancelled, ends in 3 months
      (39, 7, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '1 month'), -- Florian: Gym + Courses 3M, cancelled, ends next month
      (41, 10, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '2 months'), -- Moritz: All-In 3M, cancelled, ends in 2 months
      (43, 4, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '2 months'), -- Tobias: Gym Basic 3M, cancelled, ends in 2 months
      (45, 8, CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '3 months'), -- Chris: Gym + Courses 6M, cancelled, ends in 3 months
      (47, 6, CURRENT_DATE - INTERVAL '8 months', CURRENT_DATE + INTERVAL '4 months'), -- Robin: Gym Basic 12M, cancelled, ends in 4 months
      
      -- Ended subscriptions (end_date in the past, subscription fully expired)
      (49, 4, CURRENT_DATE - INTERVAL '7 months', CURRENT_DATE - INTERVAL '4 months'), -- Oliver: Gym Basic 3M, ended 4 months ago
      (51, 7, CURRENT_DATE - INTERVAL '9 months', CURRENT_DATE - INTERVAL '6 months'), -- Fabian: Gym + Courses 3M, ended 6 months ago
      (53, 10, CURRENT_DATE - INTERVAL '8 months', CURRENT_DATE - INTERVAL '5 months'), -- Dennis: All-In 3M, ended 5 months ago
      (55, 5, CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE - INTERVAL '5 months'), -- Stefan: Gym Basic 6M, ended 5 months ago
      (57, 8, CURRENT_DATE - INTERVAL '10 months', CURRENT_DATE - INTERVAL '4 months'), -- Patrick: Gym + Courses 6M, ended 4 months ago
      (59, 11, CURRENT_DATE - INTERVAL '12 months', CURRENT_DATE - INTERVAL '6 months'), -- Matthias: All-In 6M, ended 6 months ago
      (61, 6, CURRENT_DATE - INTERVAL '18 months', CURRENT_DATE - INTERVAL '6 months'), -- Dominik: Gym Basic 12M, ended 6 months ago
      (63, 9, CURRENT_DATE - INTERVAL '18 months', CURRENT_DATE - INTERVAL '6 months'), -- Nicole: Gym + Courses 12M, ended 6 months ago
      (65, 12, CURRENT_DATE - INTERVAL '20 months', CURRENT_DATE - INTERVAL '8 months'), -- Christian: All-In 12M, ended 8 months ago
      (67, 4, CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE - INTERVAL '2 months'), -- Kevin: Gym Basic 3M, ended 2 months ago
      (69, 7, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '3 months'), -- Manuel: Gym + Courses 3M, ended 3 months ago
      (71, 5, CURRENT_DATE - INTERVAL '10 months', CURRENT_DATE - INTERVAL '4 months'), -- Thomas: Gym Basic 6M, ended 4 months ago
      (73, 10, CURRENT_DATE - INTERVAL '7 months', CURRENT_DATE - INTERVAL '4 months'), -- Markus: All-In 3M, ended 4 months ago
      (75, 6, CURRENT_DATE - INTERVAL '15 months', CURRENT_DATE - INTERVAL '3 months'), -- Michael: Gym Basic 12M, ended 3 months ago
      (77, 8, CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE - INTERVAL '5 months'), -- Rene: Gym + Courses 6M, ended 5 months ago
      (79, 11, CURRENT_DATE - INTERVAL '13 months', CURRENT_DATE - INTERVAL '7 months'), -- Sven: All-In 6M, ended 7 months ago
      (81, 9, CURRENT_DATE - INTERVAL '17 months', CURRENT_DATE - INTERVAL '5 months'), -- Andreas: Gym + Courses 12M, ended 5 months ago
      (83, 4, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '3 months'), -- Jens: Gym Basic 3M, ended 3 months ago
      (85, 12, CURRENT_DATE - INTERVAL '19 months', CURRENT_DATE - INTERVAL '7 months'), -- Heiko: All-In 12M, ended 7 months ago
      (87, 7, CURRENT_DATE - INTERVAL '8 months', CURRENT_DATE - INTERVAL '5 months'), -- Frank: Gym + Courses 3M, ended 5 months ago
      
      -- Future subscriptions (start_date in the future, will begin later)
      (10, 12, CURRENT_DATE + INTERVAL '1 month', NULL), -- Lea: All-In 12M future subscription (after current ends)
      (12, 6, CURRENT_DATE + INTERVAL '1 month', NULL),  -- Juliane: Gym Basic 12M future subscription
      (14, 9, CURRENT_DATE + INTERVAL '1 month', NULL),  -- Emily: Gym + Courses 12M future subscription
      (18, 11, CURRENT_DATE + INTERVAL '2 months', NULL), -- Sarah: All-In 6M future subscription
      (20, 4, CURRENT_DATE + INTERVAL '1 month', NULL),  -- Mila: Gym Basic 3M future subscription
      (22, 11, CURRENT_DATE + INTERVAL '1 month', NULL), -- Nora: All-In 6M future subscription
      (24, 5, CURRENT_DATE + INTERVAL '1 month', NULL),  -- Clara: Gym Basic 6M future subscription
      (29, 9, CURRENT_DATE + INTERVAL '2 months', NULL), -- David: Gym + Courses 12M future subscription
      (33, 12, CURRENT_DATE + INTERVAL '4 months', NULL), -- Alexander: All-In 12M future subscription
      (37, 6, CURRENT_DATE + INTERVAL '3 months', NULL), -- Sebastian: Gym Basic 12M future subscription
      (41, 11, CURRENT_DATE + INTERVAL '2 months', NULL), -- Moritz: All-In 6M future subscription
      (45, 9, CURRENT_DATE + INTERVAL '3 months', NULL)  -- Chris: Gym + Courses 12M future subscription
  ) AS data (member_id, plan_id, start_date, end_date)
  CROSS JOIN LATERAL (SELECT id FROM members WHERE members.email = (SELECT email FROM members ORDER BY id LIMIT 1 OFFSET (data.member_id - 1))) m
  CROSS JOIN LATERAL (SELECT id FROM plans ORDER BY id LIMIT 1 OFFSET (data.plan_id - 1)) p;
