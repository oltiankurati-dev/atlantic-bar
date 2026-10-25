"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

const COPY = {
  de: {
    error: { eyebrow: "Etwas ist schiefgelaufen", title: "Kurze Pause", body: "Diese Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut." },
    notFound: { eyebrow: "404", title: "Seite nicht gefunden", body: "Diese Seite gibt es nicht oder nicht mehr." },
    retry: "Erneut versuchen",
    home: "Zur Startseite",
  },
  en: {
    error: { eyebrow: "Something went wrong", title: "A short pause", body: "This page couldn't be loaded. Please try again." },
    notFound: { eyebrow: "404", title: "Page not found", body: "This page doesn't exist or has moved." },
    retry: "Try again",
    home: "Back to home",
  },
} as const;

export default function StatusScreen({
  kind,
  onRetry,
}: {
  kind: "error" | "notFound";
  onRetry?: () => void;
}) {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const text = copy[kind];

  return (
    <main id="main" className="flex flex-1 min-h-[70vh] items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md">
        <p className="font-script text-3xl text-gold-bright mb-2">{text.eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-cream">
          {text.title}
        </h1>
        <p className="text-smoke mt-5">{text.body}</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="border border-gold px-8 py-3 text-xs tracking-[0.3em] uppercase text-obsidian bg-gold hover:bg-gold-bright transition-colors"
            >
              {copy.retry}
            </button>
          )}
          <Link
            href="/"
            className="border border-gold/60 px-8 py-3 text-xs tracking-[0.3em] uppercase text-cream hover:border-gold-bright hover:text-gold-bright transition-colors"
          >
            {copy.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
