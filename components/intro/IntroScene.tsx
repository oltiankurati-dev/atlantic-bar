"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import IntroWorld from "./IntroWorld";

/**
 * Everything three.js lives behind this file, which IntroExperience loads
 * with next/dynamic — so visitors who never see the 3D intro (reduced
 * motion, repeat visit) never download it.
 */
export default function IntroScene({
  progressRef,
  dragRef,
  lowPower,
}: {
  progressRef: RefObject<number>;
  dragRef: RefObject<{ yaw: number; pitch: number }>;
  lowPower: boolean;
}) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.3] : [1, 1.8]}
      gl={{ antialias: !lowPower, powerPreference: lowPower ? "default" : "high-performance" }}
      camera={{ fov: 55, near: 0.1, far: 120, position: [0, 0.3, 6] }}
    >
      <IntroWorld progressRef={progressRef} dragRef={dragRef} lowPower={lowPower} />
    </Canvas>
  );
}
