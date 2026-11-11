import ModelViewer from "@/components/ModelViewer";

const videos = [
  { src: "/media/video/bg-1.mp4", label: "فيديو تقني" },
  { src: "/media/video/bg-2.mp4", label: "فيديو تصميم" },
];

export default function Showcase() {
  return (
    <section className="showcase">
      <div className="model-grid">
        <ModelViewer src="/models/laptop-setup.glb" label="جهاز تقني" />
        <ModelViewer src="/models/scene-a/scene.gltf" label="مجسم تصميم" />
        <ModelViewer src="/models/scene-b/scene.gltf" label="مجسم فاخر" />
      </div>

      <div className="model-grid video-row">
        {videos.map((v) => (
          <figure key={v.src} className="model-card">
            <div className="model-canvas">
              <video
                className="video-bg"
                src={v.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
            <figcaption className="model-label">{v.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
