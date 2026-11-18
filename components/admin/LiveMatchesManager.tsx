"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshHome } from "@/lib/actions";
import {
  STATUS_LABEL,
  formatMatchDate,
  getSourceKind,
  isHttpUrl,
  normalizeMatch,
  sortMatches,
  type LiveMatch,
  type MatchStatus,
  type StreamLink,
} from "@/lib/live-types";

type StreamRow = { label: string; url: string };

type Draft = {
  id: string | null;
  title: string;
  team_a: string;
  team_b: string;
  team_a_logo: string;
  team_b_logo: string;
  match_date: string;
  status: MatchStatus;
  description: string;
  recording_url: string;
  streams: StreamRow[];
};

const RECORDING_BUCKET = "match-recordings";
const RECORDING_MARKER = `/storage/v1/object/public/${RECORDING_BUCKET}/`;
const RECORDING_MIME: Record<string, string> = { mp4: "video/mp4", webm: "video/webm" };
const KIND_LABEL = { hls: "بث HLS", file: "ملف مباشر", embed: "إطار تضمين" } as const;
const STATUSES: MatchStatus[] = ["upcoming", "live", "recorded"];

const input =
  "w-full rounded-xl border border-fg/15 bg-fg/[0.04] px-4 py-3 text-fg outline-none transition duration-300 focus:border-cyan focus:shadow-glow";
const btn =
  "rounded-full border border-fg/20 px-3 py-1.5 text-sm text-fg/70 transition hover:border-cyan hover:text-cyan disabled:opacity-30";
const danger = "rounded-full border border-red-400/40 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10";

// تحويل ISO إلى قيمة حقل datetime-local بالتوقيت المحلي للمدير
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function emptyDraft(): Draft {
  return {
    id: null,
    title: "",
    team_a: "",
    team_b: "",
    team_a_logo: "",
    team_b_logo: "",
    match_date: toLocalInput(new Date().toISOString()),
    status: "upcoming",
    description: "",
    recording_url: "",
    streams: [],
  };
}

function toDraft(m: LiveMatch): Draft {
  return {
    id: m.id,
    title: m.title,
    team_a: m.team_a,
    team_b: m.team_b,
    team_a_logo: m.team_a_logo ?? "",
    team_b_logo: m.team_b_logo ?? "",
    match_date: toLocalInput(m.match_date),
    status: m.status,
    description: m.description ?? "",
    recording_url: m.recording_url ?? "",
    streams: m.stream_urls.map((s) => ({ label: s.label, url: s.url })),
  };
}

type Validation = { error: string } | { payload: Record<string, unknown> };

// يتحقق من البيانات قبل الحفظ، ويُسقط الصفوف الفارغة من مصادر البث
function validate(d: Draft): Validation {
  const teamA = d.team_a.trim();
  const teamB = d.team_b.trim();
  if (!teamA || !teamB) return { error: "أدخل اسمي الفريقين." };
  if (!d.match_date) return { error: "حدد موعد المباراة." };

  const streams: StreamLink[] = [];
  for (let i = 0; i < d.streams.length; i++) {
    const url = d.streams[i].url.trim();
    if (!url) continue;
    if (!isHttpUrl(url)) return { error: `رابط السيرفر رقم ${i + 1} غير صالح (يجب أن يبدأ بـ https://).` };
    streams.push({ label: d.streams[i].label.trim() || `سيرفر ${i + 1}`, url });
  }

  const recording = d.recording_url.trim();
  if (recording && !isHttpUrl(recording)) return { error: "رابط التسجيل غير صالح." };

  const logoA = d.team_a_logo.trim();
  const logoB = d.team_b_logo.trim();
  if ((logoA && !isHttpUrl(logoA)) || (logoB && !isHttpUrl(logoB))) return { error: "رابط شعار الفريق غير صالح." };

  return {
    payload: {
      title: d.title.trim() || `${teamA} - ${teamB}`,
      team_a: teamA,
      team_b: teamB,
      team_a_logo: logoA || null,
      team_b_logo: logoB || null,
      stream_urls: streams,
      recording_url: recording || null,
      status: d.status,
      // أي تعديل يدوي يقفل الحالة كي لا تغيّرها المزامنة التلقائية
      status_locked: true,
      match_date: new Date(d.match_date).toISOString(),
      description: d.description.trim() || null,
      updated_at: new Date().toISOString(),
    },
  };
}

export default function LiveMatchesManager() {
  const supabase = useMemo(() => createClient(), []);
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fileKey, setFileKey] = useState(0);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("live_matches")
      .select("*")
      .order("match_date", { ascending: false, nullsFirst: false });
    if (error) setMsg(`تعذّر التحميل: ${error.message}`);
    else setMatches(sortMatches(((data ?? []) as Record<string, unknown>[]).map(normalizeMatch)));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(patch: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  function setStream(i: number, patch: Partial<StreamRow>) {
    setDraft((d) => (d ? { ...d, streams: d.streams.map((s, j) => (j === i ? { ...s, ...patch } : s)) } : d));
  }

  function removeStream(i: number) {
    setDraft((d) => (d ? { ...d, streams: d.streams.filter((_, j) => j !== i) } : d));
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft) return;
    const result = validate(draft);
    if ("error" in result) {
      setMsg(result.error);
      return;
    }

    setBusy(true);
    setMsg("جارٍ الحفظ...");
    const res = draft.id
      ? await supabase.from("live_matches").update(result.payload).eq("id", draft.id)
      : await supabase.from("live_matches").insert({ ...result.payload, source: "manual" });
    setBusy(false);

    if (res.error) {
      setMsg(res.error.message);
      return;
    }
    await refreshHome();
    setDraft(null);
    setMsg("تم الحفظ وتحديث الصفحة العامة.");
    load();
  }

  async function setStatus(m: LiveMatch, status: MatchStatus) {
    if (m.status === status) return;
    const { error } = await supabase
      .from("live_matches")
      .update({ status, status_locked: true, updated_at: new Date().toISOString() })
      .eq("id", m.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    await refreshHome();
    load();
  }

  async function remove(m: LiveMatch) {
    if (!window.confirm(`حذف "${m.title}" نهائياً؟`)) return;
    const { error } = await supabase.from("live_matches").delete().eq("id", m.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    if (m.recording_url) {
      const idx = m.recording_url.indexOf(RECORDING_MARKER);
      if (idx !== -1) {
        await supabase.storage
          .from(RECORDING_BUCKET)
          .remove([decodeURIComponent(m.recording_url.slice(idx + RECORDING_MARKER.length))]);
      }
    }
    await refreshHome();
    setMsg("تم الحذف.");
    load();
  }

  async function uploadRecording(file: File) {
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    const contentType = RECORDING_MIME[ext];
    if (!contentType) {
      setMsg("صيغة التسجيل غير مدعومة. استخدم MP4 أو WEBM.");
      return;
    }

    setBusy(true);
    setMsg("جارٍ رفع التسجيل...");
    const path = `live/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase.storage
      .from(RECORDING_BUCKET)
      .upload(path, file, { contentType, cacheControl: "3600" });
    setBusy(false);
    setFileKey((k) => k + 1);

    if (error) {
      setMsg(`فشل الرفع: ${error.message}`);
      return;
    }
    const publicUrl = supabase.storage.from(RECORDING_BUCKET).getPublicUrl(path).data.publicUrl;
    update({ recording_url: publicUrl });
    setMsg("تم رفع التسجيل. اضغط حفظ لتثبيته على المباراة.");
  }

  async function syncNow() {
    setBusy(true);
    setMsg("جارٍ المزامنة مع مصدر الجدول...");
    try {
      const res = await fetch("/api/matches/auto-sync", { method: "POST", cache: "no-store" });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        fetched?: number;
        inserted?: number;
        updated?: number;
        skipped?: number;
        failed?: number;
      };
      if (!json.ok) {
        setMsg(`فشلت المزامنة: ${json.error ?? "خطأ غير معروف"}`);
      } else {
        setMsg(
          `تمت المزامنة: ${json.fetched} مباراة، ${json.inserted} جديدة، ${json.updated} محدّثة، ${json.skipped} متجاهلة، ${json.failed} فشلت.`
        );
      }
      await refreshHome();
      load();
    } catch {
      setMsg("تعذّر الاتصال بخدمة المزامنة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft());
            setMsg("");
          }}
          className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          + إضافة مباراة
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={syncNow}
          className="btn-ghost rounded-full px-5 py-2.5 text-sm disabled:opacity-60"
        >
          مزامنة المباريات الآن
        </button>
      </div>

      {msg && <p className="text-sm text-cyan">{msg}</p>}

      {draft && (
        <form onSubmit={save} className="glass-card max-w-3xl space-y-4 p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl text-cyan">{draft.id ? "تعديل المباراة" : "مباراة جديدة"}</h2>
            <button type="button" className={btn} onClick={() => setDraft(null)}>
              إغلاق
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="عنوان المباراة (اختياري)" className={input} />
            <input type="datetime-local" required value={draft.match_date} onChange={(e) => update({ match_date: e.target.value })} className={input} />
            <input required value={draft.team_a} onChange={(e) => update({ team_a: e.target.value })} placeholder="الفريق الأول *" className={input} />
            <input required value={draft.team_b} onChange={(e) => update({ team_b: e.target.value })} placeholder="الفريق الثاني *" className={input} />
            <input dir="ltr" value={draft.team_a_logo} onChange={(e) => update({ team_a_logo: e.target.value })} placeholder="رابط شعار الفريق الأول (اختياري)" className={input} />
            <input dir="ltr" value={draft.team_b_logo} onChange={(e) => update({ team_b_logo: e.target.value })} placeholder="رابط شعار الفريق الثاني (اختياري)" className={input} />
            <select value={draft.status} onChange={(e) => update({ status: e.target.value as MatchStatus })} className={input}>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-bg">
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={2}
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="وصف المباراة (اختياري)"
            className={input}
          />

          <div className="space-y-3">
            <p className="text-sm text-fg/70">مصادر البث (سيرفرات وجودات)</p>
            {draft.streams.map((s, i) => {
              const hasUrl = isHttpUrl(s.url.trim());
              return (
                <div key={i} className="flex flex-col gap-2 md:flex-row md:items-center">
                  <input value={s.label} onChange={(e) => setStream(i, { label: e.target.value })} placeholder="الاسم مثل 1080p" className={`${input} md:w-40`} />
                  <input dir="ltr" value={s.url} onChange={(e) => setStream(i, { url: e.target.value })} placeholder="https://... (m3u8 أو يوتيوب أو MP4)" className={input} />
                  <span className="shrink-0 text-xs text-fg/50">
                    {s.url.trim() && hasUrl ? KIND_LABEL[getSourceKind(s.url.trim())] : s.url.trim() ? "غير صالح" : ""}
                  </span>
                  <button type="button" className={danger} onClick={() => removeStream(i)}>
                    حذف
                  </button>
                </div>
              );
            })}
            <button type="button" className={btn} onClick={() => setDraft((d) => (d ? { ...d, streams: [...d.streams, { label: "", url: "" }] } : d))}>
              + إضافة سيرفر
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-fg/70">تسجيل الأرشيف (MP4 أو WEBM)</p>
            <input
              key={fileKey}
              type="file"
              accept="video/mp4,video/webm"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadRecording(f);
              }}
              className="block w-full text-sm text-fg/70 file:mr-4 file:rounded-full file:border-0 file:bg-fg/10 file:px-4 file:py-2 file:text-fg"
            />
            <input dir="ltr" value={draft.recording_url} onChange={(e) => update({ recording_url: e.target.value })} placeholder="أو الصق رابط التسجيل" className={input} />
            {draft.recording_url && (
              <button type="button" className={btn} onClick={() => update({ recording_url: "" })}>
                إزالة التسجيل
              </button>
            )}
            <p className="text-xs text-fg/40">
              حد الرفع يحدده قسم Storage في خطة Supabase (افتراضياً 50MB في الخطة المجانية).
            </p>
          </div>

          <p className="text-xs text-fg/40">أي حفظ يدوي يثبّت الحالة، فلا تغيّرها المزامنة التلقائية.</p>
          <button type="submit" disabled={busy} className="btn-primary rounded-full px-6 py-2.5 font-semibold disabled:opacity-60">
            {busy ? "جارٍ التنفيذ..." : "حفظ"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-xl text-cyan">المباريات ({matches.length})</h2>
        {loading && <p className="text-fg/50">جارٍ التحميل...</p>}
        {!loading && matches.length === 0 && <p className="text-fg/50">لا توجد مباريات بعد.</p>}

        {matches.map((m) => (
          <div key={m.id} className="glass-card flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate text-fg">{m.title}</p>
              <p className="mt-1 text-xs text-fg/50">
                {formatMatchDate(m.match_date)} • {m.stream_urls.length} سيرفر
                {m.recording_url ? " • تسجيل" : ""} • {m.source === "football-data" ? "مزامنة تلقائية" : "يدوي"}
                {m.status_locked ? " • حالة مقفلة" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {STATUSES.map((s) => (
                <button key={s} type="button" className={`${btn} ${m.status === s ? "border-cyan text-cyan" : ""}`} onClick={() => setStatus(m, s)}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
              <button type="button" className={btn} onClick={() => { setDraft(toDraft(m)); setMsg(""); }}>
                تعديل
              </button>
              <button type="button" className={danger} onClick={() => remove(m)}>
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
