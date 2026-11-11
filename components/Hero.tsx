"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import type { Group } from "three";

function TechCore() {
  const groupRef = useRef<Group>(null);
  const cubesRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.15;
      groupRef.current.rotation.y += delta * 0.25;
    }
    if (cubesRef.current) {
      cubesRef.current.rotation.y -= delta * 0.4;
    }
  });

  return (
    <group>
      {/* الكرة الشبكية الخارجية */}
      <group ref={groupRef}>
        <mesh>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshStandardMaterial
            color="#c9a878"
            wireframe
            emissive="#c9a878"
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* النواة الصلبة الداخلية */}
        <mesh>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#c9a878" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* مكعبات صغيرة تدور حول المجسم (رمز للتصميم والبرمجة) */}
      <group ref={cubesRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 2.6, Math.sin(angle * 2) * 0.4, Math.sin(angle) * 2.6]}>
              <boxGeometry args={[0.22, 0.22, 0.22]} />
              <meshStandardMaterial color="#f5f5f5" metalness={0.6} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
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
          <TechCore />
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
