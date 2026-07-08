-- MSC Math — question image storage
-- Run in Supabase SQL Editor after 001_initial_schema.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'question-assets',
  'question-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Admins can upload question assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'question-assets'
  and public.is_admin()
);

create policy "Admins can update question assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'question-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'question-assets'
  and public.is_admin()
);

create policy "Admins can delete question assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'question-assets'
  and public.is_admin()
);

create policy "Anyone can read question assets"
on storage.objects
for select
to public
using (bucket_id = 'question-assets');

