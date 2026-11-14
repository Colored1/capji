"use client";

import { useState } from "react";

function Fallback({ label, href, className }: { label: string; href: string; className: string }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center gap-3 bg-fg/[0.04] p-4 text-center text-sm text-fg/60`}>
      <span>تعذّر عرض {label}</span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan underline underline-offset-4">
        فتح الملف
      </a>
    </div>
  );
}

export function MediaImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Fallback label="الصورة" href={src} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  );
}

export function MediaVideo({ src, title, className = "" }: { src: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Fallback label="الفيديو" href={src} className={className} />;
  return (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      aria-label={title}
      onError={() => setFailed(true)}
      className={`${className} bg-black`}
    />
  );
}
