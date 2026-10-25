"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PHOTOS } from "@/lib/images";
import { useSiteImages } from "@/app/context/SiteImagesContext";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/app/context/LanguageContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

interface SpielzeugItem {
  name: string;
  note: string;
  price: string;
  imageUrl: string;
}

const SPIELZEUG_ITEMS: SpielzeugItem[] = [
  { name: "Vintage Bar Cart", note: "Brass & glass, 1920s French provenance. Two tiers, locking wheels.", price: "2,800", imageUrl: PHOTOS.barFloor },
  { name: "Crystal Decanter Set", note: "Hand-cut Bohemian crystal, 6 pieces. Carafe + 5 tumblers.", price: "1,200", imageUrl: PHOTOS.pendantLamps },
  { name: "Leather Dice Cup", note: "Vegetable-tanned leather, brass fittings. Hand-stitched in Florence.", price: "380", imageUrl: PHOTOS.whiskeyWoodTable },
  { name: "Silver Jigger", note: "Sterling silver, hallmarked London 1952. 30/60ml measures.", price: "650", imageUrl: PHOTOS.whiskeyWhiteTable },
  { name: "Oak Aging Barrel", note: "2L American oak, charred interior. Ages spirits in weeks.", price: "420", imageUrl: PHOTOS.whiskeyWood2 },
  { name: "Absinthe Fountain", note: "4-spout, brass, Belle Époque replica. Slow-drip perfection.", price: "1,850", imageUrl: PHOTOS.cigarFire },
  { name: "Cocktail Smoker Kit", note: "Walnut base, torch, wood chips (apple, cherry, hickory).", price: "290", imageUrl: PHOTOS.fireplaceLounge },
  { name: "Bar Spoon Set", note: "Japanese stainless, twisted shaft, weighted teardrop. 3 lengths.", price: "180", imageUrl: PHOTOS.whiskeyOrange },
  { name: "Ice Press Sphere", note: "Aluminum, 60mm sphere. Perfect clarity, slow melt.", price: "450", imageUrl: PHOTOS.whiskeyIce },
  { name: "Vintage Shaker Tin", note: "Nickel-plated copper, c.1930s. Weighted, flawless seal.", price: "720", imageUrl: PHOTOS.whiskeyBrown },
  { name: "Bitters Bottle Set", note: "4 x 100ml amber glass, dropper tops. Angostura, Peychaud's, Orange, Chocolate.", price: "220", imageUrl: PHOTOS.cocktailOlives },
  { name: "Leather Coaster Set", note: "8 pieces, Horween Chromexcel, brass snap case. Patinas beautifully.", price: "160", imageUrl: PHOTOS.woodenTable },
  { name: "Gold Rim Glassware", note: "Set of 6 coupes, 24k gold rim. Mouth-blown in Czech Republic.", price: "950", imageUrl: PHOTOS.heroPour },
  { name: "Barrel-Aged Negroni", note: "5L oak barrel, pre-filled. Ready in 30 days. Yields ~30 serves.", price: "580", imageUrl: PHOTOS.whiskeyOrange },
  { name: "Cigar Humidor", note: "Spanish cedar, 50-count. Digital hygrometer, magnetic seal.", price: "1,450", imageUrl: PHOTOS.cigarFire },
  { name: "Tasting Journal", note: "Leather-bound, 200 pages. Structured tasting template, foil-stamped.", price: "85", imageUrl: PHOTOS.woodenTable },
];

export default function SpielzeugPage() {
  const { locale, t } = useLanguage();
  const siteImages = useSiteImages();

  // The seven admin-editable Spielzeug photos, cycled across the product grid.
  const productImages = [
    siteImages.spielzeug1,
    siteImages.spielzeug2,
    siteImages.spielzeug3,
    siteImages.spielzeug4,
    siteImages.spielzeug5,
    siteImages.spielzeug6,
    siteImages.spielzeug7,
  ].filter(Boolean);

  return (
    <>
      <CursorGlow />
      <Nav />
      <main id="main" className="pt-20">
        <section className="relative bg-charcoal py-28 md:py-36">
          <div className="absolute inset-0">
            <Image
              src={siteImages.spielzeug3}
              alt="Cozy fireplace lounge area"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/85 to-obsidian/60" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 md:px-10">
            <div className="mb-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-smoke hover:text-gold-bright transition-colors"
              >
                <span aria-hidden>←</span> {locale === "de" ? "Zurück zur Startseite" : "Back to main page"}
              </Link>
            </div>
            <SectionHeading eyebrow={t.spielzeug.eyebrow} title={t.spielzeug.title} align="center" as="h1" />

            <p className="mt-8 max-w-3xl mx-auto text-center text-smoke leading-relaxed">
              {t.spielzeug.description}
            </p>

            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SPIELZEUG_ITEMS.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-obsidian/80 border border-gold/15 hover:border-gold/50 transition-colors duration-500 backdrop-blur-sm"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={
                        productImages.length > 0
                          ? productImages[i % productImages.length]
                          : item.imageUrl
                      }
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/10 to-transparent" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gold/10" />
                  </div>
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-lg text-cream tracking-wide">{item.name}</h3>
                      <span className="font-display text-gold-bright text-lg shrink-0">${item.price}</span>
                    </div>
                    <p className="text-smoke text-sm mt-3 leading-relaxed">{item.note}</p>
                  </div>
                  <span className="absolute top-4 right-4 h-8 w-8 rounded-full border border-gold/40 bg-obsidian/60 backdrop-blur flex items-center justify-center text-gold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    ✦
                  </span>
                </motion.div>
              ))}
            </div>

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