"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Inquiry = {
  id: string;
  full_name: string;
  contact: string;
  service_type: string;
  details: string;
  budget: string | null;
  status: string;
  created_at: string;
};

const statuses = [
  { value: "new", label: "جديد" },
  { value: "in_review", label: "قيد المراجعة" },
  { value: "in_progress", label: "جاري التنفيذ" },
  { value: "resolved", label: "تم الحل" },
];

const services = ["تطوير موقع أو تطبيق", "بناء نظام خاص", "تصميم جرافيك ومونتاج", "صيانة هاردوير وشبكات", "مشكلة تقنية"];

function replyLink(contact: string, name: string) {
  if (contact.includes("@")) {
    return { href: `mailto:${contact}?subject=${encodeURIComponent("طلبك لدى CAPJI")}`, label: "رد بالبريد" };
  }
  const digits = contact.replace(/\D/g, "");
  return {
    href: `https://wa.me/${digits}?text=${encodeURIComponent(`مرحباً ${name}، بخصوص طلبك...`)}`,
    label: "رد عبر واتساب",
  };
}

export default function InquiriesManager() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (error) setMsg(error.message);
    else setItems((data ?? []) as Inquiry[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) setMsg(error.message);
    else setItems((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function remove(id: string) {
    if (!window.confirm("حذف هذا الطلب نهائياً؟")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) setMsg(error.message);
    else setItems((list) => list.filter((i) => i.id !== id));
  }

  const [statusFilter, setStatusFilter] = useState("");
  const shown = items
    .filter((i) => !filter || i.service_type === filter)
    .filter((i) => !statusFilter || i.status === statusFilter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-neon text-3xl font-light">صندوق الطلبات</h1>
        <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-fg/15 bg-fg/[0.04] px-4 py-2 text-fg">
          <option value="">كل الحالات</option>
          {statuses.map((s) => <option key={s.value} value={s.value} className="bg-bg">{s.label}</option>)}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-fg/15 bg-fg/[0.04] px-4 py-2 text-fg">
          <option value="">كل الأنواع</option>
          {services.map((s) => <option key={s} value={s} className="bg-bg">{s}</option>)}
        </select>
        </div>
      </div>

      {msg && <p className="mb-4 text-sm text-red-300">{msg}</p>}
      {loading && <p className="text-fg/50">جارٍ التحميل...</p>}
      {!loading && shown.length === 0 && <p className="text-fg/50">لا توجد طلبات.</p>}

      <div className="space-y-4">
        {shown.map((i) => {
          const reply = replyLink(i.contact, i.full_name);
          return (
            <div key={i.id} className="glass-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-cyan">{i.full_name}</h3>
                  <p className="text-xs text-fg/50">{i.service_type} • {new Date(i.created_at).toLocaleString("ar")}</p>
                </div>
                <select value={i.status} onChange={(e) => setStatus(i.id, e.target.value)} className="rounded-xl border border-fg/15 bg-fg/[0.04] px-3 py-2 text-sm text-fg">
                  {statuses.map((s) => <option key={s.value} value={s.value} className="bg-bg">{s.label}</option>)}
                </select>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-fg/80">{i.details}</p>
              {i.budget && <p className="mt-2 text-xs text-fg/50">الميزانية: {i.budget}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="text-fg/60">{i.contact}</span>
                <a href={reply.href} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">{reply.label}</a>
                <button onClick={() => remove(i.id)} className="text-red-400 hover:underline">حذف</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
