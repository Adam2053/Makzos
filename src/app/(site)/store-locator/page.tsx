import type { Metadata } from "next";
import { Locator } from "./Locator";
import { FindUs } from "@/components/home/FindUs";

export const metadata: Metadata = { title: "Find a store — Makzo's", description: "Where to buy Makzo's roasted makhana near you, in stores and online." };

export default function StoreLocatorPage() {
  return (
    <>
      <Locator />
      <FindUs />
    </>
  );
}
