export const metadata = { title: "التحميل | CAPJI" };

// أضف هنا التطبيقات والملفات التي تريد نشرها.
const files: { name: string; desc: string; href: string }[] = [];

export default function DownloadsPage() {
  return (
    <main className="page">
      <h1 className="page-title">التحميل</h1>
      {files.length === 0 ? (
        <p className="page-empty">لا توجد ملفات منشورة حالياً.</p>
      ) : (
        <div className="services-grid">
          {files.map((f) => (
            <a key={f.href} href={f.href} className="service-card" download>
              <h2>{f.name}</h2>
              <p>{f.desc}</p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
