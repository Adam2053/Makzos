"use client";

import { BAG_PRICE, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ui from "./ui.module.css";

/** An add-to-bag button for server-rendered sections; the pack flies from the nearest image. */
export function AddButton({ id, label, variant = "btn" }: { id: string; label: string; variant?: "btn" | "btnLine" | "btnDark" }) {
  const { addBag } = useCart();
  return (
    <button type="button" className={ui[variant]} onClick={(e) => addBag(id, e.currentTarget.closest("li, article")?.querySelector("img"))}>
      {label}, {inr(BAG_PRICE)}
    </button>
  );
}
