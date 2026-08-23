-- MSC Math — MCQ option selection stats
-- Counts every student MCQ choice (assignments, practice, instant quiz, games)
-- so teachers/admins can see live option % and correct rate.
-- Stored separately so students cannot read live selection rates.

create table if not exists public.question_option_stats (
  option_id uuid primary key references public.question_options (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selection_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists question_option_stats_question_id_idx
  on public.question_option_stats (question_id);

comment on table public.question_option_stats is
  'Aggregated MCQ option selection counts across all student submissions.';

alter table public.question_option_stats enable row level security;

drop policy if exists "Teachers and admins read option stats" on public.question_option_stats;
create policy "Teachers and admins read option stats"
  on public.question_option_stats for select
  to authenticated
  using (public.is_teacher() or public.is_admin());

drop policy if exists "Admins manage option stats" on public.question_option_stats;
create policy "Admins manage option stats"
  on public.question_option_stats for all
  using (public.is_admin())
  with check (public.is_admin());

-- Ensure a stats row exists for every option.
insert into public.question_option_stats (option_id, question_id, selection_count)
select id, question_id, 0
from public.question_options
on conflict (option_id) do nothing;

create or replace function public.ensure_question_option_stats_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.question_option_stats (option_id, question_id, selection_count)
  values (new.id, new.question_id, 0)
  on conflict (option_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_question_option_created_stats on public.question_options;
create trigger on_question_option_created_stats
  after insert on public.question_options
  for each row
  execute function public.ensure_question_option_stats_row();

-- Increment counters whenever an MCQ answer is saved.
create or replace function public.bump_mcq_option_selection_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_question_id uuid;
begin
  if new.selected_option_id is null then
    return new;
  end if;

  select question_id into target_question_id
  from public.question_options
  where id = new.selected_option_id;

  if target_question_id is null then
    return new;
  end if;

  insert into public.question_option_stats (option_id, question_id, selection_count, updated_at)
  values (new.selected_option_id, target_question_id, 1, now())
  on conflict (option_id) do update
    set
      selection_count = public.question_option_stats.selection_count + 1,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_attempt_answer_mcq_stats on public.attempt_answers;
create trigger on_attempt_answer_mcq_stats
  after insert on public.attempt_answers
  for each row
  execute function public.bump_mcq_option_selection_count();

-- Backfill from existing answer rows.
update public.question_option_stats
set selection_count = 0, updated_at = now();

update public.question_option_stats as stats_row
set
  selection_count = counted.total,
  updated_at = now()
from (
  select
    selected_option_id as option_id,
    count(*)::integer as total
  from public.attempt_answers
  where selected_option_id is not null
  group by selected_option_id
) as counted
where stats_row.option_id = counted.option_id;
