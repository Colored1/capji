"use client";

import { useEffect, useState } from "react";

const KEY = "capji-theme";

function readStored(): "dark" | "light" {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(readStored());
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* التخزين غير متاح: يبقى التبديل لهذه الجلسة فقط */
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      className="relative flex h-9 w-16 shrink-0 items-center rounded-full border border-fg/15 bg-fg/5 p-1 transition hover:border-cyan/60"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-violet text-white shadow-glow transition-transform duration-500 ease-out ${
          isDark ? "translate-x-0" : "-translate-x-7"
        }`}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-700" fill="currentColor" aria-hidden>
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
