// أنواع وأدوات مشتركة بين الخادم والمتصفح لقسم البث المباشر
export type MatchStatus = "live" | "upcoming" | "recorded";
export type MatchSource = "manual" | "football-data";
export type SourceKind = "hls" | "file" | "embed";

export type StreamLink = { label: string; url: string };

export type LiveMatch = {
  id: string;
  external_id: string | null;
  source: MatchSource;
  title: string;
  team_a: string;
  team_b: string;
  team_a_logo: string | null;
  team_b_logo: string | null;
  stream_urls: StreamLink[];
  recording_url: string | null;
  status: MatchStatus;
  status_locked: boolean;
  match_date: string | null;
  description: string | null;
};

export const STATUS_LABEL: Record<MatchStatus, string> = {
  live: "مباشر",
  upcoming: "قادمة",
  recorded: "مسجّلة",
};

const STATUS_ORDER: Record<MatchStatus, number> = { live: 0, upcoming: 1, recorded: 2 };

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// يحدد طريقة التشغيل: HLS للبث، وملف مباشر للأرشيف، وإطار مضمّن لغير ذلك
export function getSourceKind(url: string): SourceKind {
  let path: string;
  try {
    path = new URL(url).pathname.toLowerCase();
  } catch {
    return "embed";
  }
  if (path.endsWith(".m3u8")) return "hls";
  if (/\.(mp4|webm)$/.test(path)) return "file";
  return "embed";
}

// يحوّل روابط يوتيوب العادية إلى رابط تضمين صالح
export function toEmbedUrl(url: string): string {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const host = u.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = u.pathname.slice(1);
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else if (u.pathname.startsWith("/live/")) id = u.pathname.split("/")[2] ?? null;
    else if (u.pathname.startsWith("/embed/")) return url;
  }

  if (id && /^[\w-]{6,20}$/.test(id)) {
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  }
  return url;
}

// يتحقق من مصادر البث ويُسقط أي رابط غير http/https أو غير صالح
export function normalizeStreams(raw: unknown): StreamLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, i) => {
    if (typeof item !== "object" || item === null) return [];
    const { label, url } = item as Record<string, unknown>;
    if (typeof url !== "string" || !isHttpUrl(url.trim())) return [];
    const name = typeof label === "string" && label.trim() ? label.trim() : `سيرفر ${i + 1}`;
    return [{ label: name, url: url.trim() }];
  });
}

export function normalizeMatch(row: Record<string, unknown>): LiveMatch {
  const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
  return {
    id: String(row.id),
    external_id: str(row.external_id),
    source: row.source === "football-data" ? "football-data" : "manual",
    title: String(row.title ?? ""),
    team_a: String(row.team_a ?? ""),
    team_b: String(row.team_b ?? ""),
    team_a_logo: str(row.team_a_logo),
    team_b_logo: str(row.team_b_logo),
    stream_urls: normalizeStreams(row.stream_urls),
    recording_url: str(row.recording_url),
    status: row.status === "live" || row.status === "recorded" ? row.status : "upcoming",
    status_locked: row.status_locked === true,
    match_date: str(row.match_date),
    description: str(row.description),
  };
}

// المباشر أولاً، ثم القادمة من الأقرب، ثم الأرشيف من الأحدث
export function sortMatches(list: LiveMatch[]): LiveMatch[] {
  const time = (m: LiveMatch) => (m.match_date ? new Date(m.match_date).getTime() : 0);
  return [...list].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return a.status === "recorded" ? time(b) - time(a) : time(a) - time(b);
  });
}

const dateFormat = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Aden",
});

// توقيت ثابت (اليمن) حتى يتطابق الناتج بين الخادم والمتصفح
export function formatMatchDate(iso: string | null): string {
  if (!iso) return "موعد غير محدد";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "موعد غير محدد" : dateFormat.format(d);
}
