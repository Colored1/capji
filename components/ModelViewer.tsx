"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls, useGLTF } from "@react-three/drei";

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return <primitive object={scene} />;
}

export default function ModelViewer({ src, label }: { src: string; label: string }) {
  return (
    <figure className="model-card">
      <div className="model-canvas">
        <Canvas dpr={[1, 2]} camera={{ fov: 40 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
              <Model src={src} />
            </Stage>
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>
      <figcaption className="model-label">{label}</figcaption>
    </figure>
  );
}
