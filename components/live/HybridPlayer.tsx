"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import { getSourceKind, toEmbedUrl, type StreamLink } from "@/lib/live-types";

type Level = { index: number; height: number };

const PLAYBACK_ERROR = "تعذّر تشغيل هذا السيرفر، جرّب سيرفراً آخر";

// مشغّل هجين: HLS مع اختيار الجودة، أو ملف MP4/WEBM للأرشيف، أو إطار تضمين لروابط يوتيوب وغيرها
export default function HybridPlayer({ sources, title }: { sources: StreamLink[]; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [index, setIndex] = useState(0);
  const [levels, setLevels] = useState<Level[]>([]);
  const [quality, setQuality] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const safeIndex = Math.min(index, Math.max(0, sources.length - 1));
  const active: StreamLink | undefined = sources[safeIndex];
  const url = active?.url;
  const kind = url ? getSourceKind(url) : null;

  // تحميل المصدر الحالي (HLS أو ملف مباشر)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url || !kind || kind === "embed") return;

    setError(null);
    setLevels([]);
    setQuality(-1);

    if (kind === "file") {
      video.src = url;
      video.load();
      return;
    }

    // Safari يشغّل HLS مباشرة دون مكتبة
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    let cancelled = false;
    let hls: Hls | null = null;

    (async () => {
      try {
        const { default: HlsCtor } = await import("hls.js");
        if (cancelled) return;
        if (!HlsCtor.isSupported()) {
          setError("متصفحك لا يدعم تشغيل هذا البث");
          return;
        }
        hls = new HlsCtor({ enableWorker: true });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(HlsCtor.Events.MANIFEST_PARSED, (_event, data) => {
          setLevels(data.levels.map((l, i) => ({ index: i, height: l.height })).filter((l) => l.height > 0));
        });
        hls.on(HlsCtor.Events.ERROR, (_event, data) => {
          if (data.fatal) setError(PLAYBACK_ERROR);
        });
      } catch {
        if (!cancelled) setError(PLAYBACK_ERROR);
      }
    })();

    return () => {
      cancelled = true;
      hls?.destroy();
      hlsRef.current = null;
    };
  }, [url, kind]);

  // تطبيق الجودة المختارة على مشغّل HLS (-1 = تلقائي)
  useEffect(() => {
    if (hlsRef.current) hlsRef.current.currentLevel = quality;
  }, [quality]);

  const qualityOptions = levels
    .reduce<Level[]>((acc, l) => (acc.some((x) => x.height === l.height) ? acc : [...acc, l]), [])
    .sort((a, b) => b.height - a.height);

  const btn =
    "rounded-full border px-3.5 py-1.5 text-xs transition duration-300 md:text-sm";
  const on = "border-cyan bg-cyan/15 text-cyan shadow-glow";
  const off = "border-fg/15 text-fg/70 hover:border-cyan/50 hover:text-cyan";

  return (
    <div className="glass-card min-w-0 max-w-full overflow-hidden p-2 md:p-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-fg/50">
            لا يوجد بث متاح لهذه المباراة بعد
          </div>
        )}

        {active && kind === "embed" && (
          <iframe
            key={url}
            src={toEmbedUrl(active.url)}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          />
        )}

        {active && kind !== "embed" && (
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            title={title}
            onError={() => setError(PLAYBACK_ERROR)}
            className="absolute inset-0 h-full w-full"
          />
        )}

        {error && (
          <div className="absolute inset-x-0 bottom-0 bg-black/75 p-3 text-center text-sm text-red-300">{error}</div>
        )}
      </div>

      {sources.length > 0 && (
        <div className="mt-3 space-y-2 px-1 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-fg/50">السيرفر:</span>
            {sources.map((s, i) => (
              <button
                key={`${s.url}-${i}`}
                type="button"
                aria-pressed={i === safeIndex}
                onClick={() => setIndex(i)}
                className={`${btn} ${i === safeIndex ? on : off}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {kind === "hls" && qualityOptions.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-fg/50">الجودة:</span>
              <button type="button" aria-pressed={quality === -1} onClick={() => setQuality(-1)} className={`${btn} ${quality === -1 ? on : off}`}>
                تلقائي
              </button>
              {qualityOptions.map((q) => (
                <button
                  key={q.index}
                  type="button"
                  aria-pressed={quality === q.index}
                  onClick={() => setQuality(q.index)}
                  className={`${btn} ${quality === q.index ? on : off}`}
                >
                  {q.height}p
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
