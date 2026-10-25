"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/app/context/LanguageContext";

const IntroScene = dynamic(() => import("./IntroScene"), { ssr: false });

type Phase = "playing" | "wiping" | "done";

const INTRO_SEEN_KEY = "atlantic-intro-seen";

export default function IntroExperience({ onFinish }: { onFinish: () => void }) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("playing");
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  const progressRef = useRef(0);
  const dragRef = useRef({ yaw: 0, pitch: 0 });
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const finished = useRef(false);

  const beginTransition = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // private browsing / storage disabled — worst case the intro replays
    }
    setPhase("wiping");
    window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
      onFinish();
    }, 1050);
  }, [onFinish]);

  useEffect(() => {
    // Already played once this browser session (e.g. the customer just came
    // back from /login to finish booking a table) — skip straight through
    // instead of trapping them behind the intro a second time.
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch {
      // ignore — treat as not seen
    }
    if (alreadySeen) {
      onFinish();
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount flag, required to avoid SSR/hydration mismatch for window-dependent 3D scene
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    // Touch devices are the main signal, but some laptops have a mouse and
    // still a weak GPU/CPU — catch those too via hardware hints where the
    // browser exposes them (not all do, so this only ever adds coverage,
    // never removes it).
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const weakCPU = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
    const weakMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
    setLowPower(coarsePointer || weakCPU || weakMemory);

    if (mq.matches) {
      const t = window.setTimeout(beginTransition, 500);
      return () => window.clearTimeout(t);
    }

    document.body.style.overflow = "hidden";

    // Keyboard users can't scroll or drag the scene — let them enter.
    const onKeyDown = (e: KeyboardEvent) => {
      if (["Escape", "Enter", " ", "PageDown", "ArrowDown", "End"].includes(e.key)) {
        e.preventDefault();
        beginTransition();
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      progressRef.current = Math.min(1, Math.max(0, progressRef.current + e.deltaY * 0.00055));
      if (progressRef.current >= 0.985) beginTransition();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      dragging.current = true;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const dy = touchStartY - y;
      progressRef.current = Math.min(1, Math.max(0, progressRef.current + dy * 0.0022));
      touchStartY = y;
      if (progressRef.current >= 0.985) beginTransition();

      const dxDrag = x - lastPointer.current.x;
      const dyDrag = y - lastPointer.current.y;
      dragRef.current.yaw = Math.max(-0.9, Math.min(0.9, dragRef.current.yaw - dxDrag * 0.0025));
      dragRef.current.pitch = Math.max(-0.35, Math.min(0.35, dragRef.current.pitch - dyDrag * 0.0025));
      lastPointer.current = { x, y };
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      dragRef.current.yaw = Math.max(-0.9, Math.min(0.9, dragRef.current.yaw - dx * 0.0028));
      dragRef.current.pitch = Math.max(-0.35, Math.min(0.35, dragRef.current.pitch - dy * 0.0028));
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      dragging.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.overflow = "";
    };
  }, [beginTransition, onFinish]);

  if (!ready || phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label={t.intro.walkTheRoom}
    >
      {!reduced && <IntroScene progressRef={progressRef} dragRef={dragRef} lowPower={lowPower} />}
      {reduced && <div className="absolute inset-0 bg-obsidian" />}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/70 via-transparent to-obsidian/80" />

      {!reduced && (
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 pointer-events-none">
          <p className="font-script text-2xl sm:text-3xl text-gold-bright drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            {t.intro.walkTheRoom}
          </p>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-cream/70">
            <span>{t.intro.scrollToEnter}</span>
            <span className="text-gold">·</span>
            <span>{t.intro.dragToLook}</span>
          </div>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-7 w-px bg-gradient-to-b from-gold to-transparent"
          />
        </div>
      )}

      <AnimatePresence>
        {phase === "playing" && (
          <motion.button
            type="button"
            autoFocus
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={beginTransition}
            className="absolute bottom-8 right-8 text-[11px] tracking-[0.25em] uppercase text-cream bg-obsidian/70 backdrop-blur hover:text-gold-bright border border-cream/40 hover:border-gold/60 px-5 py-3 transition-colors"
          >
            {t.intro.skipIntro}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "wiping" && (
          <div className="absolute inset-0 z-10">
            <motion.div
              initial={{ x: "0%" }}
              animate={{ x: "-101%" }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-[#0a0806] via-[#15100a] to-[#1d1610] border-r border-gold/40"
            />
            <motion.div
              initial={{ x: "0%" }}
              animate={{ x: "101%" }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#0a0806] via-[#15100a] to-[#1d1610] border-l border-gold/40"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
