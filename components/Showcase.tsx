import ModelViewer from "@/components/ModelViewer";

export default function Showcase() {
  return (
    <section className="showcase">
      <h2 className="section-title">أعمالنا ثلاثية الأبعاد</h2>

      <div className="model-grid">
        <ModelViewer src="/models/laptop-setup.glb" label="جهاز تقني" />
        <ModelViewer src="/models/scene-a/scene.gltf" label="مجسم تصميم" />
        <ModelViewer src="/models/scene-b/scene.gltf" label="مجسم فاخر" />
      </div>

      <div className="video-card">
        <video
          className="video-bg"
          src="/media/video/bg-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <p className="video-caption">CAPJI • Creative • Media • Technology</p>
      </div>
    </section>
  );
}
