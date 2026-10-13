import type { Metadata } from "next";
import { CareersView } from "./CareersView";

export const metadata: Metadata = { title: "Careers — Makzo's" };

export default function CareersPage() {
  return <CareersView />;
}
