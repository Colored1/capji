"use client";

import { useState } from "react";
import HybridPlayer from "@/components/live/HybridPlayer";
import {
  STATUS_LABEL,
  formatMatchDate,
  type LiveMatch,
  type MatchStatus,
  type StreamLink,
} from "@/lib/live-types";

const STATUS_STYLE: Record<MatchStatus, string> = {
  live: "border-red-400/50 bg-red-500/10 text-red-300",
  upcoming: "border-cyan/40 bg-cyan/10 text-cyan",
  recorded: "border-violet/50 bg-violet/10 text-violet",
};

function StatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${STATUS_STYLE[status]}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

// شعار الفريق مع رمز بديل عند فشل التحميل
function TeamLogo({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-fg/15 bg-fg/[0.05] text-sm text-fg/60">
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 object-contain"
    />
  );
}

function Versus({ match, compact = false }: { match: LiveMatch; compact?: boolean }) {
  return (
    <div className={`flex w-full min-w-0 flex-col items-center gap-2 sm:flex-row sm:gap-3 ${compact ? "" : "py-1"}`}>
      <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:flex-1 sm:justify-end">
        <span className="min-w-0 truncate text-sm text-fg md:text-base">{match.team_a}</span>
        <TeamLogo src={match.team_a_logo} name={match.team_a} />
      </div>
      <span className="text-xs text-fg/40">ضد</span>
      <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:flex-1 sm:justify-start">
        <TeamLogo src={match.team_b_logo} name={match.team_b} />
        <span className="min-w-0 truncate text-sm text-fg md:text-base">{match.team_b}</span>
      </div>
    </div>
  );
}

function sourcesOf(match: LiveMatch): StreamLink[] {
  const list = [...match.stream_urls];
  if (match.recording_url) list.push({ label: "التسجيل الكامل", url: match.recording_url });
  return list;
}

export default function LiveCenter({ matches, error }: { matches: LiveMatch[]; error: string | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = matches.find((m) => m.id === selectedId) ?? matches[0] ?? null;
  const upcoming = matches.filter((m) => m.status !== "recorded");
  const archive = matches.filter((m) => m.status === "recorded");
  const usesFootballData = matches.some((m) => m.source === "football-data");

  const card = (m: LiveMatch) => {
    const isActive = selected?.id === m.id;
    return (
      <button
        key={m.id}
        type="button"
        onClick={() => {
          setSelectedId(m.id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        aria-pressed={isActive}
        className={`glass-card flex w-full min-w-0 max-w-full flex-col gap-2 overflow-hidden p-4 text-right transition duration-300 ${
          isActive ? "border-cyan/50 shadow-glow" : ""
        }`}
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <StatusBadge status={m.status} />
          <span className="text-xs text-fg/50">{formatMatchDate(m.match_date)}</span>
        </div>
        <Versus match={m} compact />
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-neon text-3xl font-light md:text-4xl">البث المباشر والأرشيف</h1>
        <p className="text-sm text-fg/60">شاهد المباريات المباشرة أو أرشيف المباريات المسجّلة في أي وقت.</p>
      </header>

      {error && (
        <div className="glass-card border-red-400/30 p-4 text-sm text-red-300">
          تعذّر تحميل المباريات: {error}. تأكد من تشغيل ملف supabase/live.sql في Supabase.
        </div>
      )}

      {!selected && !error && (
        <div className="glass-card p-8 text-center text-fg/60">لا توجد مباريات منشورة حالياً.</div>
      )}

      {selected && (
        <section className="space-y-4">
          <HybridPlayer key={selected.id} sources={sourcesOf(selected)} title={selected.title} />

          <div className="glass-card min-w-0 max-w-full space-y-3 overflow-hidden p-4 md:p-5">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <h2 className="min-w-0 break-words text-lg text-fg md:text-xl">{selected.title}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <Versus match={selected} />
            <p className="text-xs text-fg/50">{formatMatchDate(selected.match_date)}</p>
            {selected.description && <p className="break-words text-sm leading-relaxed text-fg/70">{selected.description}</p>}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl text-cyan">جدول المباريات</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{upcoming.map(card)}</div>
        </section>
      )}

      {archive.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl text-cyan">أرشيف المباريات</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{archive.map(card)}</div>
        </section>
      )}

      {usesFootballData && (
        <p className="text-center text-xs text-fg/40">مصدر جدول المباريات: football-data.org</p>
      )}
    </div>
  );
}
