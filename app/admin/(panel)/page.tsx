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
    { label: "المشاريع البرمجية", value: projects },
    { label: "تطبيقات الجوال", value: apps },
    { label: "التصاميم والمونتاج", value: designs },
    { label: "إجمالي الطلبات", value: inquiries },
    { label: "طلبات جديدة", value: newInquiries },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl text-gold">نظرة عامة</h1>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/60">{s.label}</p>
            <p className="mt-3 text-4xl font-light text-gold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
