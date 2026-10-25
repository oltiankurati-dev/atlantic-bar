"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  align = "center",
  light = false,
  as = "h2",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
  light?: boolean;
  /** "h1" on pages where this is the main heading. */
  as?: "h1" | "h2";
}) {
  const Heading = as === "h1" ? motion.h1 : motion.h2;
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="font-script text-2xl md:text-3xl text-gold-bright/90 mb-1"
      >
        {eyebrow}
      </motion.p>
      <Heading
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.08 }}
        className={`font-display text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase ${
          light ? "text-cream" : "text-cream"
        }`}
      >
        {title}
      </Heading>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent mt-5 ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
