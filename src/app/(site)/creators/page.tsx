import type { Metadata } from "next";
import { CreatorsView } from "./CreatorsView";

export const metadata: Metadata = {
  title: "Creators — Makzo's",
  description: "Film your Makzo's moment. Join the creator list for early packs and a feature on our pages.",
};

export default function CreatorsPage() {
  return <CreatorsView />;
}
