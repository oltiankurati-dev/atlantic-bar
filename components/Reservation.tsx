"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { useSiteImages } from "@/app/context/SiteImagesContext";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";

export default function Reservation() {
  const { user, loading: authLoading, needsPhoneVerification } = useAuth();
  const siteImages = useSiteImages();
  const { t, locale } = useLanguage();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // YYYY-MM-DD in the guest's own timezone, for the date picker's lower bound.
  const now = new Date();
  const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

  const FIELDS: { key: "name" | "date" | "guests"; label: string }[] = [
    { key: "name", label: t.reservation.fields.name },
    { key: "date", label: t.reservation.fields.date },
    { key: "guests", label: t.reservation.fields.guests },
  ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      if (!user) throw new Error(t.reservation.pleaseSignIn);
      const idToken = await user.getIdToken();

      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: data.get("name"),
          date: data.get("date"),
          guests: data.get("guests"),
          company: data.get("company") ?? "", // honeypot
          locale,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? t.reservation.genericError);
      }

      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.reservation.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reserve" className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={siteImages.reservation}
          alt="Warm firelit table at Atlantic Lounge Bar"
          fill
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/85 to-obsidian/60" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 md:px-10 text-center">
        <p className="font-script text-3xl text-gold-bright mb-1">{t.reservation.eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide text-cream">
          {t.reservation.title}
        </h2>
        <p className="text-smoke mt-5 max-w-lg mx-auto">{t.reservation.description}</p>

        {authLoading ? null : !user ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 bg-charcoal/70 backdrop-blur border border-gold/25 p-8 md:p-10 text-center"
          >
            <p className="text-cream mb-6">{t.reservation.signInPrompt}</p>
            <Link
              href="/login"
              className="inline-block border border-gold px-10 py-3.5 text-xs tracking-[0.3em] uppercase text-obsidian bg-gold hover:bg-gold-bright transition-colors"
            >
              {t.reservation.signInBtn}
            </Link>
          </motion.div>
        ) : needsPhoneVerification ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 bg-charcoal/70 backdrop-blur border border-gold/25 p-8 md:p-10 text-center"
          >
            <p className="text-cream mb-6">{t.reservation.verifyPrompt}</p>
            <Link
              href="/login/verify-phone"
              className="inline-block border border-gold px-10 py-3.5 text-xs tracking-[0.3em] uppercase text-obsidian bg-gold hover:bg-gold-bright transition-colors"
            >
              {t.reservation.verifyBtn}
            </Link>
          </motion.div>
        ) : (
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
          className="mt-12 bg-charcoal/70 backdrop-blur border border-gold/25 p-8 md:p-10 text-left"
        >
          <div className="grid sm:grid-cols-3 gap-6">
            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="text-[11px] tracking-[0.2em] uppercase text-smoke">{f.label}</span>
                <input
                  name={f.key}
                  required
                  type={f.key === "date" ? "date" : f.key === "guests" ? "number" : "text"}
                  min={f.key === "guests" ? 1 : f.key === "date" ? todayLocal : undefined}
                  max={f.key === "guests" ? 50 : undefined}
                  maxLength={f.key === "name" ? 100 : undefined}
                  placeholder={f.key === "name" ? t.reservation.namePlaceholder : undefined}
                  className="mt-2 w-full bg-transparent border-b border-cream/25 focus:border-gold py-2 text-cream outline-none transition-colors placeholder:text-smoke/50"
                />
              </label>
            ))}
          </div>

          {/* Honeypot — hidden from real visitors, catches simple bots */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />

          <button
            type="submit"
            disabled={submitting}
            className="group relative mt-9 w-full sm:w-auto overflow-hidden border border-gold px-10 py-3.5 text-xs tracking-[0.3em] uppercase text-obsidian bg-gold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {submitting
                ? t.reservation.submitSending
                : sent
                ? t.reservation.submitSent
                : t.reservation.submitIdle}
            </span>
            <span className="absolute inset-0 bg-gold-bright scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </button>

          {sent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs text-gold-bright tracking-wide"
            >
              {t.reservation.successMessage}
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs text-red-400 tracking-wide"
            >
              {error}
            </motion.p>
          )}
        </motion.form>
        )}
      </div>
    </section>
  );
}
