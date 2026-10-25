"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const STORAGE_KEY = "atlantic-cookie-notice-seen";

function subscribeNever() {
  return () => {};
}

function readAccepted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function CookieBanner() {
  const { t } = useLanguage();
  // Server render and hydration assume "already accepted" so the banner never
  // flashes or mismatches; the real value is read from storage on the client.
  const storedAccepted = useSyncExternalStore(subscribeNever, readAccepted, () => true);
  const [acceptedNow, setAcceptedNow] = useState(false);
  const visible = !storedAccepted && !acceptedNow;

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // private browsing / storage disabled — banner just won't persist
    }
    setAcceptedNow(true);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-gold/25 bg-obsidian/95 backdrop-blur px-6 py-5 md:px-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-xs leading-relaxed text-smoke">
          {t.cookieBanner.message}{" "}
          <Link href="/datenschutz" className="text-gold-bright underline hover:text-cream">
            {t.cookieBanner.settingsLinkText}
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 border border-gold px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-obsidian bg-gold hover:bg-gold-bright transition-colors"
        >
          {t.cookieBanner.acceptBtn}
        </button>
      </div>
    </div>
  );
}
