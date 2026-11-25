"use client";

import { BAG_PRICE, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useAvailable } from "@/lib/catalog";
import ui from "./ui.module.css";

/** An add-to-bag button for server-rendered sections; the pack flies from the nearest image. */
export function AddButton({ id, label, variant = "btn" }: { id: string; label: string; variant?: "btn" | "btnLine" | "btnDark" }) {
  const { addBag } = useCart();
  const inStock = useAvailable()(id);
  return (
    <button type="button" className={ui[variant]} disabled={!inStock} onClick={(e) => addBag(id, e.currentTarget.closest("li, aside, article")?.querySelector("img"))}>
      {inStock ? `${label}, ${inr(BAG_PRICE)}` : "Sold out"}
    </button>
  );
}
