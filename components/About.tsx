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
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="mb-8 text-center text-3xl font-light tracking-wide text-gold md:text-4xl">نبذة عني</h2>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-lg leading-loose text-white/80">{about}</p>
        <p className="mt-6 text-sm text-white/50">{site.ownerTitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {skills.map((s) => (
            <span key={s} className="rounded-full border border-gold/30 px-4 py-1 font-mono text-xs text-gold">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${site.email}`} className="text-white/80 hover:text-gold">{site.email}</a>
          <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-gold">
            واتساب {site.whatsappDisplay}
          </a>
          <span className="text-white/60">{site.location}</span>
          {social.map(([name, url]) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-gold">{name}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
