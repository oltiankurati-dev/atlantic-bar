import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SiteImagesProvider } from "./context/SiteImagesContext";
import { BusinessHoursProvider } from "./context/BusinessHoursContext";
import CookieBanner from "@/components/CookieBanner";
import MotionProvider from "@/components/MotionProvider";
import { getSiteUrl } from "@/lib/siteUrl";

const TITLE = "Atlantic Lounge Bar — Luxuriöses Ambiente & Premium-Abende";
const DESCRIPTION =
  "Die Atlantic Lounge Bar ist ein golden erleuchteter Rückzugsort mit handgemachten Cocktails, Live-DJ-Abenden und samtenem Luxus. Reservieren Sie Ihren Tisch für Premium-Abende.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Atlantic Lounge Bar",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/atlantic-logo-gold.png", width: 1290, height: 588, alt: "Atlantic Lounge Bar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/atlantic-logo-gold.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`h-full antialiased ${fontVariables}`}>
      <body className="min-h-full flex flex-col bg-obsidian text-cream font-body selection:bg-gold/30 selection:text-cream">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-gold focus:text-obsidian focus:px-4 focus:py-2 focus:text-sm"
        >
          Zum Inhalt springen
        </a>
        <MotionProvider>
        <LanguageProvider>
          <AuthProvider>
            <SiteImagesProvider>
              <BusinessHoursProvider>
                {children}
                <CookieBanner />
              </BusinessHoursProvider>
            </SiteImagesProvider>
          </AuthProvider>
        </LanguageProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
