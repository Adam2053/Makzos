import type { Metadata } from "next";
import { getOrder } from "@/lib/shopify/account";
import { OrderMissing, OrderView } from "./OrderView";

export const metadata: Metadata = { title: "Your order — Makzo's", robots: { index: false } };

/** A signed-in customer's order, read from Shopify each visit so tracking is current. */
export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { order, signedIn } = await getOrder(id).catch((e) => {
    console.error("[shopify] order", e);
    return { order: null, signedIn: true };
  });
  return order ? <OrderView o={order} /> : <OrderMissing id={id} signedIn={signedIn} />;
}
