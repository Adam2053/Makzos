import type { Metadata } from "next";
import { LaunchHero } from "@/components/LaunchHero";

export const metadata: Metadata = {
  title: "Makzo's — Launching Soon",
  description: "Makzo's roasted makhana is launching soon.",
};

export default function LaunchPage() {
  return <LaunchHero />;
}
