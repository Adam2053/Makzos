import type { Metadata } from "next";
import { HandOff } from "./HandOff";

export const metadata: Metadata = { title: "Checkout — Makzo's", robots: { index: false } };

export default function CheckoutPage() {
  return <HandOff />;
}
