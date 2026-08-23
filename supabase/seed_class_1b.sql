-- Ensure class 1B exists (safe to re-run)
insert into public.classes (name, form_level, academic_year)
select '1B', 1, '2025-2026'
where not exists (select 1 from public.classes where name = '1B');
