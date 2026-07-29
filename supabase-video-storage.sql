-- Run once in the Supabase SQL Editor for the weekly report project.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'weekly-report-media',
  'weekly-report-media',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "weekly report members upload media" on storage.objects;
create policy "weekly report members upload media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'weekly-report-media'
  and exists (
    select 1
    from public.weekly_report_members member
    where member.document_id = split_part(name, '/', 1)
      and member.user_id = auth.uid()
  )
);

drop policy if exists "weekly report members delete media" on storage.objects;
create policy "weekly report members delete media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'weekly-report-media'
  and exists (
    select 1
    from public.weekly_report_members member
    where member.document_id = split_part(name, '/', 1)
      and member.user_id = auth.uid()
  )
);
