import type { Metadata } from "next";
import { OrderView } from "./OrderView";

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  return { title: `Order ${(await params).id} — Makzo's` };
}

/** `?placed=1` is checkout's hand-off: the page opens with the thank-you. */
export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const [{ id }, { placed }] = await Promise.all([params, searchParams]);
  return <OrderView id={id} placed={placed === "1"} />;
}
