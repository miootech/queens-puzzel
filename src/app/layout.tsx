import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Queens — Logikrätsel",
  description: "Platziere Kronen: Eine pro Zeile, Spalte und Region. iOS-Style Logik-Puzzle.",
  keywords: ["Queens", "Logik", "Puzzle", "Rätsel", "Crown"],
  authors: [{ name: "Ali Malik" }],
  openGraph: {
    title: "Queens — Logikrätsel",
    description: "Platziere genau eine Krone pro Zeile, Spalte und farbiger Region.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
