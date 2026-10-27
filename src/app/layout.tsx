import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Archivo, Manrope } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

/*
 * The brand's faces (guide D4, type pages): three creative ones and Manrope for everything people read.
 * Boomme carries the headlines: its lowercase is the tall condensed cut, its capitals the heavy punchy one.
 * Moreganic is for flavour names and short lines, Squid Boy for the playful bits (prices, stickers).
 * The files are lifted from the guide's own PDF; swap in the licensed webfonts when they're supplied.
 */
const label = localFont({ src: "./fonts/Moreganic.woff2", variable: "--font-label", display: "swap", fallback: ["Arial Narrow", "sans-serif"] });
/*
 * Boomme's figures change weight from digit to digit, which reads as a mistake in a price. So
 * Boomme is limited to everything but 0–9, and Moreganic, the next face in its stack, sets the
 * digits: condensed capitals that sit with Boomme's condensed cut.
 */
const display = localFont({
  src: "./fonts/Boomme.woff2", variable: "--font-display", display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0000-002F, U+003A-FFFF" }],
  adjustFontFallback: false, fallback: ["var(--font-label)"],
});
const play = localFont({ src: "./fonts/SquidBoy.woff2", variable: "--font-play", display: "swap", fallback: ["sans-serif"] });
const text = Manrope({ subsets: ["latin"], variable: "--font-text", display: "swap" });
/* Only the /launch page still uses Archivo. */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "Makzo's — Roasted makhana in flavours you already know",
  description: "Roasted makhana built around familiar dishes: Rasam, Sweet Tamarind, Mac & Cheese and Tiramisu. No preservatives, no artificial colours or flavours.",
};

// `cover` lets the phone tab bar reach the screen's foot and pad itself clear of the home indicator.
export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${label.variable} ${play.variable} ${text.variable} ${archivo.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
