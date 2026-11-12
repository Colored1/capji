# دليل التشغيل والنشر (CAPJI)

## 1. إنشاء قاعدة البيانات في Supabase
1. ادخل إلى supabase.com وأنشئ مشروعاً جديداً.
2. من القائمة اختر **SQL Editor** ثم **New query**، والصق محتوى الملف `supabase/schema.sql` واضغط **Run**.
3. من **Authentication > Users** اضغط **Add user** وأنشئ حساب المسؤول بالبريد وكلمة المرور.
4. من **SQL Editor** شغّل الأمر التالي، واستبدل البريد بالبريد الذي أنشأته:

```sql
insert into admins (user_id)
select id from auth.users where email = 'your-email@example.com';
```

5. من **Project Settings > API** انسخ:
   - **Project URL**
   - **anon public key**

## 2. ربط الموقع بـ Supabase على Vercel
1. في Vercel افتح المشروع **capji** ثم **Settings > Environment Variables**.
2. أضف:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
3. من **Deployments** اضغط **Redeploy** حتى تُطبَّق المتغيرات.

## 3. التشغيل المحلي (اختياري)
- انسخ `.env.example` إلى `.env.local` وضع القيم أعلاه.
- ثم `npm install` و `npm run dev`.

## 4. لوحة التحكم
- الرابط: `/admin` (مثل: capji-capji.vercel.app/admin)
- الدخول بالبريد وكلمة المرور التي أنشأتها في الخطوة 3.

## 5. الدومين
- من Vercel **Settings > Domains** أضف الدومين الذي اشتريته، واتبع التعليمات لربط DNS.

## ملاحظات
- الصور والفيديوهات تُرفع إلى مخزن Supabase باسم `media`.
- طلبات الزوار تُحفظ في جدول `inquiries` وتظهر في **صندوق الطلبات**.
- تسجيل الدخول بجوجل يحتاج إعداد Google Cloud ثم تفعيله من Supabase > Authentication > Providers.
