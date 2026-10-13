import type { Metadata } from "next";
import { ReviewsView } from "./ReviewsView";
import { Reviews } from "@/components/home/Reviews";

export const metadata: Metadata = { title: "Reviews — Makzo's", description: "What people say about every Makzo's flavour." };

export default function ReviewsPage() {
  return (
    <>
      <ReviewsView />
      <Reviews />
    </>
  );
}
