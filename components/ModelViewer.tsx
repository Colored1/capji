"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

export default function ModelViewer({ src, label }: { src: string; label: string }) {
  return (
    <figure className="model-card">
      <div className="model-canvas">
        <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]}>
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <Model src={src} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enablePan={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>
      <figcaption className="model-label">{label}</figcaption>
    </figure>
  );
}
