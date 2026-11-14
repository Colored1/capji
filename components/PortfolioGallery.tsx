"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { App, Design, Portfolio, Project } from "@/lib/data";
import { MediaImage, MediaVideo } from "@/components/Media";

type Tab = "projects" | "apps" | "designs";
type LightboxItem = { kind: "image" | "video"; src: string; title: string };

const tabs: { key: Tab; label: string }[] = [
  { key: "projects", label: "المشاريع البرمجية" },
  { key: "apps", label: "تطبيقات الجوال" },
  { key: "designs", label: "التصاميم والمونتاج" },
];

function Lightbox({ item, onClose }: { item: LightboxItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fade-in fixed inset-0 z-[70] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-xl"
    >
      <div onClick={(e) => e.stopPropagation()} className="fade-up relative w-full max-w-5xl">
        {item.kind === "video" ? (
          <MediaVideo src={item.src} title={item.title} className="max-h-[80vh] w-full rounded-2xl" />
        ) : (
          <MediaImage src={item.src} alt={item.title} className="mx-auto max-h-[80vh] w-auto rounded-2xl object-contain" />
        )}
        <p className="mt-4 text-center text-sm text-fg/70">{item.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="glass-card absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center text-fg hover:text-cyan"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// بطاقة موحدة: زجاجية، تكبير للوسائط عند المرور، وتوهج نيون
function Card({
  index,
  onOpen,
  children,
  media,
  title,
}: {
  index: number;
  onOpen?: () => void;
  children: ReactNode;
  media: ReactNode;
  title: string;
}) {
  return (
    <article
      className="glass-card group fade-up flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}
      aria-label={title}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className="relative block w-full overflow-hidden"
        aria-label={`عرض ${title}`}
      >
        <div className="transition duration-700 ease-out group-hover:scale-105">{media}</div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 ring-1 ring-cyan/50 transition duration-500 group-hover:opacity-100" />
      </button>
      <div className="flex flex-1 flex-col p-6">{children}</div>
    </article>
  );
}

function ProjectCard({ p, index, onOpen }: { p: Project; index: number; onOpen: (i: LightboxItem) => void }) {
  return (
    <Card
      index={index}
      title={p.title}
      onOpen={p.cover_url ? () => onOpen({ kind: "image", src: p.cover_url as string, title: p.title }) : undefined}
      media={
        p.cover_url ? (
          <MediaImage src={p.cover_url} alt={p.title} className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 items-center justify-center bg-fg/[0.04] text-sm text-fg/40">لا توجد صورة</div>
        )
      }
    >
      <h3 className="mb-2 text-xl text-cyan">{p.title}</h3>
      {p.description && <p className="mb-4 text-sm leading-relaxed text-fg/70">{p.description}</p>}
      {p.tech && (
        <div className="mb-4 flex flex-wrap gap-2">
          {p.tech.split(",").map((t) => (
            <span key={t} className="rounded-full border border-violet/40 px-3 py-1 font-mono text-xs text-fg/80">
              {t.trim()}
            </span>
          ))}
        </div>
      )}
      {p.preview_url && (
        <a href={p.preview_url} target="_blank" rel="noopener noreferrer" className="mt-auto text-sm text-cyan hover:underline">
          معاينة المشروع
        </a>
      )}
    </Card>
  );
}

function AppCard({ a, index, onOpen }: { a: App; index: number; onOpen: (i: LightboxItem) => void }) {
  const shots = (a.screenshots || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const features = (a.features || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <Card
      index={index}
      title={a.name}
      onOpen={shots[0] ? () => onOpen({ kind: "image", src: shots[0], title: a.name }) : undefined}
      media={
        shots.length ? (
          <div className="flex gap-3 overflow-x-auto bg-fg/[0.03] p-3">
            {shots.map((s) => (
              <MediaImage key={s} src={s} alt={a.name} className="h-56 w-auto shrink-0 rounded-xl object-cover" />
            ))}
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center bg-fg/[0.04] text-sm text-fg/40">لا توجد لقطات</div>
        )
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-xl text-cyan">{a.name}</h3>
        {a.version && <span className="font-mono text-xs text-fg/50">v{a.version}</span>}
      </div>
      {a.description && <p className="mb-4 text-sm leading-relaxed text-fg/70">{a.description}</p>}
      {features.length > 0 && (
        <ul className="mb-5 list-inside list-disc space-y-1 text-sm text-fg/70">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {a.download_url && (
        <a href={a.download_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-auto inline-block self-start rounded-full px-6 py-2.5 text-sm font-semibold">
          تحميل التطبيق
        </a>
      )}
    </Card>
  );
}

function DesignCard({ d, index, onOpen }: { d: Design; index: number; onOpen: (i: LightboxItem) => void }) {
  const isVideo = Boolean(d.video_url);
  const src = (d.video_url || d.image_url) as string | null;
  return (
    <Card
      index={index}
      title={d.title}
      onOpen={src ? () => onOpen({ kind: isVideo ? "video" : "image", src: src, title: d.title }) : undefined}
      media={
        isVideo && d.video_url ? (
          <MediaVideo src={d.video_url} title={d.title} className="h-56 w-full object-cover" />
        ) : d.image_url ? (
          <MediaImage src={d.image_url} alt={d.title} className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 items-center justify-center bg-fg/[0.04] text-sm text-fg/40">لا توجد معاينة</div>
        )
      }
    >
      <h3 className="text-cyan">{d.title}</h3>
      {d.category && <p className="mt-1 text-xs text-fg/50">{d.category}</p>}
    </Card>
  );
}

export default function PortfolioGallery({ data }: { data: Portfolio }) {
  const [tab, setTab] = useState<Tab>("projects");
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const empty = <p className="py-16 text-center text-fg/50">لا يوجد محتوى منشور في هذا القسم بعد.</p>;

  const content = {
    projects: data.projects.length ? (
      <div className="grid gap-5 md:grid-cols-2">
        {data.projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} index={i} onOpen={setLightbox} />
        ))}
      </div>
    ) : empty,
    apps: data.apps.length ? (
      <div className="grid gap-5 md:grid-cols-2">
        {data.apps.map((a, i) => (
          <AppCard key={a.id} a={a} index={i} onOpen={setLightbox} />
        ))}
      </div>
    ) : empty,
    designs: data.designs.length ? (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.designs.map((d, i) => (
          <DesignCard key={d.id} d={d} index={i} onOpen={setLightbox} />
        ))}
      </div>
    ) : empty,
  };

  return (
    <section id="works" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <h2 className="reveal mb-8 text-center text-3xl font-light tracking-wide text-neon md:text-5xl">معرض الأعمال</h2>
      <div className="reveal mb-8 flex flex-wrap justify-center gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-5 py-2 text-sm transition duration-300 ${
              tab === t.key ? "btn-primary border-transparent" : "border-fg/20 text-fg/70 hover:border-cyan hover:text-cyan"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={tab}>{content[tab]}</div>
      {lightbox && <Lightbox item={lightbox} onClose={closeLightbox} />}
    </section>
  );
}
