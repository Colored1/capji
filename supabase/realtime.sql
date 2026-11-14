-- تفعيل Supabase Realtime لجدول الطلبات (لجرس الإشعارات في لوحة التحكم)
-- شغّل هذا الملف مرة واحدة من Supabase → SQL Editor
do $$
begin
  alter publication supabase_realtime add table public.inquiries;
exception
  when duplicate_object then null;
end $$;
