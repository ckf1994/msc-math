-- MSC Math — seed 10 demo students (4×1A, 6×1B) + attempts
-- Run in Supabase Dashboard → SQL Editor
-- Password for all accounts: DemoStudent123!
-- Safe-ish to re-run: skips existing emails, refreshes profile/enrollment/attempts

create extension if not exists pgcrypto;

-- Ensure classes
insert into public.classes (name, form_level, academic_year)
select '1A', 1, '2025-2026'
where not exists (select 1 from public.classes where name = '1A');

insert into public.classes (name, form_level, academic_year)
select '1B', 1, '2025-2026'
where not exists (select 1 from public.classes where name = '1B');

do $$
declare
  demo_password text := crypt('DemoStudent123!', gen_salt('bf'));
  class_1a uuid;
  class_1b uuid;
  quiz_uuid uuid;
  teacher_uuid uuid;
  assignment_1a uuid;
  assignment_1b uuid;
  student record;
  new_id uuid;
  existing_id uuid;
  student_uid uuid;
  score_item int;
  score_idx int;
  max_score int := 5;
  completed_ts timestamptz;
  started_ts timestamptz;
  students constant jsonb := '[
    {"email":"student01@test.msc.edu.hk","full_name":"Amy Wong","class_name":"1A","xp":420,"streak":5,"longest":7,"scores":[5,4]},
    {"email":"student02@test.msc.edu.hk","full_name":"Brian Lee","class_name":"1A","xp":310,"streak":3,"longest":4,"scores":[3,4]},
    {"email":"student03@test.msc.edu.hk","full_name":"Chloe Ng","class_name":"1A","xp":560,"streak":8,"longest":9,"scores":[5,5,4]},
    {"email":"student04@test.msc.edu.hk","full_name":"David Ho","class_name":"1A","xp":180,"streak":1,"longest":2,"scores":[2]},
    {"email":"student05@test.msc.edu.hk","full_name":"Eva Lam","class_name":"1B","xp":390,"streak":4,"longest":6,"scores":[4,3]},
    {"email":"student06@test.msc.edu.hk","full_name":"Frank Tam","class_name":"1B","xp":250,"streak":2,"longest":3,"scores":[3,2]},
    {"email":"student07@test.msc.edu.hk","full_name":"Grace Yip","class_name":"1B","xp":610,"streak":9,"longest":10,"scores":[5,5,5]},
    {"email":"student08@test.msc.edu.hk","full_name":"Henry Kwok","class_name":"1B","xp":340,"streak":3,"longest":5,"scores":[4,3]},
    {"email":"student09@test.msc.edu.hk","full_name":"Iris Cheung","class_name":"1B","xp":470,"streak":6,"longest":8,"scores":[4,5]},
    {"email":"student10@test.msc.edu.hk","full_name":"Jack Mak","class_name":"1B","xp":150,"streak":0,"longest":1,"scores":[1]}
  ]';
begin
  select id into class_1a from public.classes where name = '1A' limit 1;
  select id into class_1b from public.classes where name = '1B' limit 1;

  select id into quiz_uuid
  from public.quizzes
  where title = 'Directed Numbers — Demo Quiz'
  limit 1;

  if quiz_uuid is null then
    raise exception 'Demo quiz not found. Run supabase/seed.sql first.';
  end if;

  select id into teacher_uuid
  from public.profiles
  where email = 'teacher@test.msc.edu.hk'
  limit 1;

  if teacher_uuid is not null then
    select id into assignment_1a
    from public.assignments
    where title = 'Directed Numbers Practice — 1A' and class_id = class_1a
    limit 1;

    if assignment_1a is null then
      insert into public.assignments (quiz_id, class_id, assigned_by, title, instructions, allow_comments)
      values (quiz_uuid, class_1a, teacher_uuid, 'Directed Numbers Practice — 1A', 'Demo assignment for analytics testing.', true)
      returning id into assignment_1a;
    end if;

    select id into assignment_1b
    from public.assignments
    where title = 'Directed Numbers Practice — 1B' and class_id = class_1b
    limit 1;

    if assignment_1b is null then
      insert into public.assignments (quiz_id, class_id, assigned_by, title, instructions, allow_comments)
      values (quiz_uuid, class_1b, teacher_uuid, 'Directed Numbers Practice — 1B', 'Demo assignment for analytics testing.', true)
      returning id into assignment_1b;
    end if;
  end if;

  for student in
    select * from jsonb_to_recordset(students) as x(
      email text,
      full_name text,
      class_name text,
      xp int,
      streak int,
      longest int,
      scores jsonb
    )
  loop
    select id into existing_id from auth.users where email = student.email limit 1;

    if existing_id is null then
      new_id := gen_random_uuid();

      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        new_id,
        'authenticated',
        'authenticated',
        student.email,
        demo_password,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', student.full_name),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        new_id,
        jsonb_build_object('sub', new_id::text, 'email', student.email),
        'email',
        new_id::text,
        now(),
        now(),
        now()
      );

      student_uid := new_id;
    else
      student_uid := existing_id;
    end if;

    update public.profiles
    set
      role = 'student',
      is_test_account = true,
      full_name = student.full_name,
      total_xp = student.xp,
      current_streak = student.streak,
      longest_streak = student.longest
    where id = student_uid;

    insert into public.class_members (class_id, user_id, role_in_class)
    values (
      case when student.class_name = '1A' then class_1a else class_1b end,
      student_uid,
      'student'
    )
    on conflict (class_id, user_id) do update
      set role_in_class = excluded.role_in_class;

    delete from public.attempts as attempt_row
    where attempt_row.user_id = student_uid
      and attempt_row.quiz_id = quiz_uuid;

    score_idx := 0;
    for score_item in
      select (elem #>> '{}')::int
      from jsonb_array_elements(student.scores) as elem
    loop
      score_idx := score_idx + 1;
      completed_ts := now() - ((jsonb_array_length(student.scores) - score_idx + 1) * interval '18 hours');
      started_ts := completed_ts - make_interval(mins => (4 + score_item));

      insert into public.attempts (
        user_id,
        quiz_id,
        assignment_id,
        started_at,
        completed_at,
        time_spent_seconds,
        score,
        max_score,
        xp_earned,
        status
      ) values (
        student_uid,
        quiz_uuid,
        case
          when student.class_name = '1A' then assignment_1a
          else assignment_1b
        end,
        started_ts,
        completed_ts,
        (4 + score_item) * 60,
        score_item,
        max_score,
        score_item * 10 + case when score_item = max_score then 20 else 0 end,
        'completed'
      );
    end loop;
  end loop;
end $$;
