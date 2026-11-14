"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { SlideMedia } from "@/lib/slides";

type Props = {
  slides: SlideMedia[];
  name: string;
  subtitle: string;
};

const INTERVAL_MS = 6500;

export default function HeroSlider({ slides, name, subtitle }: Props) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const startX = useRef<number | null>(null);

  const valid = slides.filter((s) => !failed[s.id]);
  const count = valid.length;
  const active = count ? ((index % count) + count) % count : 0;
  const current = count ? valid[active] : null;
  const currentId = current?.id ?? null;
  const isVideo = current?.kind === "video";

  const next = useCallback(() => setIndex((i) => i + 1), []);
  const prev = useCallback(() => setIndex((i) => i - 1), []);
  const markFailed = useCallback((id: string) => setFailed((f) => ({ ...f, [id]: true })), []);

  // التبديل التلقائي للصور فقط؛ الفيديو يتقدم عند انتهائه
  useEffect(() => {
    if (count < 2 || paused || isVideo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(next, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [count, paused, isVideo, next, index]);

  // تشغيل الفيديو النشط فقط وإيقاف الباقي
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el) return;
      if (id === currentId && !paused) {
        el.currentTime = 0;
        el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    });
  }, [currentId, paused]);

  function onPointerDown(e: RPointerEvent<HTMLElement>) {
    startX.current = e.clientX;
  }

  function onPointerUp(e: RPointerEvent<HTMLElement>) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  }

  return (
    <section
      id="hero"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-bg"
    >
      {/* الوسائط */}
      <div className="absolute inset-0">
        {valid.map((s, i) => {
          const on = i === active;
          return (
            <div
              key={s.id}
              aria-hidden={!on}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${on ? "opacity-100" : "opacity-0"}`}
            >
              {s.kind === "video" ? (
                <video
                  ref={(el) => {
                    videoRefs.current[s.id] = el;
                  }}
                  src={s.src}
                  muted
                  playsInline
                  preload={on ? "auto" : "metadata"}
                  loop={count === 1}
                  onEnded={on ? next : undefined}
                  onError={() => markFailed(s.id)}
                  className={`h-full w-full bg-black object-cover transition-transform duration-[8000ms] ease-out ${on ? "scale-105" : "scale-100"}`}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.src}
                  alt={s.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={() => markFailed(s.id)}
                  className={`h-full w-full object-cover transition-transform duration-[8000ms] ease-out ${on ? "scale-105" : "scale-100"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* طبقات التدرج والزجاج */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/10" />
      <div className="absolute inset-0 bg-gradient-to-l from-bg/70 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(34_211_238/0.15),transparent_55%)]" />

      {/* المحتوى */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-28 md:px-16 md:pb-32">
        <div className="fade-up max-w-3xl">
          <p className="mb-4 inline-block rounded-full border border-cyan/30 bg-cyan/5 px-4 py-1 text-xs tracking-widest text-cyan backdrop-blur">
            {subtitle}
          </p>
          <h1 className="text-neon text-5xl font-light leading-tight md:text-8xl">{name}</h1>
          {current && (
            <div className="mt-5 glass-card inline-block max-w-md px-5 py-3">
              <p className="text-base font-medium text-fg">{current.title}</p>
              {current.subtitle && <p className="mt-1 text-xs text-fg/60">{current.subtitle}</p>}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#works" className="btn-primary rounded-full px-7 py-3 font-semibold">
              استكشف أعمالي
            </a>
            <a href="#request" className="btn-ghost rounded-full px-7 py-3 text-fg">
              اطلب خدمة
            </a>
          </div>
        </div>
      </div>

      {/* أسهم ونقاط التنقل */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="الشريحة السابقة"
            className="glass-card absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-xl text-fg transition hover:text-cyan md:flex"
          >
            ›
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="الشريحة التالية"
            className="glass-card absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-xl text-fg transition hover:text-cyan md:flex"
          >
            ‹
          </button>
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {valid.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`عرض ${s.title}`}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === active ? "w-8 bg-gradient-to-r from-cyan to-violet" : "w-2 bg-fg/30 hover:bg-fg/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
