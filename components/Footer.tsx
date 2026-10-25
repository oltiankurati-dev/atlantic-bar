"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useBusinessHours } from "@/app/context/BusinessHoursContext";
import { groupBusinessHours } from "@/lib/businessHours";

export default function Footer() {
  const { locale, t } = useLanguage();
  const hours = useBusinessHours();
  const hoursLines = groupBusinessHours(hours, locale);

  return (
    <footer className="relative bg-obsidian border-t border-gold/15 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid sm:grid-cols-2 md:grid-cols-4 gap-12">
        <div>
          <div className="flex items-center gap-2">
            <svg width="18" height="14" viewBox="0 0 34 26" fill="none" className="text-gold">
              <path
                d="M2 8L9 14L17 3L25 14L32 8L29 22H5L2 8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display tracking-[0.2em] uppercase text-cream">
              Atlantic Lounge
            </span>
          </div>
          <p className="font-script text-xl text-gold-bright mt-3">{t.footer.tagline}</p>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold-bright mb-4">
            {t.footer.hours}
          </p>
          <ul className="space-y-1.5 text-sm text-smoke">
            {hoursLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold-bright mb-4">
            {t.footer.visit}
          </p>
          <ul className="space-y-1.5 text-sm text-smoke">
            <li className="font-semibold text-white">ATLANTIC LOUNGE - BAR</li>
            <li>Bauerngasse 67</li>
            <li>97421 Schweinfurt</li>
            <li className="pt-2">
              TEL:{' '}
              <a href="tel:015226750000" className="hover:text-gold-bright transition-colors">
                015226750000
              </a>
            </li>
            <li>
              Email:{' '}
              <a href="mailto:atlanticbarschweinfurt@gmail.com" className="hover:text-gold-bright transition-colors">
                atlanticbarschweinfurt@gmail.com
              </a>
            </li>
          </ul>
          
        </div>

       <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold-bright mb-4">
            {t.footer.follow}
          </p>
          <ul className="space-y-1.5 text-sm text-smoke">
            <li>
              <a 
                href="https://www.instagram.com/atlantic_bar_schweinfurt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gold-bright transition-colors cursor-pointer block"
              >
                Instagram
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="hover:text-gold-bright transition-colors cursor-pointer block"
              >
                Facebook
              </a>
            </li>
            <li>
              <a 
                href="https://www.tiktok.com/@atlanticbarschweinfurt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gold-bright transition-colors cursor-pointer block"
              >
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline mx-auto max-w-7xl mt-12 mb-6" />

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 px-6">
        <Link
          href="/impressum"
          className="text-[11px] tracking-[0.1em] text-smoke hover:text-gold-bright transition-colors"
        >
          {t.legal.impressumNav}
        </Link>
        <Link
          href="/datenschutz"
          className="text-[11px] tracking-[0.1em] text-smoke hover:text-gold-bright transition-colors"
        >
          {t.legal.datenschutzNav}
        </Link>
      </div>

      <p className="text-center text-[11px] tracking-[0.15em] text-smoke px-6">
        © {new Date().getFullYear()} {t.footer.copyright}
      </p>
    </footer>
  );
}