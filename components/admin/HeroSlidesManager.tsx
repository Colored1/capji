"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshHome } from "@/lib/actions";

type Slide = {
  id: string;
  kind: "image" | "video";
  media_url: string;
  title: string;
  subtitle: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};

const MEDIA_MARKER = "/storage/v1/object/public/media/";

const input =
  "w-full rounded-xl border border-fg/15 bg-fg/[0.04] px-4 py-3 text-fg outline-none transition duration-300 focus:border-cyan focus:shadow-glow";

export default function HeroSlidesManager() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [active, setActive] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setMsg(error.message);
    else setItems((data ?? []) as Slide[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setMsg("اختر صورة أو فيديو أولاً.");
      return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const contentType = MIME_BY_EXT[ext];
    if (!contentType) {
      setMsg("الصيغة غير مدعومة. استخدم JPG أو PNG أو WEBP أو GIF أو MP4 أو WEBM.");
      return;
    }

    setBusy(true);
    setMsg("جارٍ رفع الملف...");
    const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const upload = await supabase.storage.from("media").upload(path, file, { contentType, cacheControl: "3600" });
    if (upload.error) {
      setBusy(false);
      setMsg(`فشل الرفع: ${upload.error.message}`);
      return;
    }

    const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;
    const { error } = await supabase.from("hero_slides").insert({
      kind: contentType.startsWith("video/") ? "video" : "image",
      media_url: url,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      sort_order: nextOrder,
      is_active: active,
    });

    if (error) {
      setBusy(false);
      setMsg(error.message);
      return;
    }

    await refreshHome();
    setTitle("");
    setSubtitle("");
    setFile(null);
    setFileKey((k) => k + 1);
    setActive(true);
    setBusy(false);
    setMsg("تمت الإضافة إلى الهيرو.");
    load();
  }

  async function patch(id: string, values: Partial<Pick<Slide, "is_active" | "title" | "sort_order">>) {
    const { error } = await supabase.from("hero_slides").update(values).eq("id", id);
    if (error) {
      setMsg(error.message);
      return false;
    }
    await refreshHome();
    return true;
  }

  async function toggle(s: Slide) {
    if (await patch(s.id, { is_active: !s.is_active })) load();
  }

  async function rename(s: Slide) {
    const t = window.prompt("العنوان الجديد", s.title);
    if (!t || t.trim() === s.title) return;
    if (await patch(s.id, { title: t.trim() })) load();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = items[index];
    const b = items[index + dir];
    if (!a || !b) return;
    const ok1 = await patch(a.id, { sort_order: b.sort_order });
    const ok2 = await patch(b.id, { sort_order: a.sort_order });
    if (ok1 && ok2) load();
  }

  async function remove(s: Slide) {
    if (!window.confirm("حذف هذه الشريحة من الهيرو نهائياً؟")) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", s.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    const idx = s.media_url.indexOf(MEDIA_MARKER);
    if (idx !== -1) {
      await supabase.storage.from("media").remove([decodeURIComponent(s.media_url.slice(idx + MEDIA_MARKER.length))]);
    }
    await refreshHome();
    load();
  }

  const btn = "rounded-full border border-fg/20 px-3 py-1.5 text-fg/70 transition hover:border-cyan hover:text-cyan disabled:opacity-30";

  return (
    <div className="space-y-10">
      <form onSubmit={add} className="glass-card max-w-2xl space-y-5 p-6 md:p-8">
        <h2 className="text-xl text-cyan">إضافة شريحة إلى الهيرو (Hero Slider)</h2>

        <label className="block space-y-2">
          <span className="text-sm text-fg/70">صورة أو فيديو *</span>
          <input
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-fg/70 file:mr-4 file:rounded-full file:border-0 file:bg-fg/10 file:px-4 file:py-2 file:text-fg"
          />
        </label>

        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان *" className={input} />
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="وصف قصير (اختياري)" className={input} />

        <label className="flex items-center gap-3 text-sm text-fg/80">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-cyan" />
          نشرها في الهيرو فوراً
        </label>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary rounded-full px-6 py-2.5 font-semibold disabled:opacity-60"
        >
          {busy ? "جارٍ الإضافة..." : "إضافة إلى الهيرو"}
        </button>
        {msg && <p className="text-sm text-cyan">{msg}</p>}
      </form>

      <div className="space-y-4">
        <h2 className="text-xl text-cyan">الشرائح الحالية</h2>
        {loading && <p className="text-fg/50">جارٍ التحميل...</p>}
        {!loading && items.length === 0 && (
          <p className="text-fg/50">لا توجد شرائح بعد. الهيرو فارغ حتى تضيف أول صورة أو فيديو.</p>
        )}

        {items.map((s, i) => (
          <div key={s.id} className="glass-card flex flex-col gap-4 p-4 md:flex-row md:items-center">
            <div className="h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-black">
              {s.kind === "video" ? (
                <video src={s.media_url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.media_url} alt={s.title} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-fg">{s.title}</p>
              <p className="mt-1 text-xs text-fg/50">
                {s.kind === "video" ? "فيديو" : "صورة"} • ترتيب {s.sort_order} •{" "}
                <span className={s.is_active ? "text-cyan" : "text-fg/40"}>{s.is_active ? "منشورة" : "مخفية"}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="تحريك لأعلى">↑</button>
              <button type="button" className={btn} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="تحريك لأسفل">↓</button>
              <button type="button" className={btn} onClick={() => toggle(s)}>{s.is_active ? "إخفاء" : "نشر"}</button>
              <button type="button" className={btn} onClick={() => rename(s)}>تعديل العنوان</button>
              <button type="button" className="rounded-full border border-red-400/40 px-3 py-1.5 text-red-400 transition hover:bg-red-500/10" onClick={() => remove(s)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
