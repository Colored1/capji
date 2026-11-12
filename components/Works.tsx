"use client";

import { useState } from "react";
import type { App, Design, Portfolio, Project } from "@/lib/data";

type Tab = "projects" | "apps" | "designs";

const tabs: { key: Tab; label: string }[] = [
  { key: "projects", label: "المشاريع البرمجية" },
  { key: "apps", label: "تطبيقات الجوال" },
  { key: "designs", label: "التصاميم والمونتاج" },
];

const card = "overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-gold/50";

function Empty() {
  return <p className="py-16 text-center text-white/50">لا يوجد محتوى منشور في هذا القسم بعد.</p>;
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <div className={card}>
      {p.cover_url && <img src={p.cover_url} alt={p.title} className="h-48 w-full object-cover" />}
      <div className="p-6">
        <h3 className="mb-2 text-xl text-gold">{p.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-white/70">{p.description}</p>
        {p.tech && (
          <div className="mb-4 flex flex-wrap gap-2">
            {p.tech.split(",").map((t) => (
              <span key={t} className="rounded-full border border-gold/30 px-3 py-1 font-mono text-xs text-gold">{t.trim()}</span>
            ))}
          </div>
        )}
        {p.preview_url && (
          <a href={p.preview_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">معاينة المشروع</a>
        )}
      </div>
    </div>
  );
}

function AppCard({ a }: { a: App }) {
  const shots = (a.screenshots || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const features = (a.features || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <div className={card}>
      {shots.length > 0 && (
        <div className="flex gap-2 overflow-x-auto bg-black/40 p-2">
          {shots.map((s) => (
            <img key={s} src={s} alt={a.name} className="h-56 w-auto rounded-lg object-cover" />
          ))}
        </div>
      )}
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-xl text-gold">{a.name}</h3>
          {a.version && <span className="font-mono text-xs text-white/60">v{a.version}</span>}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-white/70">{a.description}</p>
        {features.length > 0 && (
          <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-white/70">
            {features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
        {a.download_url && (
          <a href={a.download_url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">
            تحميل التطبيق
          </a>
        )}
      </div>
    </div>
  );
}

function DesignCard({ d }: { d: Design }) {
  return (
    <div className={card}>
      {d.video_url ? (
        <video src={d.video_url} controls playsInline preload="metadata" className="h-56 w-full bg-black object-cover" />
      ) : d.image_url ? (
        <img src={d.image_url} alt={d.title} className="h-56 w-full object-cover" />
      ) : null}
      <div className="p-4">
        <h3 className="text-gold">{d.title}</h3>
        {d.category && <p className="mt-1 text-xs text-white/50">{d.category}</p>}
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
    <section id="works" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-10 text-center text-3xl font-light tracking-wide text-gold md:text-4xl">معرض الأعمال</h2>
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              tab === t.key ? "border-gold bg-gold text-black" : "border-white/20 text-white/70 hover:border-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {content[tab]}
    </section>
  );
}
