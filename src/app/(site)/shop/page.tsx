import type { Metadata } from "next";
import { FLAVOURS } from "@/lib/products";
import { Products } from "@/components/home/Products";
import { BuildBox } from "@/components/home/BuildBox";

export const metadata: Metadata = {
  title: "Shop all flavours — Makzo's",
  description: `All ${FLAVOURS.length} Makzo's roasted makhana flavours: ${FLAVOURS.map((f) => f.name).join(", ")}.`,
};

/** The whole range, stacked down the page, then the box for anyone who wants four. */
export default function Shop() {
  return (
    <>
      <Products layout="grid" as="h1" title="Shop all flavours." />
      <BuildBox />
    </>
  );
}
