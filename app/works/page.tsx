import ModelViewer from "@/components/ModelViewer";

export const metadata = { title: "الأعمال | CAPJI" };

export default function WorksPage() {
  return (
    <main className="page">
      <h1 className="page-title">الأعمال</h1>
      <div className="model-grid">
        <ModelViewer src="/models/laptop-setup.glb" label="جهاز تقني" />
        <ModelViewer src="/models/scene-a/scene.gltf" label="مجسم تصميم" />
        <ModelViewer src="/models/scene-b/scene.gltf" label="مجسم فاخر" />
      </div>
    </main>
  );
}
