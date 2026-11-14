import { createClient } from "@supabase/supabase-js";
import type { SlideMedia } from "@/lib/slides";

// يجلب الشرائح المنشورة فقط من قاعدة البيانات، ولا يضيف أي وسائط تلقائية
export async function getHeroSlides(): Promise<SlideMedia[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("id, kind, media_url, title, subtitle")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(20);
    if (error || !data) return [];
    return data.map((r: { id: string; kind: string; media_url: string; title: string; subtitle: string | null }) => ({
      id: r.id,
      kind: r.kind === "video" ? ("video" as const) : ("image" as const),
      src: r.media_url,
      title: r.title,
      subtitle: r.subtitle ?? undefined,
    }));
  } catch {
    return [];
  }
}
