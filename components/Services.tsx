const services = [
  { title: "صيانة الأنظمة والحواسيب", desc: "تشخيص الأعطال وإصلاح الهاردوير والبرمجيات وتجهيز الأجهزة للعمل بكفاءة." },
  { title: "إدارة الشبكات", desc: "تصميم وتركيب وضبط الشبكات المحلية والاتصال اللاسلكي، مع متابعة الأداء." },
  { title: "الأمن السيبراني", desc: "تحليل المخاطر وتأمين الأنظمة والحسابات وحمايتها من الاختراق." },
  { title: "حل المشكلات التقنية", desc: "أخبرني بمشكلتك وأقدّم حلاً واضحاً خطوة بخطوة، سواء كانت برمجية أو هاردوير." },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-light tracking-wide text-gold md:text-4xl">الحلول التقنية</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-gold/50">
            <h3 className="mb-3 text-xl text-gold">{s.title}</h3>
            <p className="leading-relaxed text-white/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
