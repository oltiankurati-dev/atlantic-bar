"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";

const NAV_LINKS = ["about", "cocktails", "gallery", "nights", "menu", "spielzeug"] as const;
type LinkKey = (typeof NAV_LINKS)[number] | "reserve";

// Spielzeug is temporarily hidden from the nav (and the homepage section) —
// remove it from this list to bring it back. Everything else about it stays
// wired up (route, translations, section component).
const HIDDEN_NAV_LINKS: ReadonlyArray<(typeof NAV_LINKS)[number]> = ["spielzeug"];
const VISIBLE_NAV_LINKS = NAV_LINKS.filter((key) => !HIDDEN_NAV_LINKS.includes(key));

const LINK_HREFS: Record<LinkKey, string> = {
  // "/#…" so the links also work from /menu, /impressum, etc.
  about: "/#about",
  cocktails: "/#cocktails",
  gallery: "/#gallery",
  nights: "/#nights",
  menu: "/menu",
  spielzeug: "/spielzeug",
  reserve: "/#reserve",
};

function NavLink({ href, children, onClick, className = "" }: { linkKey: LinkKey; href: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  const baseClass = "relative text-xs tracking-[0.2em] uppercase text-smoke hover:text-gold-bright transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full";
  return (
    <Link href={href} onClick={onClick} className={`${baseClass} ${className}`}>
      {children}
    </Link>
  );
}

function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, toggleLocale } = useLanguage();
  return (
    <button
      onClick={toggleLocale}
      aria-label={locale === "de" ? "Switch to English" : "Auf Deutsch umschalten"}
      title={locale === "de" ? "English" : "Deutsch"}
      className={`text-xs tracking-[0.2em] uppercase text-smoke hover:text-gold-bright transition-colors ${className}`}
    >
      <span className="text-gold-bright">{locale === "de" ? "DE" : "EN"}</span>
      <span className="text-gold/40"> / </span>
      <span className="text-smoke/80">{locale === "de" ? "EN" : "DE"}</span>
    </button>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { t, locale } = useLanguage();

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.1 }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-obsidian/85 backdrop-blur-md border-b border-gold/15" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 md:px-10 h-20 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center shrink-0 group">
          <span className="relative block h-10 w-35 sm:h-11 sm:w-40">
            <Image
              src="/atlantic-logo-gold.png"
              alt="Atlantic Lounge Bar"
              fill
              unoptimized
              priority
              className="object-contain object-left"
            />
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {VISIBLE_NAV_LINKS.map((linkKey) => (
            <li key={linkKey}>
              <NavLink linkKey={linkKey} href={LINK_HREFS[linkKey]}>{t.nav[linkKey]}</NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href="/#reserve"
            className="inline-flex items-center border border-gold/60 px-5 py-2 text-xs tracking-[0.2em] uppercase text-gold-bright hover:bg-gold hover:text-obsidian transition-colors duration-300"
          >
            {t.nav.reserve}
          </Link>
          {!authLoading && (
            user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="text-xs tracking-[0.2em] uppercase text-gold-bright hover:text-cream transition-colors">
                    {t.nav.admin}
                  </Link>
                )}
                <Link href="/profile" className="text-xs tracking-[0.2em] uppercase text-smoke hover:text-gold-bright transition-colors">
                  {t.nav.profile}
                </Link>
                <button onClick={() => signOut()} className="p-2 text-smoke hover:text-gold-bright transition-colors" aria-label={t.nav.signOut}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            ) : (
              <Link href="/login" className="p-2 text-smoke hover:text-gold-bright transition-colors" aria-label={t.nav.signIn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>
            )
          )}
          <LanguageToggle />
        </div>

        <button
          type="button"
          aria-label={locale === "de" ? "Menü öffnen oder schließen" : "Open or close menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden -mr-2.5 p-2.5 text-gold-bright"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {open && (
        <motion.ul
          id="mobile-nav"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-obsidian/95 border-t border-gold/15 px-6 py-6 flex flex-col gap-5"
        >
          {VISIBLE_NAV_LINKS.map((linkKey) => (
            <li key={linkKey}>
              <NavLink linkKey={linkKey} href={LINK_HREFS[linkKey]} onClick={() => setOpen(false)} className="text-sm tracking-[0.2em] uppercase text-cream hover:text-gold-bright">
                {t.nav[linkKey]}
              </NavLink>
            </li>
          ))}
          <li>
            <Link href="/#reserve" onClick={() => setOpen(false)} className="inline-flex items-center justify-center border border-gold/60 px-5 py-2 text-sm tracking-[0.2em] uppercase text-gold-bright hover:bg-gold hover:text-obsidian transition-colors duration-300">
              {t.nav.reserve}
            </Link>
          </li>
          <li>
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="block mb-3 text-sm tracking-[0.2em] uppercase text-gold-bright">
                    {t.nav.admin}
                  </Link>
                )}
                <Link href="/profile" onClick={() => setOpen(false)} className="block mb-5 text-sm tracking-[0.2em] uppercase text-cream hover:text-gold-bright">
                  {t.nav.profile}
                </Link>
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="text-sm tracking-[0.2em] uppercase text-cream hover:text-gold-bright flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm tracking-[0.2em] uppercase text-cream hover:text-gold-bright flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {t.nav.signIn}
              </Link>
            )}
          </li>
          <li>
            <LanguageToggle className="text-sm!" />
          </li>
        </motion.ul>
      )}
    </motion.header>
  );
}