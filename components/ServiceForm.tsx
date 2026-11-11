"use client";

import { useState, type FormEvent } from "react";

export default function ServiceForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <input name="name" placeholder="الاسم" required />
      <input name="contact" placeholder="البريد أو رقم التواصل" required />
      <textarea name="message" placeholder="اكتب مشكلتك أو ما تحتاجه" rows={5} required />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </button>
      {status === "done" && <p className="form-ok">تم استلام طلبك، وسنتواصل معك قريباً.</p>}
      {status === "error" && <p className="form-err">حدث خطأ، حاول مرة أخرى.</p>}
    </form>
  );
}
