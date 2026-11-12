"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";

const serviceTypes = [
  "تطوير موقع أو تطبيق",
  "بناء نظام خاص",
  "تصميم جرافيك ومونتاج",
  "صيانة هاردوير وشبكات",
  "مشكلة تقنية",
];

export default function RequestForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastWhatsapp, setLastWhatsapp] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const values = {
      full_name: String(fd.get("full_name") || ""),
      contact: String(fd.get("contact") || ""),
      service_type: String(fd.get("service_type") || ""),
      details: String(fd.get("details") || ""),
      budget: String(fd.get("budget") || ""),
    };

    setStatus("sending");
    setErrorMsg("");
    const { error } = await createClient().from("inquiries").insert(values);
    if (error) {
      setStatus("error");
      setErrorMsg("تعذّر إرسال الطلب، حاول مرة أخرى أو تواصل عبر واتساب.");
      return;
    }
    const text = `مرحباً أحمد، أنا ${values.full_name}. أريد: ${values.service_type}. ${values.details}`;
    setLastWhatsapp(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`);
    setStatus("done");
    form.reset();
  }

  const input = "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-gold";

  return (
    <section id="request" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-4 text-center text-3xl font-light tracking-wide text-gold md:text-4xl">ابدأ مشروعك أو تواصل لحل مشكلتك</h2>
      <p className="mb-10 text-center text-white/60">اكتب تفاصيل طلبك، وسأتواصل معك في أقرب وقت.</p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-10">
        <div className="grid gap-5 md:grid-cols-2">
          <input name="full_name" required placeholder="الاسم الكامل" className={input} />
          <input name="contact" required placeholder="رقم الواتساب أو البريد الإلكتروني" className={input} />
        </div>
        <select name="service_type" required defaultValue="" className={input}>
          <option value="" disabled>اختر نوع الخدمة</option>
          {serviceTypes.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
        </select>
        <textarea name="details" required rows={6} placeholder="تفاصيل المشروع أو المشكلة" className={input} />
        <input name="budget" placeholder="الميزانية المتوقعة (اختياري)" className={input} />

        <button type="submit" disabled={status === "sending"} className="w-full rounded-xl bg-gold py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60">
          {status === "sending" ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>

        {status === "done" && (
          <div className="space-y-3 text-center">
            <p className="text-gold">تم استلام طلبك بنجاح، سأتواصل معك قريباً.</p>
            <a href={lastWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-gold px-6 py-2 text-gold hover:bg-gold hover:text-black">
              تواصل فوري عبر واتساب
            </a>
          </div>
        )}
        {status === "error" && <p className="text-center text-red-400">{errorMsg}</p>}
      </form>

      <div className="mt-8 text-center">
        <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-gold px-6 py-3 text-gold transition hover:bg-gold hover:text-black">
          تواصل فوري عبر واتساب {site.whatsappDisplay}
        </a>
      </div>
    </section>
  );
}
