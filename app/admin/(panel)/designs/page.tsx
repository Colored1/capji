import CrudManager from "@/components/admin/CrudManager";

export default function DesignsAdmin() {
  return (
    <CrudManager
      table="designs"
      title="التصاميم والمونتاج"
      columns={[{ key: "title", label: "العنوان" }, { key: "category", label: "التصنيف" }]}
      fields={[
        { key: "title", label: "العنوان", required: true },
        { key: "category", label: "التصنيف", type: "select", options: ["graphic", "video", "motion"] },
        { key: "image_url", label: "صورة التصميم", type: "file", accept: "image/*" },
        { key: "video_url", label: "فيديو المونتاج", type: "file", accept: "video/*" },
      ]}
    />
  );
}
