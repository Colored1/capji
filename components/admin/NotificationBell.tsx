"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; full_name: string; service_type: string; created_at: string; status: string };

export default function NotificationBell() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);

    supabase
      .from("inquiries")
      .select("id, full_name, service_type, created_at, status")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) return;
        setItems(data as Item[]);
        setUnread(data.length);
      });

    const channel = supabase
      .channel("inquiries-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inquiries" }, (payload) => {
        const row = payload.new as Item;
        setItems((prev) => [row, ...prev].slice(0, 10));
        setUnread((u) => u + 1);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("طلب جديد", { body: `${row.full_name} — ${row.service_type}` });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  function toggle() {
    setOpen((o) => !o);
    if (!open) setUnread(0);
  }

  async function enableBrowserAlerts() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPerm(result);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="الإشعارات"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-fg/[0.04] transition hover:border-cyan hover:shadow-glow"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-fg/80" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-violet px-1 text-[11px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-card absolute left-0 top-14 z-30 w-80 p-3 shadow-glow">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-sm text-cyan">الطلبات الجديدة</p>
            {perm === "default" && (
              <button type="button" onClick={enableBrowserAlerts} className="text-xs text-fg/60 underline">
                تفعيل تنبيهات المتصفح
              </button>
            )}
          </div>
          {items.length === 0 && <p className="px-2 py-6 text-center text-sm text-fg/50">لا توجد طلبات جديدة.</p>}
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {items.map((i) => (
              <li key={i.id}>
                <Link href="/admin/inquiries" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 transition hover:bg-fg/5">
                  <p className="text-sm text-fg">{i.full_name}</p>
                  <p className="text-xs text-fg/50">{i.service_type} • {new Date(i.created_at).toLocaleString("ar")}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
