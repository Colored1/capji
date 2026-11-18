import LiveMatchesManager from "@/components/admin/LiveMatchesManager";

export default function LiveAdmin() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-neon mb-2 text-3xl font-light">البث والأرشيف</h1>
        <p className="text-sm text-fg/60">
          أضف المباريات ومصادر البث وتسجيلات MP4، وغيّر الحالة يدوياً أو شغّل المزامنة الآن.
        </p>
      </div>
      <LiveMatchesManager />
    </div>
  );
}
