import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-fg/10 px-6 py-10 text-center text-sm text-fg/60">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <img src="/brand/mark-dark.png" alt={site.brand} className="logo-dark h-16 w-auto" />
        <img src="/brand/mark-light.png" alt="" aria-hidden className="logo-light h-16 w-auto" />
        <p className="tracking-[0.3em] text-fg/50">{site.tagline}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-5">
          <a href={`mailto:${site.email}`} className="transition hover:text-cyan">{site.email}</a>
          <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition hover:text-cyan">
            واتساب {site.whatsappDisplay}
          </a>
          <span>{site.location}</span>
        </div>
        <p className="mt-4 text-xs text-fg/40">© {new Date().getFullYear()} {site.ownerName}</p>
      </div>
    </footer>
  );
}
