import CrudManager from "@/components/admin/CrudManager";

export default function AppsAdmin() {
  return (
    <CrudManager
      table="apps"
      title="تطبيقات الجوال"
      columns={[{ key: "name", label: "اسم التطبيق" }, { key: "version", label: "الإصدار" }]}
      fields={[
        { key: "name", label: "اسم التطبيق", required: true },
        { key: "version", label: "رقم الإصدار", hint: "مثل: 1.0.3" },
        { key: "description", label: "الوصف", type: "textarea" },
        { key: "features", label: "المميزات", type: "textarea", hint: "سطر لكل ميزة" },
        { key: "screenshots", label: "لقطات الشاشة", type: "files", accept: "image/*", hint: "ارفع صوراً أو ألصق روابطها، رابط في كل سطر" },
        { key: "download_url", label: "رابط التحميل (APK أو المتجر)", type: "url" },
      ]}
    />
  );
}
