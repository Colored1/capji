import { site } from "@/lib/site";

export const metadata = { title: "سياسة الخصوصية | CAPJI" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 leading-loose text-white/80">
      <h1 className="mb-8 text-3xl font-light text-gold">سياسة الخصوصية</h1>
      <p className="mb-4">يوضح هذا النص كيف يتعامل موقع {site.brand} مع بياناتك.</p>

      <h2 className="mt-8 mb-3 text-xl text-gold">البيانات التي نجمعها</h2>
      <p className="mb-4">عند تسجيل الدخول بحساب Google نحصل على اسمك وبريدك الإلكتروني وصورتك الشخصية فقط، ولا نحصل على كلمة مرورك.</p>
      <p className="mb-4">عند إرسال طلب خدمة نحفظ الاسم وبيانات التواصل وتفاصيل الطلب التي تكتبها.</p>

      <h2 className="mt-8 mb-3 text-xl text-gold">كيف نستخدم البيانات</h2>
      <p className="mb-4">نستخدم بياناتك فقط للتواصل معك بخصوص طلبك، ولا نبيعها أو نشاركها مع أي طرف ثالث.</p>

      <h2 className="mt-8 mb-3 text-xl text-gold">حذف البيانات</h2>
      <p className="mb-4">لطلب حذف بياناتك تواصل معنا عبر البريد: {site.email}</p>

      <h2 className="mt-8 mb-3 text-xl text-gold">التواصل</h2>
      <p className="mb-4">{site.ownerName} — {site.email} — {site.location}</p>
    </main>
  );
}
