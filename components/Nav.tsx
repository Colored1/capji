import Link from "next/link";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/works", label: "الأعمال" },
  { href: "/services", label: "الخدمات" },
  { href: "/downloads", label: "التحميل" },
];

export default function Nav() {
  return (
    <header className="nav">
      <Link href="/" className="nav-brand">CAPJI</Link>
      <nav className="nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}
