"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/app/context/LanguageContext";

export default function DatenschutzPage() {
  const { locale, t } = useLanguage();
  const isDe = locale === "de";

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-obsidian pt-32 pb-24 px-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="font-script text-3xl text-gold-bright">Atlantic Lounge Bar</p>
          <h1 className="font-display text-3xl uppercase tracking-wide text-cream mt-1 mb-10">
            {t.legal.datenschutzNav}
          </h1>

          <div className="mb-10 border border-gold/30 bg-charcoal/50 p-5 text-sm text-smoke leading-relaxed">
            {isDe ? (
              <>
                Dieser Entwurf beschreibt die tatsächliche technische Datenverarbeitung
                dieser Website (Stand: Erstellung dieser Seite). Die Kontaktdaten der
                verantwortlichen Stelle sind noch als Platzhalter im{" "}
                <Link href="/impressum" className="text-gold-bright underline hover:text-cream">
                  Impressum
                </Link>{" "}
                markiert und müssen dort vervollständigt werden. Wir empfehlen, diesen
                Text vor Veröffentlichung von einer rechtskundigen Person prüfen zu lassen.
              </>
            ) : (
              <>
                This draft describes the site&apos;s actual technical data processing (as of
                when this page was written). The controller&apos;s contact details are still
                marked as placeholders on the{" "}
                <Link href="/impressum" className="text-gold-bright underline hover:text-cream">
                  Legal Notice
                </Link>{" "}
                page and need to be completed there. We recommend having this text
                reviewed by qualified legal counsel before publishing.
              </>
            )}
          </div>

          <section className="text-smoke text-sm leading-relaxed space-y-8">
            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "1. Verantwortliche Stelle" : "1. Data controller"}
              </h2>
              <p>
                {isDe
                  ? "Verantwortlich für die Datenverarbeitung auf dieser Website ist die im "
                  : "The controller responsible for data processing on this website is the party named in the "}
                <Link href="/impressum" className="text-gold-bright underline hover:text-cream">
                  {isDe ? "Impressum" : "Legal Notice"}
                </Link>{" "}
                {isDe ? "genannte Stelle." : "page."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "2. Hosting" : "2. Hosting"}
              </h2>
              <p>
                {isDe
                  ? "Diese Website wird bei einem externen Hosting-Anbieter betrieben (voraussichtlich Vercel Inc., USA — bitte hier den tatsächlichen Anbieter bestätigen). Bei jedem Aufruf der Website werden technisch notwendige Zugriffsdaten (u. a. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite) durch den Hosting-Anbieter verarbeitet, um die Website auszuliefern und die IT-Sicherheit zu gewährleisten."
                  : "This website is operated through an external hosting provider (likely Vercel Inc., USA — please confirm the actual provider). On every visit, technically necessary access data (including IP address, date and time, page requested) is processed by the hosting provider to deliver the site and maintain IT security."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "3. Cookies & lokaler Speicher" : "3. Cookies & local storage"}
              </h2>
              <p className="mb-3">
                {isDe
                  ? "Wir verwenden ausschließlich technisch notwendige Cookies und lokalen Speicher (localStorage) — keine Analyse- oder Marketing-Cookies, kein Tracking:"
                  : "We use only strictly necessary cookies and local storage (localStorage) — no analytics or marketing cookies, no tracking:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-cream">session</strong> —{" "}
                  {isDe
                    ? "httpOnly-Cookie, hält Sie nach dem Login angemeldet (gültig 5 Tage). Notwendig für den Login-Bereich und die Reservierungsfunktion."
                    : "httpOnly cookie that keeps you signed in after login (valid 5 days). Required for the login area and reservation feature."}
                </li>
                <li>
                  <strong className="text-cream">atlantic-lounge-locale</strong> —{" "}
                  {isDe
                    ? "speichert Ihre Sprachwahl (Deutsch/Englisch) lokal im Browser."
                    : "stores your language choice (German/English) locally in the browser."}
                </li>
                <li>
                  <strong className="text-cream">atlantic-intro-seen</strong> —{" "}
                  {isDe
                    ? "merkt sich, dass die 3D-Einführungsanimation bereits gezeigt wurde, damit sie nicht bei jedem Seitenaufruf erneut abgespielt wird."
                    : "remembers that the 3D intro animation has already played, so it doesn't replay on every visit."}
                </li>
                <li>
                  <strong className="text-cream">atlantic-cookie-notice-seen</strong> —{" "}
                  {isDe
                    ? "merkt sich, dass Sie diesen Cookie-Hinweis bestätigt haben."
                    : "remembers that you've acknowledged this cookie notice."}
                </li>
              </ul>
              <p className="mt-3">
                {isDe
                  ? "Da es sich ausschließlich um technisch notwendige Daten im Sinne von §25 Abs. 2 TTDSG handelt, ist hierfür keine Einwilligung erforderlich."
                  : "Because this data is strictly necessary within the meaning of §25(2) TTDSG (German Telecommunications-Telemedia Data Protection Act), no consent is required for it."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "4. Registrierung und Login" : "4. Registration and login"}
              </h2>
              <p className="mb-3">
                {isDe
                  ? "Für eine Tischreservierung ist ein Konto erforderlich. Die Anmeldung erfolgt über Firebase Authentication (Google Ireland Ltd. / Google LLC) und unterstützt drei Wege:"
                  : "A table reservation requires an account. Sign-in runs through Firebase Authentication (Google Ireland Ltd. / Google LLC) and supports three methods:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  {isDe
                    ? "E-Mail und Passwort — wird direkt bei Firebase Authentication gespeichert."
                    : "Email and password — stored directly with Firebase Authentication."}
                </li>
                <li>
                  {isDe
                    ? "Google- oder Facebook-Login — bei Nutzung dieser Buttons findet eine Datenübertragung an Google bzw. Meta statt; es gelten deren eigene Datenschutzbestimmungen."
                    : "Google or Facebook sign-in — using these buttons transmits data to Google or Meta respectively; their own privacy policies apply."}
                </li>
                <li>
                  {isDe
                    ? "Telefonnummer-Bestätigung per SMS-Code — bei Google-/Facebook-Konten erforderlich, bevor ein Tisch angefragt werden kann. Hierbei wird Google reCAPTCHA eingebunden, um automatisierten Missbrauch zu verhindern; dabei können Daten an Google übertragen werden."
                    : "Phone number verification via SMS code — required for Google/Facebook accounts before a table can be requested. This uses Google reCAPTCHA to prevent automated abuse, which can transmit data to Google."}
                </li>
              </ul>
              <p className="mt-3">
                {isDe
                  ? "Bei jeder Anmeldung wird ein Profil-Datensatz (E-Mail, angezeigter Name, Telefonnummer sofern verifiziert, Rolle) in unserer Firestore-Datenbank (Google Cloud) angelegt bzw. aktualisiert."
                  : "On every sign-in, a profile record (email, display name, phone number if verified, role) is created or updated in our Firestore database (Google Cloud)."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "5. Tischreservierungen" : "5. Table reservations"}
              </h2>
              <p>
                {isDe
                  ? "Bei einer Reservierungsanfrage speichern wir Name, gewünschtes Datum, Anzahl der Gäste, Ihre Konto-ID und E-Mail-Adresse sowie die IP-Adresse des Absenders (zur Spam-/Missbrauchsprävention) in unserer Firestore-Datenbank. Diese Daten sind ausschließlich über unsere Server einsehbar — ein direkter Lese- oder Schreibzugriff aus dem Browser ist durch unsere Firestore-Sicherheitsregeln vollständig gesperrt."
                  : "When you request a reservation, we store your name, requested date, guest count, account ID and email, and the sender's IP address (for spam/abuse prevention) in our Firestore database. This data is only ever accessible through our own servers — direct browser read or write access is fully blocked by our Firestore security rules."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "6. Bildverwaltung im Adminbereich" : "6. Image management in the admin area"}
              </h2>
              <p>
                {isDe
                  ? "Bilder, die von berechtigten Administrator-Konten hochgeladen werden (Galerie, Speisekarte, Website-Bilder), werden bei Cloudinary Ltd. gespeichert und ausgeliefert. Diese Funktion ist nur für angemeldete Administrator-Konten zugänglich."
                  : "Images uploaded by authorized administrator accounts (gallery, menu, site images) are stored and served via Cloudinary Ltd. This feature is only accessible to signed-in administrator accounts."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "7. E-Mail-Benachrichtigungen" : "7. Email notifications"}
              </h2>
              <p>
                {isDe
                  ? "E-Mails werden über Google Gmail (Google Ireland Ltd. / Google LLC) versendet. Bei einer neuen Reservierungsanfrage und bei jeder Statusänderung erhält unser internes Postfach eine Benachrichtigung mit Name, Datum, Gästeanzahl und Reservierungs-ID. Ist die E-Mail-Adresse Ihres Kontos bestätigt, erhalten Sie zusätzlich eine Eingangsbestätigung mit Name, Datum und Gästeanzahl."
                  : "Emails are sent via Google Gmail (Google Ireland Ltd. / Google LLC). For each new reservation request and each status change, our internal inbox receives a notification containing the name, date, guest count, and reservation ID. If your account's email address is verified, you also receive a confirmation of receipt containing the name, date, and guest count."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "8. Schriftarten" : "8. Fonts"}
              </h2>
              <p>
                {isDe
                  ? "Die auf dieser Website verwendeten Schriftarten (Google Fonts) werden lokal auf unserem Server eingebunden. Es findet beim Aufruf der Seite keine Verbindung zu Google-Servern zum Nachladen von Schriftarten statt, und es werden dabei keine Daten an Google übertragen."
                  : "The fonts used on this site (Google Fonts) are self-hosted on our own server. Visiting the page does not connect to Google's servers to load fonts, and no data is transmitted to Google for that purpose."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "9. Empfänger und Drittanbieter im Überblick" : "9. Recipients and third parties at a glance"}
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Google / Firebase (Google Ireland Ltd. / Google LLC) — {isDe ? "Authentifizierung, Datenbank, reCAPTCHA" : "authentication, database, reCAPTCHA"}</li>
                <li>Cloudinary Ltd. — {isDe ? "Bildspeicherung und -auslieferung" : "image storage and delivery"}</li>
                <li>Google Gmail (Google Ireland Ltd. / Google LLC) — {isDe ? "Versand von Reservierungs-E-Mails" : "sending reservation emails"}</li>
                <li>{isDe ? "unser Hosting-Anbieter" : "our hosting provider"} — {isDe ? "Bereitstellung der Website" : "serving the website"}</li>
              </ul>
              <p className="mt-3">
                {isDe
                  ? "Einige dieser Anbieter verarbeiten Daten in den USA. Soweit erforderlich, stützen wir uns hierbei auf die EU-Standardvertragsklauseln als Garantie für ein angemessenes Datenschutzniveau."
                  : "Some of these providers process data in the United States. Where required, we rely on the EU Standard Contractual Clauses as a safeguard for an adequate level of data protection."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "10. Speicherdauer" : "10. Retention period"}
              </h2>
              <p>
                {isDe
                  ? "Konto- und Reservierungsdaten werden gespeichert, solange Ihr Konto besteht bzw. bis eine Reservierung von uns gelöscht wird. Eine automatische Löschfrist ist derzeit nicht eingerichtet. Sie können jederzeit die Löschung Ihrer Daten verlangen (siehe Abschnitt 11)."
                  : "Account and reservation data is retained for as long as your account exists, or until a reservation is deleted by us. There is currently no automatic deletion schedule. You may request deletion of your data at any time (see section 11)."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "11. Ihre Rechte" : "11. Your rights"}
              </h2>
              <p className="mb-3">
                {isDe
                  ? "Nach der DSGVO haben Sie insbesondere folgende Rechte:"
                  : "Under the GDPR, you have in particular the following rights:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>{isDe ? "Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)" : "Access to your stored data (Art. 15 GDPR)"}</li>
                <li>{isDe ? "Berichtigung unrichtiger Daten (Art. 16 DSGVO)" : "Rectification of inaccurate data (Art. 16 GDPR)"}</li>
                <li>{isDe ? "Löschung Ihrer Daten (Art. 17 DSGVO)" : "Erasure of your data (Art. 17 GDPR)"}</li>
                <li>{isDe ? "Einschränkung der Verarbeitung (Art. 18 DSGVO)" : "Restriction of processing (Art. 18 GDPR)"}</li>
                <li>{isDe ? "Datenübertragbarkeit (Art. 20 DSGVO)" : "Data portability (Art. 20 GDPR)"}</li>
                <li>{isDe ? "Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)" : "Objection to processing (Art. 21 GDPR)"}</li>
                <li>
                  {isDe
                    ? "Beschwerde bei einer Datenschutz-Aufsichtsbehörde, z. B. dem Bayerischen Landesamt für Datenschutzaufsicht"
                    : "Lodging a complaint with a data protection supervisory authority, e.g. your regional German data protection authority"}
                </li>
              </ul>
              <p className="mt-3">
                {isDe
                  ? "Zur Ausübung dieser Rechte kontaktieren Sie uns über die im "
                  : "To exercise these rights, contact us using the details on the "}
                <Link href="/impressum" className="text-gold-bright underline hover:text-cream">
                  {isDe ? "Impressum" : "Legal Notice"}
                </Link>{" "}
                {isDe ? "genannten Kontaktdaten." : "page."}
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-3">
                {isDe ? "12. Änderungen dieser Erklärung" : "12. Changes to this policy"}
              </h2>
              <p>
                {isDe
                  ? "Wir passen diese Datenschutzerklärung an, sobald sich unsere Datenverarbeitung ändert. Es gilt jeweils die auf dieser Seite veröffentlichte Fassung."
                  : "We will update this privacy policy whenever our data processing changes. The version published on this page is always the current one."}
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
