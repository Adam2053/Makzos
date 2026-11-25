/**
 * The account's shapes and their formatting helpers. Shopify is the source (Customer Account
 * API for signed-in customers, Admin API for guest tracking); lib/shopify/mappers turns its
 * objects into these. Plain module: safe on the server and in the browser.
 */
import type { Line } from "./cart";
import type { Every } from "./products";
import type { DeliveryId, Totals } from "./pricing";

export type User = { name: string; firstName: string; lastName: string; email?: string; phone?: string; since: string };

export type Address = {
  id: string;
  name: string;
  /** 10-digit Indian mobile, without +91. */
  phone: string;
  line1: string;
  line2?: string;
  /** Typed separately in the form; stored by Shopify as part of the second address line. */
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type OrderStatus = "placed" | "packed" | "shipped" | "out" | "delivered" | "cancelled";

/** The road an order travels. Cancelled is a turn off it, not a step on it. */
export const STEPS: { id: Exclude<OrderStatus, "cancelled">; label: string; note: string }[] = [
  { id: "placed", label: "Order placed", note: "We've got it." },
  { id: "packed", label: "Packed", note: "Sealed and boxed." },
  { id: "shipped", label: "Shipped", note: "With the courier." },
  { id: "out", label: "Out for delivery", note: "Arriving today." },
  { id: "delivered", label: "Delivered", note: "Enjoy the crunch." },
];

export type Tracking = { company?: string; number?: string; url?: string };

export type Order = {
  /** Shopify's numeric order id: the one in /orders/[id]. */
  id: string;
  /** What the shopper sees on emails: "#1001". */
  number: string;
  placedAt: string;
  status: OrderStatus;
  /** When each step happened, as ISO strings. */
  history: Partial<Record<OrderStatus, string>>;
  /** The lines the site knows how to draw (flavours, multipacks, boxes). */
  lines: Line[];
  /** Anything else on the order, shown by its Shopify title. */
  others: { title: string; qty: number; price: number }[];
  /** Box pricing is already inside Shopify's line prices, so this is always 0 on real orders. */
  saving: number;
  totals: Totals;
  coupon?: string;
  delivery: DeliveryId;
  address?: Address;
  contact: { name: string; phone?: string; email?: string };
  payment: { method: "paid" | "cod" | "refunded"; label: string };
  tracking: Tracking[];
  /** Shopify's order status page: receipts, returns, the courier's full history. */
  statusUrl?: string;
};

export type Subscription = {
  id: string;
  /** What's in it, as Shopify names it. */
  items: { title: string; qty: number }[];
  /** The same, as a line the site can draw, when it's one of ours. */
  line?: Line;
  every?: Every;
  status: "active" | "paused" | "cancelled" | "failed" | "expired";
  /** ISO date of the next billing and delivery. */
  next?: string;
};

/** Everything the account pages show, read in one request when an account page opens. */
export type AccountData = { user: User; addresses: Address[]; orders: Order[]; subs: Subscription[] };

/** Orders can't be cancelled online: Shopify only lets the shop do it. This says when it's still worth asking. */
export const canCancel = (o: Order) => o.status === "placed" || o.status === "packed";

export const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) });

export const fmtPhone = (p?: string) => (!p ? "" : p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : p);

export const addressLines = (a: Address) => [a.line1, a.line2, a.landmark && `Near ${a.landmark}`, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean) as string[];
