"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteImages } from "@/app/context/SiteImagesContext";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  const siteImages = useSiteImages();

  return (
    <section id="top" className="relative min-h-svh w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.18 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <Image
          src={siteImages.hero}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-b from-obsidian/80 via-obsidian/55 to-obsidian" />
      <div className="absolute inset-0 bg-linear-to-t from-obsidian via-transparent to-obsidian/40" />

      <div className="relative z-10 min-h-svh w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center pt-24 pb-16 px-6 lg:px-12">
        {/* LEFT: Logo */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gold/20 pb-10 md:pb-0 md:pr-8 lg:pr-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex justify-center"
          >
            <Image
              src="/atlantic-logo-gold.png"
              alt="Atlantic Lounge Bar"
              width={480}
              height={210}
              priority
              unoptimized
              className="h-auto w-full max-w-[280px] sm:max-w-[360px] md:max-w-[440px] object-contain"
            />
          </motion.div>
        </div>

        {/* RIGHT: Re-opening + offers */}
        <div className="flex flex-col items-center justify-center text-center pt-10 md:pt-0 md:pl-8 lg:pl-12">
          <motion.h1
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[0.15em] text-gold-bright mb-6"
          >
            {t.hero.reopenTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="text-base sm:text-lg text-cream/90 mb-4 font-light tracking-wide"
          >
            {t.hero.reopenSubtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="text-lg sm:text-xl lg:text-2xl font-medium mb-6 text-white"
          >
            {t.hero.reopenDate}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="text-[10px] sm:text-xs text-smoke uppercase tracking-[0.25em]"
          >
            {t.hero.reopenFrom}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            className="mt-8 border border-gold/40 rounded-lg p-6 w-full max-w-[420px] bg-obsidian/40 backdrop-blur-sm"
          >
            <h3 className="text-lg md:text-xl font-semibold uppercase tracking-[0.15em] text-gold-bright mb-4">
              {t.hero.offersTitle}
            </h3>
            <p className="text-sm font-serif-alt italic text-cream/90 mb-5">
              {t.hero.offersTagline}
            </p>
            <p className="text-xs md:text-sm text-cream/70 uppercase tracking-wider leading-relaxed mb-6">
              {t.hero.offersBody}
            </p>
            <ul className="space-y-4 text-sm md:text-base text-cream/90 font-medium text-left inline-block w-full px-2 sm:px-6">
              <li>{t.hero.offer1}</li>
              <li>{t.hero.offer2}</li>
              <li>{t.hero.offer3}</li>
            </ul>
            <p className="text-xs text-cream/70 font-semibold mt-6">{t.hero.offersMore}</p>
            <p className="text-[11px] md:text-xs font-serif-alt italic text-gold/80 mt-3 leading-relaxed">
              {t.hero.offersFooter}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}