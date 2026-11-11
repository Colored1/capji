import ServiceForm from "@/components/ServiceForm";

export const metadata = { title: "الخدمات | CAPJI" };

const services = [
  { title: "تصميم واجهات المواقع", desc: "تصميم فاخر وحديث يناسب علامتك التجارية." },
  { title: "تطوير المواقع", desc: "مواقع سريعة بتقنيات حديثة مثل Next.js وThree.js." },
  { title: "تصميم الهوية البصرية", desc: "شعارات وألوان وأدوات تعبّر عن هويتك." },
];

export default function ServicesPage() {
  return (
    <main className="page">
      <h1 className="page-title">الخدمات</h1>

      <div className="services-grid">
        {services.map((s) => (
          <div key={s.title} className="service-card">
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="page-subtitle">اطلب خدمة</h2>
      <ServiceForm />
    </main>
  );
}
