"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "#about", label: "عني" },
  { href: "#works", label: "الأعمال" },
  { href: "#services", label: "الحلول التقنية" },
  { href: "#request", label: "اطلب خدمة" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-fg/5 bg-bg/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <a href="#top" aria-label={site.brand} className="flex shrink-0 items-center">
          <img src="/brand/mark-dark.png" alt={site.brand} className="logo-dark h-11 w-auto drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]" />
          <img src="/brand/mark-light.png" alt="" aria-hidden className="logo-light h-11 w-auto" />
        </a>

        <nav className="hidden items-center gap-6 text-sm text-fg/80 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="relative transition hover:text-cyan after:absolute after:-bottom-1 after:right-0 after:h-px after:w-0 after:bg-cyan after:transition-all hover:after:w-full">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <div className="hidden md:block">
            <GoogleAuthButton />
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="القائمة"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-fg/15 md:hidden"
          >
            <span className={`h-0.5 w-4 bg-fg transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-4 bg-fg transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-4 bg-fg transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="glass-card mx-4 mb-4 flex flex-col gap-1 p-3 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-fg/90 transition hover:bg-fg/5 hover:text-cyan">
              {l.label}
            </a>
          ))}
          <div className="px-4 py-2">
            <GoogleAuthButton />
          </div>
        </div>
      )}
    </header>
  );
}
