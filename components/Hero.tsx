"use client";

import { useEffect, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import type { Group } from "three";
import { site } from "@/lib/site";

type Pointer = MutableRefObject<{ x: number; y: number }>;

function ReactiveCore({ pointer }: { pointer: Pointer }) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const targetX = pointer.current.y * 0.45;
    const targetY = pointer.current.x * 0.7 + state.clock.elapsedTime * 0.12;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial color="#22d3ee" wireframe emissive="#22d3ee" emissiveIntensity={0.35} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.2} emissive="#8b5cf6" emissiveIntensity={0.15} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.6, Math.sin(angle * 2) * 0.4, Math.sin(angle) * 2.6]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color="#c9a878" metalness={0.7} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Hero() {
  const pointer = useRef({ x: 0, y: 0 });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(titleRef.current, { opacity: 0, y: 60, duration: 1.2 }).from(textRef.current, { opacity: 0, y: 20, duration: 1 }, "-=0.7");
  }, []);

  function handleMove(e: ReactPointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: -(((e.clientY - r.top) / r.height) * 2 - 1),
    };
  }

  return (
    <section id="hero" onPointerMove={handleMove} className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20 text-center">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <pointLight position={[-3, -2, 3]} color="#8b5cf6" intensity={2} />
          <ReactiveCore pointer={pointer} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-4xl">
        <p className="mb-5 inline-block rounded-full border border-cyan/30 bg-cyan/5 px-4 py-1 text-xs tracking-widest text-cyan">
          {site.tagline}
        </p>
        <h1 ref={titleRef} className="text-neon text-5xl font-light leading-tight md:text-8xl">
          {site.ownerName}
        </h1>
        <div ref={textRef}>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-fg/70 md:text-lg">{site.ownerTitle}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#works" className="btn-ghost rounded-full px-7 py-3 text-fg">
              استكشف أعمالي
            </a>
            <a href="#request" className="btn-primary rounded-full px-7 py-3 font-semibold">
              اطلب خدمة أو حل مشكلتك
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
