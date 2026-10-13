import type { Metadata } from "next";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "Checkout — Makzo's" };

export default function CheckoutPage() {
  return <CheckoutView />;
}
