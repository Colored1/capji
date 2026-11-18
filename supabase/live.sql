-- ============ البث المباشر والأرشيف ============
-- شغّل هذا الملف في Supabase: SQL Editor > New query > Run
-- يُنشئ جدول المباريات ومخزن تسجيلات MP4 مع صلاحيات المدير فقط للكتابة

create table if not exists public.live_matches (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  source text not null default 'manual' check (source in ('manual', 'football-data')),
  title text not null,
  team_a text not null,
  team_b text not null,
  team_a_logo text,
  team_b_logo text,
  -- مصادر البث: [{ "label": "1080p", "url": "https://..." }, ...]
  stream_urls jsonb not null default '[]'::jsonb,
  -- تسجيل MP4 للأرشيف (يُرفع من لوحة التحكم أو يُلصق كرابط)
  recording_url text,
  status text not null default 'upcoming' check (status in ('live', 'upcoming', 'recorded')),
  -- عند تعديل الحالة يدوياً تُقفل حتى لا تغيّرها المزامنة التلقائية
  status_locked boolean not null default false,
  match_date timestamptz,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_matches_date_idx on public.live_matches (match_date desc);

alter table public.live_matches enable row level security;

-- الزوار يقرؤون كل المباريات، والمدير وحده يضيف ويعدّل ويحذف
drop policy if exists "public read matches" on public.live_matches;
create policy "public read matches" on public.live_matches
  for select using (true);

drop policy if exists "admin manage matches" on public.live_matches;
create policy "admin manage matches" on public.live_matches
  for all using (is_admin()) with check (is_admin());

-- مخزن تسجيلات المباريات: قراءة عامة للمشاهدة، وكتابة للمدير فقط
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('match-recordings', 'match-recordings', true, array['video/mp4', 'video/webm'])
on conflict (id) do update
  set public = excluded.public,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read match recordings" on storage.objects;
create policy "public read match recordings" on storage.objects
  for select using (bucket_id = 'match-recordings');

drop policy if exists "admin insert match recordings" on storage.objects;
create policy "admin insert match recordings" on storage.objects
  for insert with check (bucket_id = 'match-recordings' and is_admin());

drop policy if exists "admin update match recordings" on storage.objects;
create policy "admin update match recordings" on storage.objects
  for update using (bucket_id = 'match-recordings' and is_admin())
  with check (bucket_id = 'match-recordings' and is_admin());

drop policy if exists "admin delete match recordings" on storage.objects;
create policy "admin delete match recordings" on storage.objects
  for delete using (bucket_id = 'match-recordings' and is_admin());
