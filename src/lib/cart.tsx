"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE } from "./products";
import { EASE, gsap } from "./motion";

export type Line =
  | { key: string; kind: "bag"; id: string; qty: number }
  | { key: string; kind: "box"; ids: string[]; qty: number; note?: string };

type Cart = {
  lines: Line[];
  count: number;
  /** Loose bags only (boxes not counted). */
  bags: number;
  /** Taken off because every four loose bags are priced as a box. */
  saving: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** `quiet` adds without the flight or the bump: for controls that already show the change. */
  addBag: (id: string, from?: HTMLElement | null, opts?: { quiet?: boolean }) => void;
  /** `note` turns the box into a gift with a message on its sleeve. */
  addBox: (ids: string[], from?: HTMLElement | null, note?: string) => void;
  setQty: (key: string, qty: number) => void;
  /** The bag button in the header: what added packs fly into. */
  bagRef: RefObject<HTMLButtonElement | null>;
};

const CartContext = createContext<Cart | null>(null);

/** A box of four has its own price; any other bundle is simply its bags added up. */
export const linePrice = (l: Line) =>
  (l.kind === "bag" ? BAG_PRICE : l.ids.length === BOX_SIZE ? BOX_PRICE : l.ids.length * BAG_PRICE) * l.qty;

/**
 * Sends a copy of whatever was clicked into the bag button, then bumps the
 * button, so the count changing is something you see happen.
 */
function fly(from: HTMLElement | null | undefined, to: HTMLElement | null) {
  if (!to) return;
  const bump = () => gsap.fromTo(to, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  if (!from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void bump();

  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const ghost = from.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, {
    position: "fixed", left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    margin: "0", zIndex: "90", pointerEvents: "none", transformOrigin: "50% 50%",
  });
  ghost.setAttribute("aria-hidden", "true");
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.min(0.9, (b.height * 1.4) / a.height);
  // x and y on different curves, so the pack arcs into the bag instead of sliding.
  gsap.timeline({ onComplete: () => { ghost.remove(); bump(); } })
    .to(ghost, { x: dx, duration: 0.7, ease: "power1.in" }, 0)
    .to(ghost, { y: dy, duration: 0.7, ease: "back.in(1.6)" }, 0)
    .to(ghost, { scale: s, rotation: 14, duration: 0.7, ease: EASE }, 0)
    .to(ghost, { opacity: 0, duration: 0.12 }, 0.6);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const bagRef = useRef<HTMLButtonElement>(null);

  const addBag = useCallback((id: string, from?: HTMLElement | null, opts?: { quiet?: boolean }) => {
    setLines((ls) => {
      const hit = ls.find((l) => l.kind === "bag" && l.id === id);
      if (hit) return ls.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { key: `bag-${id}`, kind: "bag", id, qty: 1 }];
    });
    if (!opts?.quiet) fly(from, bagRef.current);
  }, []);

  const addBox = useCallback((ids: string[], from?: HTMLElement | null, note?: string) => {
    // The same four in any order is the same box; a gift note makes it its own line.
    const key = `box-${[...ids].sort().join("+")}${note ? `-gift-${note}` : ""}`;
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key);
      if (hit) return ls.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { key, kind: "box", ids: [...ids], qty: 1, note }];
    });
    fly(from, bagRef.current);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const value = useMemo<Cart>(() => {
    const bags = lines.reduce((n, l) => n + (l.kind === "bag" ? l.qty : 0), 0);
    // Any four loose bags, whatever the flavours, cost the same as a box.
    const saving = Math.floor(bags / BOX_SIZE) * (BOX_SIZE * BAG_PRICE - BOX_PRICE);
    return {
      lines, bags, saving,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + linePrice(l), 0) - saving,
      open, setOpen, addBag, addBox, setQty, bagRef,
    };
  }, [lines, open, addBag, addBox, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside <CartProvider>");
  return cart;
}
