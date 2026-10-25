import type { Metadata } from "next";

// Hidden from the nav for now, so keep it out of search results too.
export const metadata: Metadata = {
  title: "Spielzeug — Atlantic Lounge Bar",
  robots: { index: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
