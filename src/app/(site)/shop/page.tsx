import type { Metadata } from "next";
import { FLAVOURS } from "@/lib/products";
import { ShopBanner } from "./ShopBanner";
import { ShopView } from "./ShopView";
import { BuildBox } from "@/components/home/BuildBox";

export const metadata: Metadata = {
  title: "Shop all flavours — Makzo's",
  description: `All ${FLAVOURS.length} Makzo's roasted makhana flavours: ${FLAVOURS.map((f) => f.name).join(", ")}.`,
};

/** The banner, the whole range filterable by taste, then the box for anyone who wants four. */
export default function Shop() {
  return (
    <>
      <ShopBanner />
      <ShopView />
      <BuildBox />
    </>
  );
}
