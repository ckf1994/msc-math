-- MSC Math seed data
-- Run AFTER 001_initial_schema.sql and AFTER creating auth users (see README)

-- Growth mindset quotes
insert into public.growth_quotes (quote_text, author) values
  ('Mistakes are proof that you are trying.', 'Unknown'),
  ('The only way to learn mathematics is to do mathematics.', 'Paul Halmos'),
  ('It does not matter how slowly you go as long as you do not stop.', 'Confucius'),
  ('Every expert was once a beginner.', 'Unknown'),
  ('Challenges are what make life interesting. Overcoming them is what makes life meaningful.', 'Joshua J. Marine');

-- Class 1A
insert into public.classes (name, form_level, academic_year)
values ('1A', 1, '2025-2026');

-- Class 1B
insert into public.classes (name, form_level, academic_year)
select '1B', 1, '2025-2026'
where not exists (select 1 from public.classes where name = '1B');

-- Topics: Mathematics in Action chapters (F.1–F.6)
-- Same content as migrations/006_seed_mia_curriculum_topics.sql (run that on existing DBs).
insert into public.topics (form_level, chapter_name, topic_name, hkdse_reference, sort_order)
select v.form_level, v.chapter_name, v.topic_name, v.hkdse_reference, v.sort_order
from (
  values
    -- F.1 Book 1A
    (1, 'Ch.0 Revision on Fundamental Arithmetic', 'Revision on Fundamental Arithmetic', 'Junior Secondary Mathematics in Action · Book 1A', 100),
    (1, 'Ch.1 Basic Mathematics', 'Basic Mathematics', 'Junior Secondary Mathematics in Action · Book 1A', 101),
    (1, 'Ch.2 Directed Numbers and the Number Line', 'Directed Numbers and the Number Line', 'Junior Secondary Mathematics in Action · Book 1A', 102),
    (1, 'Ch.3 Introduction to Algebra', 'Introduction to Algebra', 'Junior Secondary Mathematics in Action · Book 1A', 103),
    (1, 'Ch.4 Linear Equations in One Unknown', 'Linear Equations in One Unknown', 'Junior Secondary Mathematics in Action · Book 1A', 104),
    (1, 'Ch.5 Introduction to Geometry', 'Introduction to Geometry', 'Junior Secondary Mathematics in Action · Book 1A', 105),
    (1, 'Ch.6 Introduction to Statistics and Statistical Charts', 'Introduction to Statistics and Statistical Charts', 'Junior Secondary Mathematics in Action · Book 1A', 106),
    -- F.1 Book 1B
    (1, 'Ch.7 Percentages (I)', 'Percentages (I)', 'Junior Secondary Mathematics in Action · Book 1B', 107),
    (1, 'Ch.8 Approximate Values and Numerical Estimation', 'Approximate Values and Numerical Estimation', 'Junior Secondary Mathematics in Action · Book 1B', 108),
    (1, 'Ch.9 Areas and Volumes (I)', 'Areas and Volumes (I)', 'Junior Secondary Mathematics in Action · Book 1B', 109),
    (1, 'Ch.10 Manipulation of Simple Polynomials', 'Manipulation of Simple Polynomials', 'Junior Secondary Mathematics in Action · Book 1B', 110),
    (1, 'Ch.11 Congruent Triangles', 'Congruent Triangles', 'Junior Secondary Mathematics in Action · Book 1B', 111),
    (1, 'Ch.12 Introduction to Coordinates', 'Introduction to Coordinates', 'Junior Secondary Mathematics in Action · Book 1B', 112),
    -- F.2 Book 2A
    (2, 'Ch.1 Errors in Measurement', 'Errors in Measurement', 'Junior Secondary Mathematics in Action · Book 2A', 201),
    (2, 'Ch.2 Identities and Factorization', 'Identities and Factorization', 'Junior Secondary Mathematics in Action · Book 2A', 202),
    (2, 'Ch.3 Algebraic Fractions and Formulas', 'Algebraic Fractions and Formulas', 'Junior Secondary Mathematics in Action · Book 2A', 203),
    (2, 'Ch.4 Angles related to Rectilinear Figures', 'Angles related to Rectilinear Figures', 'Junior Secondary Mathematics in Action · Book 2A', 204),
    (2, 'Ch.5 Introduction to Deductive Geometry', 'Introduction to Deductive Geometry', 'Junior Secondary Mathematics in Action · Book 2A', 205),
    (2, 'Ch.6 More about Statistical Charts', 'More about Statistical Charts', 'Junior Secondary Mathematics in Action · Book 2A', 206),
    -- F.2 Book 2B
    (2, 'Ch.7 Rate, Ratio and Proportion', 'Rate, Ratio and Proportion', 'Junior Secondary Mathematics in Action · Book 2B', 207),
    (2, 'Ch.8 Similarity', 'Similarity', 'Junior Secondary Mathematics in Action · Book 2B', 208),
    (2, 'Ch.9 Linear Equations in Two Unknowns', 'Linear Equations in Two Unknowns', 'Junior Secondary Mathematics in Action · Book 2B', 209),
    (2, 'Ch.10 Pythagoras’ Theorem and Irrational Numbers', 'Pythagoras’ Theorem and Irrational Numbers', 'Junior Secondary Mathematics in Action · Book 2B', 210),
    (2, 'Ch.11 Areas and Volumes (II)', 'Areas and Volumes (II)', 'Junior Secondary Mathematics in Action · Book 2B', 211),
    (2, 'Ch.12 Trigonometric Ratios', 'Trigonometric Ratios', 'Junior Secondary Mathematics in Action · Book 2B', 212),
    -- F.3 Book 3A
    (3, 'Ch.1 More about Factorization of Polynomials', 'More about Factorization of Polynomials', 'Junior Secondary Mathematics in Action · Book 3A', 301),
    (3, 'Ch.2 Laws of Integral Indices', 'Laws of Integral Indices', 'Junior Secondary Mathematics in Action · Book 3A', 302),
    (3, 'Ch.3 Linear Inequalities in One Unknown', 'Linear Inequalities in One Unknown', 'Junior Secondary Mathematics in Action · Book 3A', 303),
    (3, 'Ch.4 Percentages (II)', 'Percentages (II)', 'Junior Secondary Mathematics in Action · Book 3A', 304),
    (3, 'Ch.5 Quadrilaterals', 'Quadrilaterals', 'Junior Secondary Mathematics in Action · Book 3A', 305),
    (3, 'Ch.6 Special Lines and Centres in a Triangle', 'Special Lines and Centres in a Triangle', 'Junior Secondary Mathematics in Action · Book 3A', 306),
    -- F.3 Book 3B
    (3, 'Ch.7 Areas and Volumes (III)', 'Areas and Volumes (III)', 'Junior Secondary Mathematics in Action · Book 3B', 307),
    (3, 'Ch.8 Coordinate Geometry of Straight Lines', 'Coordinate Geometry of Straight Lines', 'Junior Secondary Mathematics in Action · Book 3B', 308),
    (3, 'Ch.9 Trigonometric Relations', 'Trigonometric Relations', 'Junior Secondary Mathematics in Action · Book 3B', 309),
    (3, 'Ch.10 Applications of Trigonometry', 'Applications of Trigonometry', 'Junior Secondary Mathematics in Action · Book 3B', 310),
    (3, 'Ch.11 Measures of Central Tendency', 'Measures of Central Tendency', 'Junior Secondary Mathematics in Action · Book 3B', 311),
    (3, 'Ch.12 Simple Idea of Probability', 'Simple Idea of Probability', 'Junior Secondary Mathematics in Action · Book 3B', 312),
    -- F.4 HKDSE MIA 3E
    (4, 'Ch.1 Quadratic Equations in One Unknown (I)', 'Quadratic Equations in One Unknown (I)', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 401),
    (4, 'Ch.2 Quadratic Equations in One Unknown (II)', 'Quadratic Equations in One Unknown (II)', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 402),
    (4, 'Ch.3 Functions and Graphs', 'Functions and Graphs', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 403),
    (4, 'Ch.4 Equations of Straight Lines', 'Equations of Straight Lines', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 404),
    (4, 'Ch.5 More about Polynomials', 'More about Polynomials', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 405),
    (4, 'Ch.6 Exponential Functions', 'Exponential Functions', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 406),
    (4, 'Ch.7 Logarithmic Functions', 'Logarithmic Functions', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 407),
    (4, 'Ch.8 More about Equations', 'More about Equations', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 408),
    (4, 'Ch.9 Variations', 'Variations', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 409),
    (4, 'Ch.10 More about Trigonometry', 'More about Trigonometry', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 410),
    -- F.5 HKDSE MIA 3E
    (5, 'Ch.1 Basic Properties of Circles', 'Basic Properties of Circles', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 501),
    (5, 'Ch.2 Tangents to Circles', 'Tangents to Circles', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 502),
    (5, 'Ch.3 Inequalities', 'Inequalities', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 503),
    (5, 'Ch.4 Linear Programming', 'Linear Programming', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 504),
    (5, 'Ch.5 Applications of Trigonometry in 2-dimensional Problems', 'Applications of Trigonometry in 2-dimensional Problems', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 505),
    (5, 'Ch.6 Applications of Trigonometry in 3-dimensional Problems', 'Applications of Trigonometry in 3-dimensional Problems', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 506),
    (5, 'Ch.7 Equations of Circles', 'Equations of Circles', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 507),
    (5, 'Ch.8 Locus', 'Locus', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 508),
    (5, 'Ch.9 Measures of Dispersion', 'Measures of Dispersion', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 509),
    (5, 'Ch.10 Permutation and Combination', 'Permutation and Combination', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 510),
    (5, 'Ch.11 More about Probability', 'More about Probability', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 511),
    -- F.6 HKDSE MIA 3E
    (6, 'Ch.1 Arithmetic and Geometric Sequences', 'Arithmetic and Geometric Sequences', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 601),
    (6, 'Ch.2 Summation of Arithmetic and Geometric Sequences', 'Summation of Arithmetic and Geometric Sequences', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 602),
    (6, 'Ch.3 More about Graphs of Functions', 'More about Graphs of Functions', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 603),
    (6, 'Ch.4 Uses and Abuses of Statistics', 'Uses and Abuses of Statistics', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 604)
) as v(form_level, chapter_name, topic_name, hkdse_reference, sort_order)
where not exists (
  select 1 from public.topics t
  where t.form_level = v.form_level and t.chapter_name = v.chapter_name
);

-- NOTE: After creating test auth users in Supabase Dashboard, run the block below
-- with the actual UUIDs from Authentication → Users.

/*
-- Example: update test account roles (replace UUIDs)
update public.profiles set role = 'admin', is_test_account = true, full_name = 'Test Admin'
  where email = 'admin@test.msc.edu.hk';
update public.profiles set role = 'teacher', is_test_account = true, full_name = 'Test Teacher'
  where email = 'teacher@test.msc.edu.hk';
update public.profiles set role = 'student', is_test_account = true, full_name = 'Test Student'
  where email = 'student@test.msc.edu.hk';

-- Enroll test users in class 1A (replace UUIDs)
insert into public.class_members (class_id, user_id, role_in_class)
select c.id, p.id, 'teacher'
from public.classes c, public.profiles p
where c.name = '1A' and p.email = 'teacher@test.msc.edu.hk';

insert into public.class_members (class_id, user_id, role_in_class)
select c.id, p.id, 'student'
from public.classes c, public.profiles p
where c.name = '1A' and p.email = 'student@test.msc.edu.hk';
*/

-- Sample questions (5) + 1 demo quiz — uses first topic
do $$
declare
  topic_id uuid;
  q1 uuid; q2 uuid; q3 uuid; q4 uuid; q5 uuid;
  quiz_id uuid;
begin
  select id into topic_id from public.topics
  where form_level = 1
    and chapter_name = 'Ch.2 Directed Numbers and the Number Line'
  limit 1;

  insert into public.questions (topic_id, difficulty, type, content_text, explanation_text)
  values (topic_id, 'easy', 'mcq', 'What is (-3) + (+5)?', 'Start at -3 on the number line and move 5 steps right. You land on +2.')
  returning id into q1;

  insert into public.question_options (question_id, option_text, is_correct, sort_order) values
    (q1, '-8', false, 0),
    (q1, '-2', false, 1),
    (q1, '+2', true, 2),
    (q1, '+8', false, 3);

  insert into public.questions (topic_id, difficulty, type, content_text, explanation_text)
  values (topic_id, 'easy', 'mcq', 'Which is greater: -7 or -2?', 'On the number line, -2 is to the right of -7, so -2 is greater.')
  returning id into q2;

  insert into public.question_options (question_id, option_text, is_correct, sort_order) values
    (q2, '-7', false, 0),
    (q2, '-2', true, 1),
    (q2, 'They are equal', false, 2),
    (q2, 'Cannot tell', false, 3);

  insert into public.questions (topic_id, difficulty, type, content_text, explanation_text)
  values (topic_id, 'medium', 'mcq', 'Calculate: (-4) × (-3)', 'A negative times a negative gives a positive. 4 × 3 = 12.')
  returning id into q3;

  insert into public.question_options (question_id, option_text, is_correct, sort_order) values
    (q3, '-12', false, 0),
    (q3, '-7', false, 1),
    (q3, '+7', false, 2),
    (q3, '+12', true, 3);

  insert into public.questions (topic_id, difficulty, type, content_text, explanation_text)
  values (topic_id, 'medium', 'short_answer', 'What is (+6) − (+9)?', '6 − 9 = -3.')
  returning id into q4;

  insert into public.short_answer_rules (question_id, accepted_answer, answer_type) values
    (q4, '-3', 'exact'),
    (q4, '-3.0', 'exact');

  insert into public.questions (topic_id, difficulty, type, content_text, explanation_text)
  values (topic_id, 'hard', 'short_answer', 'Evaluate: (-2)³ + (+4)', '(-2)³ = -8. -8 + 4 = -4.')
  returning id into q5;

  insert into public.short_answer_rules (question_id, accepted_answer, answer_type) values
    (q5, '-4', 'exact');

  insert into public.quizzes (title, description, type, time_limit_seconds, is_published)
  values (
    'Directed Numbers — Demo Quiz',
    'A short practice quiz on directed numbers for Form 1.',
    'quiz',
    600,
    true
  )
  returning id into quiz_id;

  insert into public.quiz_questions (quiz_id, question_id, sort_order) values
    (quiz_id, q1, 0),
    (quiz_id, q2, 1),
    (quiz_id, q3, 2),
    (quiz_id, q4, 3),
    (quiz_id, q5, 4);
end $$;

-- Starter badge
insert into public.badges (name, description, image_url, criteria_type, criteria_value, xp_reward)
values (
  'First Steps',
  'Complete your first quiz on MSC Math.',
  '/badges/junk-boat.png',
  'completion',
  '{"quizzes_completed": 1}',
  50
);

insert into public.badges (name, description, image_url, criteria_type, criteria_value, xp_reward)
values
  (
    'Pythagoras Pro',
    'Score 90% or higher on a Pythagoras-themed quiz.',
    '/badges/pythagoras-rainbow.png',
    'score',
    '{"min_score": 90}',
    100
  ),
  (
    'Book of Wisdom',
    'Complete 10 quizzes to unlock the Book of Wisdom.',
    '/badges/book-of-wisdom.png',
    'completion',
    '{"completions_required": 10}',
    150
  ),
  (
    'Number Pyramid',
    'Reach 80% or higher on a number skills quiz.',
    '/badges/number-pyramid.png',
    'score',
    '{"min_score": 80}',
    80
  ),
  (
    'Lighthouse Keeper',
    'Keep a 7-day learning streak.',
    '/badges/lighthouse.png',
    'streak',
    '{"streak_days": 7}',
    120
  ),
  (
    'Munsang Banner',
    'Show school spirit by completing your first assignment.',
    '/badges/munsang-banner.png',
    'completion',
    '{"completions_required": 1}',
    60
  ),
  (
    'Munsang Spirit',
    'Wear the spirit — maintain a 14-day streak.',
    '/badges/munsang-jacket.png',
    'streak',
    '{"streak_days": 14}',
    200
  ),
  (
    'Munsang Gate',
    'Pass through the gate: complete 5 quizzes.',
    '/badges/munsang-gate.png',
    'completion',
    '{"completions_required": 5}',
    100
  ),
  (
    'Minsheng Torch',
    'Light the torch with a 3-day streak.',
    '/badges/minsheng-torch.png',
    'streak',
    '{"streak_days": 3}',
    50
  ),
  (
    'Centenary Scholar',
    'Score a perfect 100% on any quiz.',
    '/badges/centenary-stand.png',
    'score',
    '{"min_score": 100}',
    250
  ),
  (
    'Speech Day Star',
    'Stand out on Speech Day — earn this special MSC badge.',
    '/badges/speech-day-2026.png',
    'custom',
    '{"notes": "Awarded by teachers for outstanding performance."}',
    300
  ),
  (
    'Campus Champion',
    'Master the campus challenge: complete 20 quizzes.',
    '/badges/campus-aerial.png',
    'completion',
    '{"completions_required": 20}',
    300
  );
