"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { MenuCategory } from "@/lib/defaultMenu";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/app/context/LanguageContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

type TabKey = MenuCategory;

export interface MenuItem {
  id: string;
  category: TabKey;
  name: string;
  note: string;
  price: string;
  imageUrl: string;
  order: number;
}

const TABS: { key: TabKey; labelKey: TabKey }[] = [
  { key: "signature", labelKey: "signature" },
  { key: "classics", labelKey: "classics" },
  { key: "spirits", labelKey: "spirits" },
  { key: "wine", labelKey: "wine" },
  { key: "champagne", labelKey: "champagne" },
  { key: "nonAlcoholic", labelKey: "nonAlcoholic" },
  { key: "barSnacks", labelKey: "barSnacks" },
];

/** Items come from the server (cached), so the real menu is in the HTML. */
export default function MenuView({ items }: { items: MenuItem[] }) {
  const { locale, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("signature");

  const visibleItems = items
    .filter((item) => item.category === activeTab)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <CursorGlow />
      <Nav />
      <main id="main" className="pt-20">
        <section className="relative bg-charcoal py-28 md:py-36">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-smoke hover:text-gold-bright transition-colors"
              >
                <span aria-hidden>←</span> {locale === "de" ? "Zurück zur Startseite" : "Back to main page"}
              </Link>
            </div>
            <SectionHeading eyebrow={t.menu.eyebrow} title={t.menu.title} as="h1" />
            
            <div className="mt-12 overflow-x-auto">
              <div className="flex gap-4 pb-4" role="group" aria-label={locale === "de" ? "Kategorien" : "Categories"}>
                {TABS.map((tab, i) => (
                  <button
                    key={tab.key}
                    type="button"
                    aria-pressed={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`whitespace-nowrap px-6 py-3 text-xs tracking-[0.2em] uppercase transition-colors duration-300 rounded-full border ${
                      activeTab === tab.key
                        ? "bg-gold text-obsidian border-gold"
                        : "bg-transparent text-smoke border-gold/30 hover:border-gold hover:text-gold-bright"
                    }`}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    {t.menu.tabs[tab.labelKey as keyof typeof t.menu.tabs]}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {visibleItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-obsidian border border-gold/15 hover:border-gold/50 transition-colors duration-500"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      loading={i < 3 ? "eager" : "lazy"}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/10 to-transparent" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gold/10" />
                  </div>
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl text-cream tracking-wide">{item.name}</h3>
                      <span className="font-display text-gold-bright text-lg shrink-0">€{item.price}</span>
                    </div>
                    <p className="text-smoke text-sm mt-3 leading-relaxed">{item.note}</p>
                  </div>
                  <span className="absolute top-4 right-4 h-8 w-8 rounded-full border border-gold/40 bg-obsidian/60 backdrop-blur flex items-center justify-center text-gold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    ✦
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-16 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-gold hover:text-gold-bright transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {locale === "de" ? "Zurück zur Lounge" : "Back to Lounge"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}