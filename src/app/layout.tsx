import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "Makzo's — Launching Soon",
  description: "Makzo's roasted makhana is launching soon in four bold flavours.",
};

export const viewport: Viewport = { themeColor: "#F0A21C" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={archivo.variable}>{children}</body></html>;
}
