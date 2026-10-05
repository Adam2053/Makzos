import type { Metadata, Viewport } from "next";
import { Archivo, Barlow_Condensed, Manrope } from "next/font/google";
import "./globals.css";

/* The brand's two faces: Barlow Condensed 700 for display, Manrope for everything people read. */
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--font-display", display: "swap" });
const text = Manrope({ subsets: ["latin"], variable: "--font-text", display: "swap" });
/* Only the /launch page still uses Archivo. */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "Makzo's — Roasted makhana in flavours you already know",
  description: "Roasted makhana built around familiar dishes: Rasam, Sweet Tamarind, Mac & Cheese and Tiramisu. No preservatives, no artificial colours or flavours.",
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${text.variable} ${archivo.variable}`}>{children}</body>
    </html>
  );
}
