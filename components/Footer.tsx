import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 px-6 py-10 text-center text-sm text-white/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.png" alt={site.brand} className="mx-auto h-16 w-auto opacity-90" />
      <p className="mt-2">{site.tagline}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <a href={`mailto:${site.email}`} className="hover:text-gold">{site.email}</a>
        <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
          واتساب {site.whatsappDisplay}
        </a>
        <span>{site.location}</span>
      </div>
      <p className="mt-6 text-xs text-white/40">© {new Date().getFullYear()} {site.ownerName}</p>
    </footer>
  );
}
