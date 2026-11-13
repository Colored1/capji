import { site } from "@/lib/site";
import type { Settings } from "@/lib/data";

const defaultAbout =
  "أجمع بين ثلاثة مجالات في مكان واحد: هندسة البرمجيات وتطوير التطبيقات والمواقع، وصيانة الهاردوير والشبكات والحماية السيبرانية، والتصميم الجرافيكي والمونتاج والإنتاج المرئي. هذا الدمج يمنح مشاريعي رؤية تقنية متكاملة وجمالاً بصرياً.";
const defaultSkills = "Node.js, PHP, تطوير تطبيقات أندرويد, تصميم مواقع, صيانة حواسيب, إدارة الشبكات, الأمن السيبراني, Photoshop, Premiere";

export default function About({ settings }: { settings: Settings | null }) {
  const about = settings?.about || defaultAbout;
  const skills = (settings?.skills || defaultSkills).split(",").map((s) => s.trim()).filter(Boolean);
  const social = (settings?.social_links || "").split("\n").map((l) => l.split("|")).filter((p) => p.length === 2);

  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-28">
      <h2 className="reveal mb-10 text-center text-3xl font-light tracking-wide text-neon md:text-5xl">نبذة عني</h2>
      <div className="reveal glass-card p-8 md:p-12">
        <p className="text-lg leading-loose text-fg/85">{about}</p>
        <p className="mt-6 text-sm text-cyan/80">{site.ownerTitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {skills.map((s) => (
            <span key={s} className="rounded-full border border-violet/40 bg-violet/10 px-4 py-1 font-mono text-xs text-fg/90">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4 border-t border-fg/10 pt-8 text-sm">
          <a href={`mailto:${site.email}`} className="text-fg/80 transition hover:text-cyan">{site.email}</a>
          <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-fg/80 transition hover:text-cyan">
            واتساب {site.whatsappDisplay}
          </a>
          <span className="text-fg/60">{site.location}</span>
          {social.map(([name, url]) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-fg/80 transition hover:text-cyan">{name}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
