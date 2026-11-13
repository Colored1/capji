import { site } from "@/lib/site";
import GoogleAuthButton from "@/components/GoogleAuthButton";

const links = [
  { href: "#about", label: "عني" },
  { href: "#works", label: "الأعمال" },
  { href: "#services", label: "الحلول التقنية" },
  { href: "#request", label: "اطلب خدمة" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-gradient-to-b from-black/90 to-transparent px-4 py-4 md:px-8">
      <a href="#top" className="text-2xl text-gold font-light">
        {site.brand}
      </a>
      <nav className="flex flex-wrap items-center justify-end gap-3 text-xs text-white/80 md:gap-6 md:text-sm">
        <GoogleAuthButton />
        {links.map((l) => (
          <a key={l.href} href={l.href} className="transition hover:text-gold">
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
