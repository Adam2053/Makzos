import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Epilogue, Fraunces } from "next/font/google";
import "./globals.css";

const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const display = Big_Shoulders({ subsets: ["latin"], weight: ["800"], variable: "--font-display", display: "swap" });
const sans = Epilogue({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Makzo's — Launching Soon",
  description: "Makzo's roasted makhana is launching soon in four bold flavours.",
};

export const viewport: Viewport = { themeColor: "#0f0e0c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${serif.variable} ${sans.variable} ${display.variable}`}>{children}</body></html>;
}
