import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmelden — Atlantic Lounge Bar",
  robots: { index: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
