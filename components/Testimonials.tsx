"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSiteImages } from "@/app/context/SiteImagesContext";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();
  const siteImages = useSiteImages();
  const QUOTES = t.testimonials;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // Pauses while hovered or focused, and never auto-rotates for visitors
  // who asked for reduced motion.
  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 4800);
    return () => clearInterval(timer);
  }, [QUOTES.length, paused, reduceMotion]);

  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={siteImages.testimonials}
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-obsidian/85" />
      </div>

      <div
        className="relative mx-auto max-w-3xl px-6 text-center min-h-55 flex flex-col items-center justify-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <span className="font-display text-5xl text-gold/50 mb-4">&ldquo;</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-serif-alt italic text-2xl sm:text-3xl text-cream leading-snug">
              {QUOTES[i].text}
            </p>
            <p className="mt-6 text-xs tracking-[0.3em] uppercase text-gold-bright">
              {QUOTES[i].author}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-1 mt-8">
          {QUOTES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`${idx + 1} / ${QUOTES.length}`}
              aria-current={idx === i}
              onClick={() => setI(idx)}
              className="flex h-8 min-w-8 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  idx === i ? "w-8 bg-gold" : "w-1.5 bg-cream/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
