import type { Metadata, Viewport } from "next";
import { Fredoka, Manrope } from "next/font/google";
import "./globals.css";

/* Rounded and warm — modern DTC without tipping into childish. */
const display = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAKZO'S — Roasted Makhana",
  description:
    "Roasted makhana in four flavours. Nothing artificial, nothing unnecessary.",
};

export const viewport: Viewport = {
  themeColor: "#4e1140",
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
