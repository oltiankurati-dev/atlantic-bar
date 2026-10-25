"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PHOTOS } from "@/lib/images";
import SectionHeading from "./SectionHeading";
import { useLanguage } from "@/app/context/LanguageContext";

type Span = "normal" | "wide" | "large";

interface Shot {
  id?: string;
  label: string;
  imageUrl: string;
  span: Span;
}

const SPAN_CLASSES: Record<Span, string> = {
  normal: "",
  wide: "md:col-span-2",
  large: "md:col-span-2 md:row-span-2",
};

// Shown until (or unless) the client has added their own photos in the
// admin dashboard — the site never shows an empty gallery.
const DEFAULT_SHOTS_DE: Shot[] = [
  { label: "Der Hauptraum", imageUrl: PHOTOS.emptyRoom, span: "large" },
  { label: "Aperitivo-Stunde", imageUrl: PHOTOS.cocktailOlives, span: "normal" },
  { label: "Messing & Licht", imageUrl: PHOTOS.pendantLamps, span: "normal" },
  { label: "Ecke am Kamin", imageUrl: PHOTOS.chairsTables, span: "normal" },
  { label: "Private Séparées", imageUrl: PHOTOS.redChairs, span: "wide" },
  { label: "Später Abend", imageUrl: PHOTOS.eatery, span: "normal" },
  { label: "Der Ausschank", imageUrl: PHOTOS.whiskeyWoodTable, span: "normal" },
];

const DEFAULT_SHOTS_EN: Shot[] = [
  { label: "The Main Room", imageUrl: PHOTOS.emptyRoom, span: "large" },
  { label: "Aperitivo Hour", imageUrl: PHOTOS.cocktailOlives, span: "normal" },
  { label: "Brass & Light", imageUrl: PHOTOS.pendantLamps, span: "normal" },
  { label: "Fireside Corner", imageUrl: PHOTOS.chairsTables, span: "normal" },
  { label: "Private Booths", imageUrl: PHOTOS.redChairs, span: "wide" },
  { label: "Late Seating", imageUrl: PHOTOS.eatery, span: "normal" },
  { label: "The Pour", imageUrl: PHOTOS.whiskeyWoodTable, span: "normal" },
];

// Admin labels are sometimes just "3" or "party" — not useful to a screen
// reader on their own, so give short ones some context.
function galleryAlt(label: string, index: number, locale: "de" | "en") {
  const clean = label.trim();
  const place = "Atlantic Lounge Bar";
  if (!clean || /^\d+$/.test(clean)) {
    return locale === "de" ? `${place} – Galeriebild ${index + 1}` : `${place} – gallery photo ${index + 1}`;
  }
  return `${clean} – ${place}`;
}

export default function Gallery() {
  const { locale, t } = useLanguage();
  const DEFAULT_SHOTS = locale === "de" ? DEFAULT_SHOTS_DE : DEFAULT_SHOTS_EN;
  const [shots, setShots] = useState<Shot[]>(DEFAULT_SHOTS);

  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          setShots(data.items);
        } else {
          setShots(DEFAULT_SHOTS);
        }
      })
      .catch(() => {
        // Keep the defaults on any failure — never show an empty gallery.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return (
    <section id="gallery" className="relative bg-obsidian py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 auto-rows-45 md:auto-rows-40 gap-4">
          {shots.map((s, i) => (
            <motion.div
              key={s.id ?? s.label}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              className={`group relative overflow-hidden ${SPAN_CLASSES[s.span]}`}
            >
              <Image
                src={s.imageUrl}
                alt={galleryAlt(s.label, i, locale)}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-obsidian/85 via-obsidian/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/50 transition-colors duration-500" />
              <p className="absolute bottom-3 left-4 font-display text-xs sm:text-sm tracking-[0.2em] uppercase text-cream md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
