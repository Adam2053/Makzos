"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, MULTI_PRICE, MULTI_SIZE, SUB_OFF, WEIGHT, boxPrice, byId, productHref, type Every } from "./products";
import { checkCoupon, type Coupon } from "./pricing";
import { hydrated, persisted } from "./persist";
import { EASE, gsap } from "./motion";

/**
 * A line in the bag. A bag line is one flavour, sold singly or as a multipack (`size: 3`);
 * a box is any 4 to 7 bags. Either can be a subscription (`every` weeks), which takes
 * SUB_OFF percent off every delivery.
 */
export type Line =
  | { key: string; kind: "bag"; id: string; qty: number; size?: 1 | 3; every?: Every }
  | { key: string; kind: "box"; ids: string[]; qty: number; note?: string; every?: Every };

export type AddOpts = { quiet?: boolean; size?: 1 | 3; every?: Every; qty?: number };

/** A single, one-off bag: the only kind that counts toward "every four priced as a box". */
const isLoose = (l: Line) => l.kind === "bag" && (l.size ?? 1) === 1 && !l.every;
export const bagKey = (id: string, size: 1 | 3 = 1, every?: Every) => `${size === 3 ? "pack3" : "bag"}-${id}${every ? `-every${every}` : ""}`;

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
  addBag: (id: string, from?: HTMLElement | null, opts?: AddOpts) => void;
  /** `note` turns the box into a gift with a message on its sleeve; `every` makes it a subscription. */
  addBox: (ids: string[], from?: HTMLElement | null, note?: string, every?: Every) => void;
  setQty: (key: string, qty: number) => void;
  /** Empties the bag and its code: after an order is placed. */
  clear: () => void;
  /** The code applied to the bag, carried from the bag page into checkout. */
  coupon: Coupon | null;
  /** Returns the reason a code didn't apply, or null when it did. */
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
  /** False until the saved bag has been read back from the browser. */
  ready: boolean;
  /** The bag button in the header: what added packs fly into. */
  bagRef: RefObject<HTMLButtonElement | null>;
  /** The bag in the phone tab bar, which stands in for the header's on phones. */
  barBagRef: RefObject<HTMLButtonElement | null>;
};

const CartContext = createContext<Cart | null>(null);

/** What one of this line costs, before the quantity: subscriptions take their discount here. */
export function unitPrice(l: Line) {
  const base = l.kind === "bag" ? (l.size === MULTI_SIZE ? MULTI_PRICE : BAG_PRICE) : boxPrice(l.ids.length);
  return l.every ? Math.round(base * (1 - SUB_OFF / 100)) : base;
}
export const linePrice = (l: Line) => unitPrice(l) * l.qty;

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

/** The bag survives a refresh: it lives in storage, read through useSyncExternalStore. */
export const bagStore = persisted<{ lines: Line[]; coupon: Coupon | null }>("makzos-bag", { lines: [], coupon: null });
const setLines = (fn: (ls: Line[]) => Line[]) => bagStore.set((b) => ({ ...b, lines: fn(b.lines) }));
const setCoupon = (coupon: Coupon | null) => bagStore.set((b) => ({ ...b, coupon }));

export function CartProvider({ children }: { children: ReactNode }) {
  const { lines, coupon } = useSyncExternalStore(bagStore.subscribe, bagStore.get, bagStore.getServer);
  const ready = useSyncExternalStore(...hydrated);
  const [open, setOpen] = useState(false);
  const bagRef = useRef<HTMLButtonElement>(null);
  const barBagRef = useRef<HTMLButtonElement>(null);
  // Packs fly into whichever bag is on screen: the header's on wide screens, the tab bar's on phones.
  const bag = () => [bagRef.current, barBagRef.current].find((el) => el?.checkVisibility()) ?? null;

  const addBag = useCallback((id: string, from?: HTMLElement | null, opts: AddOpts = {}) => {
    const size = opts.size ?? 1;
    const key = bagKey(id, size, opts.every);
    const n = opts.qty ?? 1;
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key);
      if (hit) return ls.map((l) => (l === hit ? { ...l, qty: l.qty + n } : l));
      return [...ls, { key, kind: "bag", id, qty: n, ...(size === 3 ? { size } : {}), ...(opts.every ? { every: opts.every } : {}) }];
    });
    if (!opts?.quiet) fly(from, bag());
  }, []);

  const addBox = useCallback((ids: string[], from?: HTMLElement | null, note?: string, every?: Every) => {
    // The same bags in any order are the same box; a gift note or a schedule makes it its own line.
    const key = `box-${[...ids].sort().join("+")}${note ? `-gift-${note}` : ""}${every ? `-every${every}` : ""}`;
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key);
      if (hit) return ls.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { key, kind: "box", ids: [...ids], qty: 1, ...(note ? { note } : {}), ...(every ? { every } : {}) }];
    });
    fly(from, bag());
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const clear = useCallback(() => bagStore.set({ lines: [], coupon: null }), []);
  const removeCoupon = useCallback(() => setCoupon(null), []);

  const value = useMemo<Cart>(() => {
    const bags = lines.reduce((n, l) => n + (isLoose(l) ? l.qty : 0), 0);
    // Any four loose bags, whatever the flavours, cost the same as a box.
    const saving = Math.floor(bags / BOX_SIZE) * (BOX_SIZE * BAG_PRICE - BOX_PRICE);
    const subtotal = lines.reduce((n, l) => n + linePrice(l), 0) - saving;
    const applyCoupon = (code: string) => {
      const r = checkCoupon(code, subtotal);
      if (!r.ok) return r.message;
      setCoupon(r.coupon);
      return null;
    };
    return {
      lines, bags, saving, subtotal,
      count: lines.reduce((n, l) => n + l.qty, 0),
      open, setOpen, addBag, addBox, setQty, clear, coupon, applyCoupon, removeCoupon, ready, bagRef, barBagRef,
    };
  }, [lines, open, coupon, ready, addBag, addBox, setQty, clear, removeCoupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside <CartProvider>");
  return cart;
}

/** How a line reads anywhere it's listed: the bag, the bag page, checkout and orders. */
export function describeLine(l: Line) {
  const sub = l.every ? `Every ${l.every} weeks, ${SUB_OFF}% off` : null;
  if (l.kind === "bag") {
    const f = byId(l.id);
    const title = l.size === MULTI_SIZE ? `${f.name}, pack of ${MULTI_SIZE}` : f.name;
    const detail = [l.size === MULTI_SIZE ? `${MULTI_SIZE} × ${WEIGHT} bags` : `${WEIGHT} bag`, sub].filter(Boolean).join(". ");
    return { title, detail, packId: l.id, pack: f.pack, field: f.field, href: productHref(l.id), every: l.every };
  }
  const counts = l.ids.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {});
  const mix = Object.entries(counts).map(([id, n]) => (n > 1 ? `${byId(id).name} ×${n}` : byId(id).name)).join(", ");
  const title = l.note ? `Gift box of ${l.ids.length}` : `Box of ${l.ids.length}`;
  const detail = [mix, l.note && `Note: “${l.note}”`, sub].filter(Boolean).join(". ");
  return { title, detail, packId: l.ids[0], pack: byId(l.ids[0]).pack, field: byId(l.ids[0]).field, href: "/build-a-box", every: l.every };
}

export { BOX_PRICE, BOX_SIZE };
