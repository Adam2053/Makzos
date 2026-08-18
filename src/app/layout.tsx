import type { Metadata, Viewport } from "next";
import { Lilita_One, Figtree } from "next/font/google";
import "./globals.css";

/* A heavy condensed poster face with real character — the shape a snack packet
   shouts in. Ships one very fat weight, which is all this page asks of it. */
const display = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAKZO'S — Roasted Makhana",
  description:
    "Halka snack, bhari swad. Roasted makhana in four flavours — nothing artificial, nothing unnecessary.",
};

export const viewport: Viewport = {
  themeColor: "#fff3dc",
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
      <body className={`${display.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
