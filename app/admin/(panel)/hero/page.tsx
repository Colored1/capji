import HeroSlidesManager from "@/components/admin/HeroSlidesManager";

export default function HeroAdmin() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-neon mb-2 text-3xl font-light">واجهة الموقع (Hero)</h1>
        <p className="text-sm text-fg/60">فقط الصور والفيديوهات التي تضيفها هنا تظهر في الصفحة الرئيسية.</p>
      </div>
      <HeroSlidesManager />
    </div>
  );
}
