import type { Metadata } from "next";
import { Faq } from "@/components/home/Faq";
import { Community } from "@/components/home/Community";

export const metadata: Metadata = { title: "Help — Makzo's" };

export default function FaqPage() {
  return (
    <>
      <Faq as="h1" />
      <Community />
    </>
  );
}
