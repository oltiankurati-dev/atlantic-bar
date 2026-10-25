import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — Atlantic Lounge Bar",
  alternates: { canonical: "/impressum" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
