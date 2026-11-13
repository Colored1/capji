import { createClient } from "@/lib/supabase/server";

async function count(table: string, filter?: { col: string; val: string }) {
  const supabase = createClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.col, filter.val);
  const { count } = await q;
  return count ?? 0;
}

export default async function DashboardPage() {
  const [projects, apps, designs, inquiries, newInquiries] = await Promise.all([
    count("projects"),
    count("apps"),
    count("designs"),
    count("inquiries"),
    count("inquiries", { col: "status", val: "new" }),
  ]);

  const stats = [
    { label: "المشاريع البرمجية", value: projects, accent: "text-cyan" },
    { label: "تطبيقات الجوال", value: apps, accent: "text-violet" },
    { label: "التصاميم والمونتاج", value: designs, accent: "text-gold" },
    { label: "إجمالي الطلبات", value: inquiries, accent: "text-cyan" },
    { label: "طلبات جديدة", value: newInquiries, accent: "text-violet" },
  ];

  return (
    <div>
      <h1 className="text-neon mb-2 text-3xl font-light">نظرة عامة</h1>
      <p className="mb-10 text-sm text-fg/50">ملخص سريع لمحتوى الموقع والطلبات الواردة.</p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6">
            <p className="text-sm text-fg/60">{s.label}</p>
            <p className={`mt-3 text-5xl font-light ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
