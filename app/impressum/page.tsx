"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ImpressumPage() {
  const { locale, t } = useLanguage();
  const isDe = locale === "de";

  return (
    <>
      <Nav />
      <main id="main" className="min-h-screen bg-obsidian pt-32 pb-24 px-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="font-script text-3xl text-gold-bright">Atlantic Lounge Bar</p>
          <h1 className="font-display text-3xl uppercase tracking-wide text-cream mt-1 mb-10">
            {t.legal.impressumNav}
          </h1>

          <div className="mb-10 border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300 leading-relaxed">
            {isDe ? (
              <>
                <strong>Hinweis — diese Seite ist unvollständig.</strong> Die unten markierten
                Platzhalter (Name des Inhabers, USt-IdNr.) müssen vor der
                Veröffentlichung ausgefüllt werden. Ein unvollständiges Impressum
                ist ein eigenständiges rechtliches Risiko (Abmahnung nach §5 TMG).
              </>
            ) : (
              <>
                <strong>Notice — this page is incomplete.</strong> The placeholders
                marked below (owner name, VAT ID) must be filled in before this
                site goes live. An incomplete legal notice is itself a legal risk
                under German law (§5 TMG).
              </>
            )}
          </div>

          <section className="prose-legal text-smoke text-sm leading-relaxed space-y-6">
            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "Angaben gemäß §5 TMG" : "Information pursuant to §5 TMG (German Telemedia Act)"}
              </h2>
              <p>
                ATLANTIC LOUNGE - BAR
                <br />
                <span className="text-red-300">
                  [{isDe ? "BITTE AUSFÜLLEN: Name des Inhabers / der Inhaberin und Rechtsform (z. B. Einzelunternehmen)" : "PLEASE FILL IN: Owner's full name and legal form (e.g. sole proprietorship)"}]
                </span>
                <br />
                Bauerngasse 67
                <br />
                97421 Schweinfurt
                <br />
                {isDe ? "Deutschland" : "Germany"}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "Kontakt" : "Contact"}
              </h2>
              <p>
                {isDe ? "Telefon" : "Phone"}:{" "}
                <a href="tel:015226750000" className="text-gold-bright hover:text-cream">
                  015226750000
                </a>
                <br />
                {isDe ? "E-Mail" : "Email"}:{" "}
                <a
                  href="mailto:atlanticbarschweinfurt@gmail.com"
                  className="text-gold-bright hover:text-cream"
                >
                  atlanticbarschweinfurt@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "Umsatzsteuer-Identifikationsnummer" : "VAT identification number"}
              </h2>
              <p className="text-red-300">
                [{isDe ? "BITTE AUSFÜLLEN: USt-IdNr. gemäß §27a UStG, oder Hinweis auf Kleinunternehmerregelung §19 UStG" : "PLEASE FILL IN: VAT ID per §27a UStG, or a note that the small-business exemption (§19 UStG) applies"}]
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe
                  ? "Verantwortlich für den Inhalt nach §18 Abs. 2 MStV"
                  : "Responsible for content pursuant to §18(2) MStV"}
              </h2>
              <p className="text-red-300">
                [{isDe ? "BITTE AUSFÜLLEN: siehe Name des Inhabers oben" : "PLEASE FILL IN: same as owner name above"}]
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "EU-Streitschlichtung" : "EU dispute resolution"}
              </h2>
              <p>
                {isDe
                  ? "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: "
                  : "The European Commission provides a platform for online dispute resolution (ODR): "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-bright hover:text-cream underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . {isDe
                  ? "Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
                  : "We are not obliged, and are not willing, to participate in dispute resolution proceedings before a consumer arbitration board."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "Haftungshinweis" : "Liability notice"}
              </h2>
              <p>
                {isDe
                  ? "Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich."
                  : "Despite careful content control, we assume no liability for the content of external links. The operators of linked pages are solely responsible for their content."}
              </p>
            </div>
          </section>

          <div className="mt-12">
            <Link
              href="/"
              className="text-xs tracking-[0.2em] uppercase text-smoke hover:text-gold-bright transition-colors"
            >
              ← {t.common.backToMain}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
