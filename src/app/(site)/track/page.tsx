import type { Metadata } from "next";
import { TrackView } from "./TrackView";

export const metadata: Metadata = { title: "Track an order — Makzo's" };

export default function TrackPage() {
  return <TrackView />;
}
