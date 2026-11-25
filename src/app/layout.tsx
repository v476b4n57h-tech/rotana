import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

// Zelfde lettertypen en gewichten als de originele website.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

const text = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ROTANA Hair Style",
  description: "Kapsalon voor heren en dames in Alkmaar. Plan eenvoudig online je afspraak.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
