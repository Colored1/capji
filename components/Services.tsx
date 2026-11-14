const services = [
  { title: "صيانة الأنظمة والحواسيب", desc: "تشخيص الأعطال وإصلاح الهاردوير والبرمجيات وتجهيز الأجهزة للعمل بكفاءة." },
  { title: "إدارة الشبكات", desc: "تصميم وتركيب وضبط الشبكات المحلية والاتصال اللاسلكي، مع متابعة الأداء." },
  { title: "الأمن السيبراني", desc: "تحليل المخاطر وتأمين الأنظمة والحسابات وحمايتها من الاختراق." },
  { title: "حل المشكلات التقنية", desc: "أخبرني بمشكلتك وأقدّم حلاً واضحاً خطوة بخطوة، سواء كانت برمجية أو هاردوير." },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <h2 className="reveal mb-10 text-center text-3xl font-light tracking-wide text-neon md:text-5xl">الحلول التقنية</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {services.map((s, i) => (
          <div key={s.title} className="reveal glass-card p-8">
            <span className="mb-4 block font-mono text-sm text-violet">0{i + 1}</span>
            <h3 className="mb-3 text-xl text-cyan">{s.title}</h3>
            <p className="leading-relaxed text-fg/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
