import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "./site.css";

// Same font families and weights as the original website, self-hosted by next/font.
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

/**
 * The original site adds a "js" class to <html> so that animations and
 * collapsible panels only apply when JavaScript runs (without JS, all content
 * stays visible). This tiny script does the same before the first paint.
 */
const enableJsClass = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableJsClass }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
