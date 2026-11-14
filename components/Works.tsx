"use client";

import { useState } from "react";
import type { App, Design, Portfolio, Project } from "@/lib/data";
import { MediaImage, MediaVideo } from "@/components/Media";

type Tab = "projects" | "apps" | "designs";

const tabs: { key: Tab; label: string }[] = [
  { key: "projects", label: "المشاريع البرمجية" },
  { key: "apps", label: "تطبيقات الجوال" },
  { key: "designs", label: "التصاميم والمونتاج" },
];

function Empty() {
  return <p className="py-16 text-center text-fg/50">لا يوجد محتوى منشور في هذا القسم بعد.</p>;
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="glass-card overflow-hidden">
      {p.cover_url && <MediaImage src={p.cover_url} alt={p.title} className="h-52 w-full object-cover" />}
      <div className="p-6">
        <h3 className="mb-2 text-xl text-cyan">{p.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-fg/70">{p.description}</p>
        {p.tech && (
          <div className="mb-4 flex flex-wrap gap-2">
            {p.tech.split(",").map((t) => (
              <span key={t} className="rounded-full border border-violet/40 px-3 py-1 font-mono text-xs text-fg/80">{t.trim()}</span>
            ))}
          </div>
        )}
        {p.preview_url && (
          <a href={p.preview_url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan hover:underline">معاينة المشروع</a>
        )}
      </div>
    </div>
  );
}

function AppCard({ a }: { a: App }) {
  const shots = (a.screenshots || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const features = (a.features || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="glass-card overflow-hidden">
      {shots.length > 0 && (
        <div className="flex gap-3 overflow-x-auto bg-fg/[0.03] p-3">
          {shots.map((s) => (
            <MediaImage key={s} src={s} alt={a.name} className="h-56 w-auto shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      )}
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-xl text-cyan">{a.name}</h3>
          {a.version && <span className="font-mono text-xs text-fg/50">v{a.version}</span>}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-fg/70">{a.description}</p>
        {features.length > 0 && (
          <ul className="mb-5 list-inside list-disc space-y-1 text-sm text-fg/70">
            {features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
        {a.download_url && (
          <a href={a.download_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block rounded-full px-6 py-2.5 text-sm font-semibold">
            تحميل التطبيق
          </a>
        )}
      </div>
    </div>
  );
}

function DesignCard({ d }: { d: Design }) {
  return (
    <div className="glass-card overflow-hidden">
      {d.video_url ? (
        <MediaVideo src={d.video_url} title={d.title} className="h-56 w-full object-cover" />
      ) : d.image_url ? (
        <MediaImage src={d.image_url} alt={d.title} className="h-56 w-full object-cover" />
      ) : (
        <div className="flex h-56 items-center justify-center bg-fg/[0.04] text-sm text-fg/40">لا توجد معاينة</div>
      )}
      <div className="p-5">
        <h3 className="text-cyan">{d.title}</h3>
        {d.category && <p className="mt-1 text-xs text-fg/50">{d.category}</p>}
      </div>
    </div>
  );
}

export default function Works({ data }: { data: Portfolio }) {
  const [tab, setTab] = useState<Tab>("projects");

  const content = {
    projects: data.projects.length ? (
      <div className="grid gap-6 md:grid-cols-2">{data.projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
    ) : <Empty />,
    apps: data.apps.length ? (
      <div className="grid gap-6 md:grid-cols-2">{data.apps.map((a) => <AppCard key={a.id} a={a} />)}</div>
    ) : <Empty />,
    designs: data.designs.length ? (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.designs.map((d) => <DesignCard key={d.id} d={d} />)}</div>
    ) : <Empty />,
  };

  return (
    <section id="works" className="mx-auto max-w-6xl px-6 py-28">
      <h2 className="reveal mb-10 text-center text-3xl font-light tracking-wide text-neon md:text-5xl">معرض الأعمال</h2>
      <div className="reveal mb-12 flex flex-wrap justify-center gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-5 py-2 text-sm transition duration-300 ${
              tab === t.key
                ? "btn-primary border-transparent"
                : "border-fg/20 text-fg/70 hover:border-cyan hover:text-cyan"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={tab} className="reveal is-visible">{content[tab]}</div>
    </section>
  );
}
