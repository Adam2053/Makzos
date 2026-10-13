import type { Metadata } from "next";
import { BuildBox } from "@/components/home/BuildBox";
import { BOX_MAX, BOX_SIZE } from "@/lib/products";
import { Hampers, Soon, Subscribe } from "./sections";

export const metadata: Metadata = {
  title: "Build a box — Makzo's",
  description: `Mix ${BOX_SIZE} to ${BOX_MAX} bags of roasted makhana, any flavours. Subscribe and save, or send a box as a gift.`,
};

/** Sitemap: Commerce. The box builder, then subscriptions (#subscribe) and gifting (#gifting). */
export default function BuildABoxPage() {
  return (
    <>
      <BuildBox full as="h1" />
      <Subscribe />
      <Hampers />
      <Soon />
    </>
  );
}
