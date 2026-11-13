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

const input =
  "w-full rounded-xl border border-fg/15 bg-fg/[0.04] px-4 py-3 text-fg outline-none transition duration-300 focus:border-cyan focus:shadow-glow";

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

  return (
    <section id="request" className="mx-auto max-w-3xl px-6 py-28">
      <h2 className="reveal mb-4 text-center text-3xl font-light tracking-wide text-neon md:text-5xl">ابدأ مشروعك أو حل مشكلتك</h2>
      <p className="reveal mb-12 text-center text-fg/60">اكتب تفاصيل طلبك، وسأتواصل معك في أقرب وقت.</p>

      <form onSubmit={handleSubmit} className="reveal glass-card space-y-5 p-6 md:p-10">
        <div className="grid gap-5 md:grid-cols-2">
          <input name="full_name" required placeholder="الاسم الكامل" className={input} />
          <input name="contact" required placeholder="رقم الواتساب أو البريد الإلكتروني" className={input} />
        </div>
        <select name="service_type" required defaultValue="" className={input}>
          <option value="" disabled>اختر نوع الخدمة</option>
          {serviceTypes.map((s) => <option key={s} value={s} className="bg-bg">{s}</option>)}
        </select>
        <textarea name="details" required rows={6} placeholder="تفاصيل المشروع أو المشكلة" className={input} />
        <input name="budget" placeholder="الميزانية المتوقعة (اختياري)" className={input} />

        <button type="submit" disabled={status === "sending"} className="btn-primary w-full rounded-xl py-3.5 font-semibold disabled:opacity-60">
          {status === "sending" ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>

        {status === "done" && (
          <div className="space-y-3 text-center">
            <p className="text-cyan">تم استلام طلبك بنجاح، سأتواصل معك قريباً.</p>
            <a href={lastWhatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block rounded-full px-6 py-2 text-fg">
              تواصل فوري عبر واتساب
            </a>
          </div>
        )}
        {status === "error" && <p className="text-center text-red-400">{errorMsg}</p>}
      </form>

      <div className="reveal mt-10 text-center">
        <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block rounded-full px-6 py-3 text-fg">
          تواصل فوري عبر واتساب {site.whatsappDisplay}
        </a>
      </div>
    </section>
  );
}
