"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAllDefaultMenuItems } from "@/lib/defaultMenu";
import SectionHeading from "./SectionHeading";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";

interface Drink {
  id?: string;
  name: string;
  note: string;
  price: string;
  imageUrl: string;
}

// Shown until the menu API answers, and kept if it fails — the same
// built-in menu the API falls back to, so the site never shows an empty
// or made-up menu.
const DEFAULT_DRINKS: Drink[] = getAllDefaultMenuItems();

export default function Cocktails() {
  const { t } = useLanguage();
  const [drinks, setDrinks] = useState<Drink[]>(DEFAULT_DRINKS);

  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) setDrinks(data.items);
      })
      .catch(() => {
        // Keep the defaults on any failure — never show a broken/empty menu.
      });
  }, []);

  return (
    <section id="cocktails" className="relative bg-charcoal py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading eyebrow={t.cocktails.eyebrow} title={t.cocktails.title} />
        <div className="mt-8 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-gold hover:text-gold-bright transition-colors"
          >
            {t.cocktails.seeMore}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {drinks.slice(0, 4).map((d, i) => (
            <motion.div
              key={d.id ?? d.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10 }}
              className="group relative bg-obsidian border border-gold/15 hover:border-gold/50 transition-colors duration-500"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={d.imageUrl}
                  alt={d.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gold/10" />
              </div>
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl text-cream tracking-wide">{d.name}</h3>
                  <span className="font-display text-gold-bright text-lg shrink-0">€{d.price}</span>
                </div>
                <p className="text-smoke text-sm mt-3 leading-relaxed">{d.note}</p>
              </div>
              <span className="absolute top-4 right-4 h-8 w-8 rounded-full border border-gold/40 bg-obsidian/60 backdrop-blur flex items-center justify-center text-gold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                ✦
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
