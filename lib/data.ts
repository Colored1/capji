import { createClient } from "@supabase/supabase-js";

export type Project = {
  id: string;
  title: string;
  description: string | null;
  tech: string | null;
  preview_url: string | null;
  cover_url: string | null;
};

export type App = {
  id: string;
  name: string;
  version: string | null;
  description: string | null;
  features: string | null;
  screenshots: string | null;
  download_url: string | null;
};

export type Design = {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
};

export type Settings = {
  about: string | null;
  skills: string | null;
  social_links: string | null;
};

export type Portfolio = {
  projects: Project[];
  apps: App[];
  designs: Design[];
  settings: Settings | null;
};

const empty: Portfolio = { projects: [], apps: [], designs: [], settings: null };

// قراءة عامة للمحتوى (بدون كوكيز) حتى تعمل الصفحة حتى قبل ربط Supabase.
export async function getPortfolio(): Promise<Portfolio> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return empty;

  try {
    const supabase = createClient(url, key);
    const [p, a, d, s] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("apps").select("*").order("created_at", { ascending: false }),
      supabase.from("designs").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    return {
      projects: (p.data ?? []) as Project[],
      apps: (a.data ?? []) as App[],
      designs: (d.data ?? []) as Design[],
      settings: (s.data ?? null) as Settings | null,
    };
  } catch {
    return empty;
  }
}
