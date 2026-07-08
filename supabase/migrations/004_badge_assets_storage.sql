-- MSC Math — badge image storage
-- Run after 001_initial_schema.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'badge-assets',
  'badge-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Admins can upload badge assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'badge-assets'
  and public.is_admin()
);

create policy "Admins can update badge assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'badge-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'badge-assets'
  and public.is_admin()
);

create policy "Admins can delete badge assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'badge-assets'
  and public.is_admin()
);

create policy "Anyone can read badge assets"
on storage.objects
for select
to public
using (bucket_id = 'badge-assets');

