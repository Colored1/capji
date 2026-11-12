-- ============ قاعدة بيانات CAPJI ============
-- شغّل هذا الملف كاملاً في Supabase: SQL Editor > New query > Run

-- جدول المسؤولين: أضف هنا معرّف حسابك بعد إنشائه في Authentication
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- المشاريع البرمجية
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tech text,
  preview_url text,
  cover_url text,
  created_at timestamptz not null default now()
);

-- تطبيقات الجوال
create table if not exists apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text,
  description text,
  features text,
  screenshots text,
  download_url text,
  created_at timestamptz not null default now()
);

-- التصاميم والمونتاج
create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'graphic',
  image_url text,
  video_url text,
  created_at timestamptz not null default now()
);

-- طلبات العملاء
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact text not null,
  service_type text not null,
  details text not null,
  budget text,
  status text not null default 'new'
    check (status in ('new', 'in_review', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

-- إعدادات الموقع (صف واحد فقط)
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  about text,
  skills text,
  social_links text
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ============ الصلاحيات (RLS) ============
alter table admins enable row level security;
alter table projects enable row level security;
alter table apps enable row level security;
alter table designs enable row level security;
alter table inquiries enable row level security;
alter table site_settings enable row level security;

-- الجميع يقرأ المحتوى
create policy "public read projects" on projects for select using (true);
create policy "public read apps" on apps for select using (true);
create policy "public read designs" on designs for select using (true);
create policy "public read settings" on site_settings for select using (true);

-- المسؤول فقط يعدّل المحتوى
create policy "admin write projects" on projects for all using (is_admin()) with check (is_admin());
create policy "admin write apps" on apps for all using (is_admin()) with check (is_admin());
create policy "admin write designs" on designs for all using (is_admin()) with check (is_admin());
create policy "admin write settings" on site_settings for all using (is_admin()) with check (is_admin());

-- الزائر يرسل طلباً فقط، والمسؤول يقرأ ويحدّث ويحذف
create policy "public insert inquiries" on inquiries for insert with check (true);
create policy "admin read inquiries" on inquiries for select using (is_admin());
create policy "admin update inquiries" on inquiries for update using (is_admin()) with check (is_admin());
create policy "admin delete inquiries" on inquiries for delete using (is_admin());

-- ============ ملفات الوسائط (صور وفيديو) ============
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');
create policy "admin upload media" on storage.objects
  for insert with check (bucket_id = 'media' and is_admin());
create policy "admin update media" on storage.objects
  for update using (bucket_id = 'media' and is_admin());
create policy "admin delete media" on storage.objects
  for delete using (bucket_id = 'media' and is_admin());
