"use client";

/**
 * The account side of the shop: who's signed in, their addresses and their orders. Nothing
 * here talks to a server yet. It's the UI's state, kept in the browser so the flows can be
 * walked end to end, and shaped so each action maps onto one API call later:
 *
 *   verifyOtp     → POST /auth/otp/verify
 *   saveAddress   → PUT  /me/addresses/:id
 *   placeOrder    → POST /orders (after the payment provider says yes)
 *   cancelOrder   → POST /orders/:id/cancel
 *
 * `advanceOrder` and `addSampleOrders` exist only for the demo.
 */
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Line } from "./cart";
import type { Every } from "./products";
import type { DeliveryId, Totals } from "./pricing";
import { bagStore } from "./cart";
import { hydrated, persisted } from "./persist";

export type User = { phone: string; name: string; email?: string; since: string };

export type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export type OrderStatus = "placed" | "packed" | "shipped" | "out" | "delivered" | "cancelled";

/** The road an order travels. Cancelled is a turn off it, not a step on it. */
export const STEPS: { id: Exclude<OrderStatus, "cancelled">; label: string; note: string }[] = [
  { id: "placed", label: "Order placed", note: "We've got it." },
  { id: "packed", label: "Packed", note: "Sealed and boxed." },
  { id: "shipped", label: "Shipped", note: "With the courier." },
  { id: "out", label: "Out for delivery", note: "Arriving today." },
  { id: "delivered", label: "Delivered", note: "Enjoy the crunch." },
];

export type Order = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  /** When each step happened, as ISO strings. */
  history: Partial<Record<OrderStatus, string>>;
  lines: Line[];
  /** What the box pricing took off the bags. */
  saving: number;
  totals: Totals;
  coupon?: string;
  delivery: DeliveryId;
  address: Address;
  contact: { name: string; phone: string; email?: string };
  payment: { method: PaymentMethod; label: string };
  /** Made up for the demo, not placed by anyone. */
  sample?: boolean;
};

export type NewOrder = Omit<Order, "id" | "placedAt" | "status" | "history">;

/** A repeating delivery, made from a subscribe line when its first order is placed. */
export type Subscription = {
  id: string;
  line: Line;
  every: Every;
  status: "active" | "paused" | "cancelled";
  /** ISO date of the next delivery. */
  next: string;
  address: Address;
  startedAt: string;
};

/** `saved` is the wishlist: flavour ids, newest first. */
type State = { user: User | null; accounts: Record<string, User>; addresses: Address[]; orders: Order[]; saved: string[]; subs: Subscription[] };

type Store = State & {
  ready: boolean;
  /** Checks the code. Any six digits pass except 000000, which shows the wrong-code state. */
  verifyOtp: (phone: string, code: string) => { ok: false; message: string } | { ok: true; isNew: boolean };
  completeProfile: (details: { name: string; email?: string }) => void;
  updateProfile: (details: Partial<Pick<User, "name" | "email">>) => void;
  signOut: () => void;
  saveAddress: (a: Omit<Address, "id"> & { id?: string }) => Address;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  placeOrder: (o: NewOrder) => Order;
  cancelOrder: (id: string) => void;
  advanceOrder: (id: string) => void;
  addSampleOrders: () => void;
  resetDemo: () => void;
  toggleSaved: (id: string) => void;
  /** Skip moves the next delivery on by one cycle; swap replaces a single-flavour line's flavour. */
  updateSub: (id: string, change: { status?: Subscription["status"]; every?: Every; skip?: boolean; swapTo?: string }) => void;
};

const EMPTY: State = { user: null, accounts: {}, addresses: [], orders: [], saved: [], subs: [] };
const accountStore = persisted<State>("makzos-account", EMPTY);
const setState = accountStore.set;
const StoreContext = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 9);
const orderId = () => `MKZ${Math.floor(10000 + Math.random() * 89999)}`;
const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

/** The one address every new address is checked against: a default must always exist if any do. */
function withDefault(list: Address[]) {
  if (list.length && !list.some((a) => a.isDefault)) list[0] = { ...list[0], isDefault: true };
  return list;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(accountStore.subscribe, accountStore.get, accountStore.getServer);
  const ready = useSyncExternalStore(...hydrated);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const verifyOtp = useCallback<Store["verifyOtp"]>((phone, code) => {
    if (!/^\d{6}$/.test(code)) return { ok: false, message: "Enter all six digits." };
    if (code === "000000") return { ok: false, message: "That code doesn't match. Check the SMS, or send a new code." };
    const known = state.accounts[phone];
    if (known) {
      setState((s) => ({ ...s, user: known }));
      return { ok: true, isNew: false };
    }
    setPendingPhone(phone);
    return { ok: true, isNew: true };
  }, [state.accounts]);

  const completeProfile = useCallback<Store["completeProfile"]>(({ name, email }) => {
    setState((s) => {
      const phone = pendingPhone ?? s.user?.phone ?? "";
      const user: User = { phone, name, email: email || undefined, since: new Date().toISOString() };
      return { ...s, user, accounts: { ...s.accounts, [phone]: user } };
    });
    setPendingPhone(null);
  }, [pendingPhone]);

  const updateProfile = useCallback<Store["updateProfile"]>((d) => {
    setState((s) => {
      if (!s.user) return s;
      const user = { ...s.user, ...d, email: d.email === "" ? undefined : d.email ?? s.user.email };
      return { ...s, user, accounts: { ...s.accounts, [user.phone]: user } };
    });
  }, []);

  const signOut = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const saveAddress = useCallback<Store["saveAddress"]>((a) => {
    const saved: Address = { ...a, id: a.id ?? uid() };
    setState((s) => {
      let list = s.addresses.some((x) => x.id === saved.id)
        ? s.addresses.map((x) => (x.id === saved.id ? saved : x))
        : [...s.addresses, saved];
      if (saved.isDefault) list = list.map((x) => ({ ...x, isDefault: x.id === saved.id }));
      return { ...s, addresses: withDefault(list) };
    });
    return saved;
  }, []);

  const removeAddress = useCallback((id: string) => {
    setState((s) => ({ ...s, addresses: withDefault(s.addresses.filter((a) => a.id !== id)) }));
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setState((s) => ({ ...s, addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })) }));
  }, []);

  const placeOrder = useCallback<Store["placeOrder"]>((o) => {
    const now = new Date().toISOString();
    const order: Order = { ...o, id: orderId(), placedAt: now, status: "placed", history: { placed: now } };
    // Every subscribe line becomes a subscription, its next delivery one cycle after this one.
    const subs: Subscription[] = o.lines.filter((l) => l.every).map((l) => ({
      id: `SUB${Math.floor(1000 + Math.random() * 8999)}`, line: l, every: l.every!, status: "active", address: o.address, startedAt: now,
      next: new Date(Date.now() + l.every! * 7 * 864e5).toISOString(),
    }));
    setState((s) => ({ ...s, orders: [order, ...s.orders], subs: [...subs, ...s.subs] }));
    return order;
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status: "cancelled", history: { ...o.history, cancelled: new Date().toISOString() } } : o)),
    }));
  }, []);

  const advanceOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => {
        const i = STEPS.findIndex((x) => x.id === o.status);
        if (o.id !== id || i < 0 || i === STEPS.length - 1) return o;
        const next = STEPS[i + 1].id;
        return { ...o, status: next, history: { ...o.history, [next]: new Date().toISOString() } };
      }),
    }));
  }, []);

  const addSampleOrders = useCallback(() => {
    setState((s) => {
      const u = s.user;
      const address: Address = s.addresses.find((a) => a.isDefault) ?? {
        id: "sample-address", label: "Home", name: u?.name ?? "Sample customer", phone: u?.phone ?? "9876543210",
        line1: "Flat 402, Lakeview Residency", line2: "Road No. 12, Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034",
      };
      const contact = { name: address.name, phone: address.phone, email: u?.email };
      const shipped: Order = {
        id: orderId(), sample: true, placedAt: daysAgo(2, 3), status: "shipped",
        history: { placed: daysAgo(2, 3), packed: daysAgo(1, 20), shipped: daysAgo(1, 6) },
        lines: [{ key: "box-sample", kind: "box", ids: ["rasam", "sweet-tamarind", "mac-cheese", "tiramisu"], qty: 1 }, { key: "bag-chettinadu", kind: "bag", id: "chettinadu", qty: 2 }],
        saving: 0, totals: { subtotal: 340, discount: 0, delivery: 40, total: 380 }, delivery: "standard",
        address, contact, payment: { method: "upi", label: "UPI, PhonePe" },
      };
      const delivered: Order = {
        id: orderId(), sample: true, placedAt: daysAgo(16, 5), status: "delivered",
        history: { placed: daysAgo(16, 5), packed: daysAgo(16, 1), shipped: daysAgo(15, 8), out: daysAgo(13, 9), delivered: daysAgo(13, 4) },
        lines: [{ key: "bag-curry-leaves", kind: "bag", id: "curry-leaves", qty: 4 }, { key: "bag-thai-chilli", kind: "bag", id: "thai-chilli", qty: 4 }],
        saving: 40, totals: { subtotal: 440, discount: 44, delivery: 40, total: 436 }, coupon: "FIRSTCRUNCH", delivery: "standard",
        address, contact, payment: { method: "card", label: "Visa ending 4242" },
      };
      const sub: Subscription = {
        id: "SUB1042", line: { key: "pack3-rasam-every4", kind: "bag", id: "rasam", qty: 1, size: 3, every: 4 }, every: 4, status: "active",
        next: new Date(Date.now() + 9 * 864e5).toISOString(), address, startedAt: daysAgo(19),
      };
      return { ...s, orders: [...s.orders, shipped, delivered], subs: s.subs.length ? s.subs : [sub] };
    });
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setState((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved] }));
  }, []);

  const updateSub = useCallback<Store["updateSub"]>((id, c) => {
    setState((s) => ({
      ...s,
      subs: s.subs.map((x) => {
        if (x.id !== id) return x;
        let next = x;
        if (c.status) next = { ...next, status: c.status };
        if (c.every) next = { ...next, every: c.every, line: { ...next.line, every: c.every } };
        if (c.skip) next = { ...next, next: new Date(new Date(next.next).getTime() + next.every * 7 * 864e5).toISOString() };
        if (c.swapTo && next.line.kind === "bag") {
          const size = next.line.size;
          next = { ...next, line: { ...next.line, id: c.swapTo, key: `${size === 3 ? "pack3" : "bag"}-${c.swapTo}-every${next.every}` } };
        }
        return next;
      }),
    }));
  }, []);

  /** Back to a first visit: signed out, empty bag, no addresses or orders. */
  const resetDemo = useCallback(() => {
    setState(EMPTY);
    bagStore.set({ lines: [], coupon: null });
  }, []);

  const value = useMemo<Store>(() => ({
    ...state, ready, verifyOtp, completeProfile, updateProfile, signOut, saveAddress, removeAddress, setDefaultAddress,
    placeOrder, cancelOrder, advanceOrder, addSampleOrders, resetDemo, toggleSaved, updateSub,
  }), [state, ready, verifyOtp, completeProfile, updateProfile, signOut, saveAddress, removeAddress, setDefaultAddress, placeOrder, cancelOrder, advanceOrder, addSampleOrders, resetDemo, toggleSaved, updateSub]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

/** Orders are cancellable until they leave us. */
export const canCancel = (o: Order) => o.status === "placed" || o.status === "packed";

export const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) });

export const fmtPhone = (p: string) => (p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : p);

export const addressLines = (a: Address) => [a.line1, a.line2, a.landmark && `Near ${a.landmark}`, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean) as string[];
