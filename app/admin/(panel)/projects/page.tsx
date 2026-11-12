import CrudManager from "@/components/admin/CrudManager";

export default function ProjectsAdmin() {
  return (
    <CrudManager
      table="projects"
      title="المشاريع البرمجية"
      columns={[{ key: "title", label: "العنوان" }, { key: "tech", label: "التقنيات" }]}
      fields={[
        { key: "title", label: "عنوان المشروع", required: true },
        { key: "description", label: "الوصف", type: "textarea" },
        { key: "tech", label: "التقنيات المستخدمة", hint: "افصل بينها بفاصلة، مثل: Next.js, Supabase" },
        { key: "preview_url", label: "رابط المعاينة", type: "url" },
        { key: "cover_url", label: "صورة الغلاف", type: "file", accept: "image/*" },
      ]}
    />
  );
}
