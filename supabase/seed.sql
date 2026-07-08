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

-- Topics for Form 1 (sample HKDSE foundation)
insert into public.topics (form_level, chapter_name, topic_name, sort_order) values
  (1, 'Number and Algebra', 'Directed Numbers', 1),
  (1, 'Number and Algebra', 'Basic Algebra', 2),
  (1, 'Number and Algebra', 'Linear Equations', 3),
  (1, 'Measures, Shape and Space', 'Angles', 4),
  (1, 'Measures, Shape and Space', 'Perimeter and Area', 5);

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
  where form_level = 1 and topic_name = 'Directed Numbers' limit 1;

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
insert into public.badges (name, description, criteria_type, criteria_value, xp_reward)
values (
  'First Steps',
  'Complete your first quiz on MSC Math.',
  'completion',
  '{"quizzes_completed": 1}',
  50
);
