import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/components/admin/LogoutButton";

const items = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/projects", label: "المشاريع البرمجية" },
  { href: "/admin/apps", label: "تطبيقات الجوال" },
  { href: "/admin/designs", label: "التصاميم والمونتاج" },
  { href: "/admin/inquiries", label: "صندوق الطلبات" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-fg/10 bg-bg/70 p-5 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-l">
        <div className="mb-8 flex items-center gap-3">
          <img src="/brand/mark-dark.png" alt="CAPJI" className="logo-dark h-10 w-auto" />
          <img src="/brand/mark-light.png" alt="" aria-hidden className="logo-light h-10 w-auto" />
          <div>
            <p className="text-neon text-sm font-semibold tracking-[0.25em]">CAPJI</p>
            <p className="text-xs text-fg/50">لوحة التحكم</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 md:flex-col">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-xl border border-transparent px-4 py-2.5 text-sm text-fg/70 transition duration-300 hover:border-cyan/30 hover:bg-fg/5 hover:text-cyan"
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 hidden md:block">
          <LogoutButton />
        </div>
      </aside>
      <section className="flex-1 p-6 md:p-10">
        {children}
        <div className="mt-10 md:hidden">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
