-- MSC Math — initial schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.question_type as enum ('mcq', 'short_answer');
create type public.difficulty_level as enum ('easy', 'medium', 'hard');
create type public.quiz_type as enum ('quiz', 'homework', 'game');
create type public.attempt_status as enum ('in_progress', 'completed', 'abandoned');
create type public.class_member_role as enum ('student', 'teacher');
create type public.badge_criteria_type as enum ('streak', 'score', 'completion', 'custom');

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'student',
  avatar_url text,
  is_test_account boolean not null default false,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_xp integer not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Classes
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  form_level smallint not null check (form_level between 1 and 6),
  academic_year text not null default '2025-2026',
  created_at timestamptz not null default now()
);

create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_in_class public.class_member_role not null,
  joined_at timestamptz not null default now(),
  unique (class_id, user_id)
);

-- Topics (HKDSE structure)
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  form_level smallint not null check (form_level between 1 and 6),
  chapter_name text not null,
  topic_name text not null,
  hkdse_reference text,
  sort_order integer not null default 0
);

-- Questions
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete restrict,
  difficulty public.difficulty_level not null default 'medium',
  type public.question_type not null,
  content_text text,
  content_image_url text,
  explanation_text text,
  explanation_image_url text,
  metadata jsonb not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint question_has_content check (
    content_text is not null or content_image_url is not null
  )
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  option_text text,
  option_image_url text,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  constraint option_has_content check (
    option_text is not null or option_image_url is not null
  )
);

create table public.short_answer_rules (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  accepted_answer text not null,
  answer_type text not null default 'exact' check (answer_type in ('exact', 'numeric')),
  tolerance numeric
);

-- Quizzes
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type public.quiz_type not null default 'quiz',
  time_limit_seconds integer,
  shuffle_questions boolean not null default true,
  shuffle_options boolean not null default true,
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  sort_order integer not null default 0,
  unique (quiz_id, question_id)
);

-- Assignments
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete restrict,
  class_id uuid not null references public.classes (id) on delete cascade,
  assigned_by uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  instructions text,
  due_at timestamptz,
  allow_comments boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.assignment_comments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Attempts
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete restrict,
  assignment_id uuid references public.assignments (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  time_spent_seconds integer,
  score integer,
  max_score integer,
  xp_earned integer not null default 0,
  status public.attempt_status not null default 'in_progress'
);

create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  selected_option_id uuid references public.question_options (id) on delete set null,
  text_answer text,
  is_correct boolean,
  time_spent_seconds integer,
  answered_at timestamptz not null default now()
);

-- Gamification
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  criteria_type public.badge_criteria_type not null default 'custom',
  criteria_value jsonb not null default '{}',
  xp_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table public.growth_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_text text not null,
  author text,
  is_active boolean not null default true
);

-- Helper: check admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

create or replace function public.teaches_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members
    where class_id = target_class_id
      and user_id = auth.uid()
      and role_in_class = 'teacher'
  ) or public.is_admin();
$$;

create or replace function public.is_class_student(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members
    where class_id = target_class_id
      and user_id = auth.uid()
      and role_in_class = 'student'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.short_answer_rules enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_comments enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.growth_quotes enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Teachers can read students in their classes"
  on public.profiles for select
  using (
    public.is_teacher() and exists (
      select 1
      from public.class_members teacher_cm
      join public.class_members student_cm on teacher_cm.class_id = student_cm.class_id
      where teacher_cm.user_id = auth.uid()
        and teacher_cm.role_in_class = 'teacher'
        and student_cm.user_id = profiles.id
        and student_cm.role_in_class = 'student'
    )
  );

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Classes
create policy "Members can view their classes"
  on public.classes for select
  using (
    public.is_admin() or exists (
      select 1 from public.class_members
      where class_id = classes.id and user_id = auth.uid()
    )
  );

create policy "Admins manage classes"
  on public.classes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Class members
create policy "View class members if in class"
  on public.class_members for select
  using (
    public.is_admin() or user_id = auth.uid() or public.teaches_class(class_id)
  );

create policy "Admins manage class members"
  on public.class_members for all
  using (public.is_admin())
  with check (public.is_admin());

-- Topics (readable by all authenticated)
create policy "Authenticated users read topics"
  on public.topics for select
  to authenticated
  using (true);

create policy "Admins manage topics"
  on public.topics for all
  using (public.is_admin())
  with check (public.is_admin());

-- Questions
create policy "Authenticated read active questions"
  on public.questions for select
  to authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage questions"
  on public.questions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Read question options"
  on public.question_options for select
  to authenticated
  using (true);

create policy "Admins manage question options"
  on public.question_options for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Read short answer rules"
  on public.short_answer_rules for select
  to authenticated
  using (true);

create policy "Admins manage short answer rules"
  on public.short_answer_rules for all
  using (public.is_admin())
  with check (public.is_admin());

-- Quizzes
create policy "Read published quizzes"
  on public.quizzes for select
  using (is_published = true or public.is_admin() or public.is_teacher());

create policy "Admins manage quizzes"
  on public.quizzes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Read quiz questions"
  on public.quiz_questions for select
  to authenticated
  using (true);

create policy "Admins manage quiz questions"
  on public.quiz_questions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Assignments
create policy "Students see class assignments"
  on public.assignments for select
  using (
    public.is_admin()
    or public.teaches_class(class_id)
    or public.is_class_student(class_id)
  );

create policy "Teachers assign to their classes"
  on public.assignments for insert
  with check (public.teaches_class(class_id) or public.is_admin());

create policy "Teachers update their assignments"
  on public.assignments for update
  using (assigned_by = auth.uid() or public.is_admin());

-- Comments
create policy "View assignment comments"
  on public.assignment_comments for select
  using (
    exists (
      select 1 from public.assignments a
      where a.id = assignment_id
        and (
          public.is_admin()
          or public.teaches_class(a.class_id)
          or public.is_class_student(a.class_id)
        )
    )
  );

create policy "Post assignment comments"
  on public.assignment_comments for insert
  with check (
    user_id = auth.uid() and exists (
      select 1 from public.assignments a
      where a.id = assignment_id
        and a.allow_comments = true
        and (
          public.is_admin()
          or public.teaches_class(a.class_id)
          or public.is_class_student(a.class_id)
        )
    )
  );

-- Attempts
create policy "Users manage own attempts"
  on public.attempts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Teachers view class attempts"
  on public.attempts for select
  using (
    public.is_admin() or exists (
      select 1 from public.assignments a
      where a.id = attempts.assignment_id
        and public.teaches_class(a.class_id)
    )
  );

create policy "Users manage own attempt answers"
  on public.attempt_answers for all
  using (
    exists (
      select 1 from public.attempts
      where id = attempt_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.attempts
      where id = attempt_id and user_id = auth.uid()
    )
  );

-- Badges
create policy "Everyone reads badges"
  on public.badges for select
  to authenticated
  using (true);

create policy "Admins manage badges"
  on public.badges for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users read own badges"
  on public.user_badges for select
  using (user_id = auth.uid() or public.is_admin() or public.is_teacher());

create policy "System awards badges"
  on public.user_badges for insert
  with check (user_id = auth.uid() or public.is_admin());

-- Growth quotes
create policy "Read active quotes"
  on public.growth_quotes for select
  using (is_active = true or public.is_admin());

create policy "Admins manage quotes"
  on public.growth_quotes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Storage buckets (run separately in Storage UI or via API):
-- questions, badges — public read, admin write
