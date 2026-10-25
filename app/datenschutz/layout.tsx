import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Atlantic Lounge Bar",
  alternates: { canonical: "/datenschutz" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
