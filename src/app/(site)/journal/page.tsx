import type { Metadata } from "next";
import { JournalList } from "./JournalList";
import type { Topic } from "@/lib/journal";

export const metadata: Metadata = { title: "Journal — Makzo's", description: "Makhana recipes, and what to look for on a snack label." };

/** `?topic=recipes` opens the list on one topic; flavour pages link here that way. */
export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const { topic } = await searchParams;
  return <JournalList initial={topic === "recipes" || topic === "makhana" ? (topic as Topic) : null} />;
}
