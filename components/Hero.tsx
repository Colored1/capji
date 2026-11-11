"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import type { Mesh } from "three";

function GoldKnot() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 200, 32]} />
      <meshStandardMaterial color="#c9a878" metalness={0.9} roughness={0.25} />
    </mesh>
  );
}

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(titleRef.current, { opacity: 0, y: 60, duration: 1.4 }).from(
      subRef.current,
      { opacity: 0, y: 20, duration: 1 },
      "-=0.8"
    );
  }, []);

  return (
    <section className="hero">
      <div className="hero-canvas">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <GoldKnot />
        </Canvas>
      </div>
      <div className="hero-text">
        <h1 ref={titleRef} className="hero-title">
          CAPJI
        </h1>
        <p ref={subRef} className="hero-sub">
          Creative • Media • Technology
        </p>
      </div>
    </section>
  );
}
