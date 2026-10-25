"use client";

import { MotionConfig } from "framer-motion";

/** Turns off Framer Motion transforms for visitors who prefer reduced motion. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
