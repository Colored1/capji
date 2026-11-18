// مزامنة جدول المباريات من واجهة football-data.org الرسمية (مجانية بمفتاح API).
// لا تجلب هذه المزامنة روابط البث أبداً: مصادر البث تُضاف يدوياً من لوحة التحكم،
// وأي مباراة عدّلها المدير يدوياً تُقفل حالتها فلا تتغيّر تلقائياً.
import { createClient } from "@supabase/supabase-js";
import type { MatchStatus } from "@/lib/live-types";

const API_BASE = "https://api.football-data.org/v4";
const WINDOW_DAYS_BACK = 1;
const WINDOW_DAYS_AHEAD = 7;

type ApiTeam = { name?: string | null; crest?: string | null };
type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam?: ApiTeam;
  awayTeam?: ApiTeam;
  competition?: { name?: string | null; code?: string | null };
};

export type SyncResult =
  | { ok: true; fetched: number; inserted: number; updated: number; skipped: number; failed: number }
  | { ok: false; error: string };

const STATUS_MAP: Record<string, MatchStatus> = {
  IN_PLAY: "live",
  PAUSED: "live",
  LIVE: "live",
  EXTRA_TIME: "live",
  PENALTY_SHOOTOUT: "live",
  FINISHED: "recorded",
  AWARDED: "recorded",
  SCHEDULED: "upcoming",
  TIMED: "upcoming",
  POSTPONED: "upcoming",
  SUSPENDED: "upcoming",
};

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchMatches(apiKey: string, codes: string[]): Promise<ApiMatch[]> {
  const now = Date.now();
  const from = isoDay(new Date(now - WINDOW_DAYS_BACK * 86_400_000));
  const to = isoDay(new Date(now + WINDOW_DAYS_AHEAD * 86_400_000));
  const paths = codes.length ? codes.map((c) => `/competitions/${encodeURIComponent(c)}/matches`) : ["/matches"];

  const byId = new Map<number, ApiMatch>();
  for (const path of paths) {
    const res = await fetch(`${API_BASE}${path}?dateFrom=${from}&dateTo=${to}`, {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`تعذّر جلب الجدول من football-data.org (رمز ${res.status})`);
    const json = (await res.json()) as { matches?: ApiMatch[] };
    for (const m of json.matches ?? []) byId.set(m.id, m);
  }
  return [...byId.values()];
}

export async function syncMatches(): Promise<SyncResult> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey) return { ok: false, error: "FOOTBALL_DATA_API_KEY غير مضبوط في إعدادات Vercel" };
  if (!url || !serviceKey) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط في إعدادات Vercel" };

  const codes = (process.env.FOOTBALL_DATA_COMPETITIONS ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  let apiMatches: ApiMatch[];
  try {
    apiMatches = await fetchMatches(apiKey, codes);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطأ غير معروف أثناء الجلب" };
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const externalIds = apiMatches.map((m) => `football-data:${m.id}`);
  const { data: existing, error: readError } = await supabase
    .from("live_matches")
    .select("id, external_id, status_locked")
    .in("external_id", externalIds.length ? externalIds : ["none"]);
  if (readError) return { ok: false, error: readError.message };

  const known = new Map<string, { id: string; status_locked: boolean }>();
  for (const row of existing ?? []) {
    if (row.external_id) known.set(row.external_id as string, { id: row.id as string, status_locked: row.status_locked as boolean });
  }

  const now = new Date().toISOString();
  const toInsert: Record<string, unknown>[] = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const m of apiMatches) {
    const status = STATUS_MAP[m.status];
    const teamA = m.homeTeam?.name?.trim() ?? "";
    const teamB = m.awayTeam?.name?.trim() ?? "";
    if (!status || !teamA || !teamB) {
      skipped++;
      continue;
    }

    const externalId = `football-data:${m.id}`;
    const schedule = {
      title: `${teamA} - ${teamB}`,
      team_a: teamA,
      team_b: teamB,
      team_a_logo: m.homeTeam?.crest ?? null,
      team_b_logo: m.awayTeam?.crest ?? null,
      match_date: m.utcDate,
      updated_at: now,
    };

    const found = known.get(externalId);
    if (found) {
      // الحالة تُحدَّث تلقائياً إلا إذا قفلها المدير يدوياً
      const patch = found.status_locked ? schedule : { ...schedule, status };
      const { error } = await supabase.from("live_matches").update(patch).eq("id", found.id);
      if (error) failed++;
      else updated++;
    } else {
      toInsert.push({
        ...schedule,
        external_id: externalId,
        source: "football-data",
        status,
        stream_urls: [],
        recording_url: null,
        description: m.competition?.name ? `الدوري: ${m.competition.name}` : null,
      });
    }
  }

  let inserted = 0;
  if (toInsert.length) {
    const { error } = await supabase.from("live_matches").insert(toInsert);
    if (error) failed += toInsert.length;
    else inserted = toInsert.length;
  }

  return { ok: true, fetched: apiMatches.length, inserted, updated, skipped, failed };
}
