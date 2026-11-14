-- جدول شرائح الهيرو: فقط ما تضيفه يدوياً من لوحة التحكم يظهر في الموقع
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  media_url text not null,
  title text not null,
  subtitle text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

-- الزوار يقرؤون الشرائح المنشورة فقط
drop policy if exists "public read active hero" on public.hero_slides;
create policy "public read active hero" on public.hero_slides
  for select using (is_active = true);

-- المدير يقرأ ويعدّل ويحذف كل الشرائح
drop policy if exists "admin manage hero" on public.hero_slides;
create policy "admin manage hero" on public.hero_slides
  for all using (is_admin()) with check (is_admin());
