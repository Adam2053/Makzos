import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

/* Heavy, slightly expanded grotesque — the wordmark's own DNA. */
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* Every claim on this page is shown as a spec, not a boast. */
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAKZO'S — Roasted Makhana",
  description:
    "Roasted makhana in four flavours. Nothing artificial, nothing unnecessary.",
};

export const viewport: Viewport = {
  themeColor: "#0f0e0c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Scroll reveals are opt-in: without JS the page renders fully visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.dataset.js=""',
          }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
