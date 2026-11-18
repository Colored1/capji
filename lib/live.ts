import { createClient } from "@supabase/supabase-js";
import { normalizeMatch, sortMatches, type LiveMatch } from "@/lib/live-types";

export type LiveData = { matches: LiveMatch[]; error: string | null };

// يجلب المباريات للعرض العام فقط (قراءة عامة بموجب RLS)
export async function getLiveMatches(): Promise<LiveData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { matches: [], error: "إعدادات Supabase غير مكتملة" };
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("live_matches")
      .select("*")
      .order("match_date", { ascending: false, nullsFirst: false })
      .limit(300);
    if (error) return { matches: [], error: error.message };
    const rows = (data ?? []) as Record<string, unknown>[];
    return { matches: sortMatches(rows.map(normalizeMatch)), error: null };
  } catch {
    return { matches: [], error: "تعذّر تحميل المباريات" };
  }
}
