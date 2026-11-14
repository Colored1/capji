# دليل الربط الكامل: الإشعارات، الوسائط، Realtime

اتبع الخطوات بالترتيب، وكل خطوة مستقلة عن الأخرى.

## 1) قاعدة البيانات (Supabase)

1. افتح Supabase ← **SQL Editor** ← New query.
2. الصق محتوى `supabase/schema.sql` إذا لم تشغله من قبل (تم تشغيله سابقاً).
3. الصق محتوى `supabase/realtime.sql` واضغط **Run**. هذا يفعّل البث اللحظي لجدول `inquiries` لجرس الإشعارات.
4. للتحقق: Database ← Publications ← `supabase_realtime` يجب أن يظهر فيه جدول `inquiries`.

## 2) التخزين (Storage) للصور والفيديو

- الحاوية `media` عامة (Public) وتم إنشاؤها في `schema.sql`. للتحقق: Storage ← يجب أن تظهر `media` مع علامة Public.
- الصيغ المسموحة في لوحة التحكم: **JPG, PNG, WEBP, GIF, MP4, WEBM**.
- صور iPhone بصيغة HEIC وفيديوهات MOV لا تُعرض في معظم المتصفحات، لذلك تُرفض عند الرفع مع رسالة توضيح. الحل: صدّرها كـ JPG أو MP4.
- إذا ظهر "تعذّر عرض الصورة/الفيديو" في الموقع، اضغط "فتح الملف" لتتأكد أن الرابط يعمل. إن فتح الرابط وأعطى خطأ، تحقق من سياسة الحاوية (Storage policies) ومن أن الرابط يبدأ بـ `https://<project>.supabase.co/storage/v1/object/public/media/`.

## 3) البريد الإلكتروني (Resend)

1. أنشئ حساباً على https://resend.com.
2. **Domains** ← Add Domain (مثلاً `capji.com`) وأضف سجلات DNS التي تظهر لك. بدون دومين لا يمكن الإرسال إلا إلى بريدك الشخصي للتجربة.
3. **API Keys** ← Create API Key ← نوع Sending ← انسخ المفتاح (يبدأ بـ `re_`).
4. أضف في Vercel ← Settings ← Environment Variables:
   - `RESEND_API_KEY` = المفتاح
   - `NOTIFY_FROM_EMAIL` = مثال: `CAPJI <alerts@capji.com>` (يجب أن يكون من دومين موثّق)
   - `NOTIFY_TO_EMAIL` = بريدك الذي تستقبل عليه الطلبات

## 4) واتساب (WhatsApp Cloud API من Meta)

1. ادخل https://developers.facebook.com ← My Apps ← Create App ← نوع **Business**، ثم أضف منتج **WhatsApp**.
2. من WhatsApp ← API Setup:
   - انسخ **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - اضغط Generate Access Token. للإنتاج أنشئ **System User** دائم من Business Settings وأعطه صلاحية `whatsapp_business_messaging`، وانسخ توكنه → `WHATSAPP_TOKEN`
   - أضف رقمك في "To" وفعّله برمز التحقق، ثم انسخه إلى `WHATSAPP_NOTIFY_TO` بالصيغة الدولية بدون + (مثال: `967772678571`).
3. **مهم:** الرسائل النصية تُرسل فقط خلال 24 ساعة من آخر رسالة من الرقم. لإشعار دائم أنشئ قالباً:
   - WhatsApp Manager ← Message Templates ← Create ← Utility
   - الاسم: `new_inquiry`، اللغة: Arabic (`ar`)
   - النص: `طلب جديد من {{1}} لخدمة {{2}}. التفاصيل: {{3}}.`
     (لا يجوز أن ينتهي النص بمتغير مباشرة، لذلك أضفنا نقطة بعده)
   - عند التقديم ستُطلب "أمثلة" للمتغيرات: أدخل مثلاً `أحمد`، `تطوير موقع`، `أريد موقعاً لمتجري`.
   - انتظر الموافقة (عادة دقائق إلى ساعات)، ثم أضف في Vercel:
     - `WHATSAPP_TEMPLATE_NAME` = `new_inquiry`
     - `WHATSAPP_TEMPLATE_LANG` = `ar`
4. Meta تضيف رقم اختبار مجانياً في البداية، ويمكنك إرسال الرسائل لأرقام مضافة فيه فقط حتى تربط رقمك الحقيقي.

## 5) متغيرات البيئة في Vercel

Settings ← Environment Variables ← أضف كل ما يلي لبيئات Production و Preview:

| المتغير | مطلوب | المصدر |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | نعم | Supabase ← Project Settings ← API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | نعم | Supabase ← Project Settings ← API |
| RESEND_API_KEY | لإشعارات البريد | Resend |
| NOTIFY_FROM_EMAIL | لإشعارات البريد | دومينك الموثّق |
| NOTIFY_TO_EMAIL | لإشعارات البريد | بريدك |
| WHATSAPP_TOKEN | لإشعارات واتساب | Meta |
| WHATSAPP_PHONE_NUMBER_ID | لإشعارات واتساب | Meta |
| WHATSAPP_NOTIFY_TO | لإشعارات واتساب | رقمك |
| WHATSAPP_TEMPLATE_NAME | اختياري | القالب المعتمد |
| WHATSAPP_TEMPLATE_LANG | اختياري | `ar` |

بعد أي تغيير في المتغيرات: Deployments ← آخر نشر ← **Redeploy**.

**لا تضع المفاتيح السرية (Service Role أو tokens) في الكود أو في المحادثات.** المتغيرات التي تبدأ بـ `NEXT_PUBLIC_` فقط تُرسل للمتصفح.

## 6) اختبار كل شيء

1. افتح الموقع ← قسم "اطلب خدمة" ← أرسل طلباً تجريبياً.
2. يجب أن تصلك رسالة بريد خلال ثوانٍ، ورسالة واتساب.
3. افتح `/admin` وأبقِ الصفحة مفتوحة، ثم أرسل طلباً آخر من نافذة أخرى: يجب أن يظهر عدّاد على الجرس فوراً.
4. إن لم تصل رسالة: افتح Vercel ← Logs ← ابحث عن `/api/notify`. الرد يبيّن أي قناة فشلت (`email` / `whatsapp` يكون `failed` أو `skipped` إذا لم تُضبط متغيراتها).

## 7) الصور لا تظهر؟ قائمة التشخيص

1. افتح الصورة في تبويب جديد من زر "فتح الملف". إن لم تفتح: المشكلة في الرفع أو السياسات.
2. إن فُتحت: امسح الكاش (Ctrl+Shift+R) وانتظر دقيقة، فالموقع يُحدّث كل 60 ثانية.
3. تأكد أن الملف JPG/PNG/WEBP/MP4/WEBM وليس HEIC أو MOV.
