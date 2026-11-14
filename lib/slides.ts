import type { Portfolio } from "@/lib/data";

export type SlideMedia = {
  id: string;
  kind: "image" | "video";
  src: string;
  title: string;
  subtitle?: string;
};

// يجمع وسائط الهيرو من التصاميم والمشاريع والتطبيقات المنشورة فقط
export function buildSlides(data: Portfolio): SlideMedia[] {
  const list: SlideMedia[] = [];

  for (const d of data.designs) {
    if (d.video_url) {
      list.push({ id: `d-${d.id}`, kind: "video", src: d.video_url, title: d.title, subtitle: d.category ?? undefined });
    } else if (d.image_url) {
      list.push({ id: `d-${d.id}`, kind: "image", src: d.image_url, title: d.title, subtitle: d.category ?? undefined });
    }
  }

  for (const p of data.projects) {
    if (p.cover_url) {
      list.push({ id: `p-${p.id}`, kind: "image", src: p.cover_url, title: p.title, subtitle: p.tech ?? undefined });
    }
  }

  for (const a of data.apps) {
    const first = (a.screenshots ?? "").split("\n").map((s) => s.trim()).find(Boolean);
    if (first) {
      list.push({ id: `a-${a.id}`, kind: "image", src: first, title: a.name, subtitle: a.description ?? undefined });
    }
  }

  return list.slice(0, 12);
}
