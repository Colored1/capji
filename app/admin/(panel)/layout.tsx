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
      <aside className="border-b border-white/10 bg-black/60 p-5 md:w-64 md:border-b-0 md:border-l md:min-h-screen">
        <p className="mb-6 tracking-[0.3em] text-gold">CAPJI</p>
        <nav className="flex flex-wrap gap-2 md:flex-col">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="rounded-xl px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-gold">
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
