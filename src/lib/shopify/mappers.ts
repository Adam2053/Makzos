import "server-only";
import { FLAVOURS, type Every } from "../products";
import type { Line } from "../cart";
import { money, weeksOf } from "../commerce";
import type { Address, Order, OrderStatus, Subscription, Tracking, User } from "../account";

/**
 * Shopify objects → the site's account shapes. Orders come from two APIs (Customer Account for
 * signed-in shoppers, Admin for guest tracking) whose fields differ in name but not in meaning,
 * so both are first normalised to `RawOrder` and mapped once.
 */

// ── Indian states ⇄ Shopify zone codes ──────────────────────────────────────
const STATES: [string, string][] = [
  ["AN", "Andaman and Nicobar Islands"], ["AP", "Andhra Pradesh"], ["AR", "Arunachal Pradesh"], ["AS", "Assam"], ["BR", "Bihar"],
  ["CH", "Chandigarh"], ["CG", "Chhattisgarh"], ["DN", "Dadra and Nagar Haveli and Daman and Diu"], ["DL", "Delhi"], ["GA", "Goa"],
  ["GJ", "Gujarat"], ["HR", "Haryana"], ["HP", "Himachal Pradesh"], ["JK", "Jammu and Kashmir"], ["JH", "Jharkhand"],
  ["KA", "Karnataka"], ["KL", "Kerala"], ["LA", "Ladakh"], ["LD", "Lakshadweep"], ["MP", "Madhya Pradesh"], ["MH", "Maharashtra"],
  ["MN", "Manipur"], ["ML", "Meghalaya"], ["MZ", "Mizoram"], ["NL", "Nagaland"], ["OR", "Odisha"], ["PY", "Puducherry"],
  ["PB", "Punjab"], ["RJ", "Rajasthan"], ["SK", "Sikkim"], ["TN", "Tamil Nadu"], ["TS", "Telangana"], ["TR", "Tripura"],
  ["UP", "Uttar Pradesh"], ["UK", "Uttarakhand"], ["WB", "West Bengal"],
];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
export const stateCode = (name: string) => STATES.find(([code, n]) => norm(n) === norm(name) || code === name.toUpperCase())?.[0];
const stateName = (code?: string | null, fallback?: string | null) => STATES.find(([c]) => c === code)?.[1] ?? fallback ?? code ?? "";

/** Shopify keeps phones in E.164; the site shows and validates the 10-digit number. */
const localPhone = (p?: string | null) => (p ? p.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "") : "");
export const e164 = (p: string) => `+91${p.replace(/\D/g, "").slice(-10)}`;

const numericId = (gid: string) => gid.split("/").pop()!.split("?")[0];

// ── Addresses ───────────────────────────────────────────────────────────────
type RawAddress = {
  id?: string; firstName?: string | null; lastName?: string | null; address1?: string | null; address2?: string | null;
  city?: string | null; zoneCode?: string | null; provinceCode?: string | null; province?: string | null; zip?: string | null;
  phoneNumber?: string | null; phone?: string | null;
};

export function toAddress(a: RawAddress, defaultId?: string | null): Address {
  return {
    id: a.id ?? "shipping",
    name: [a.firstName, a.lastName].filter(Boolean).join(" "),
    phone: localPhone(a.phoneNumber ?? a.phone),
    line1: a.address1 ?? "",
    line2: a.address2 ?? undefined,
    city: a.city ?? "",
    state: stateName(a.zoneCode ?? a.provinceCode, a.province),
    pincode: a.zip ?? "",
    ...(defaultId && a.id === defaultId ? { isDefault: true } : {}),
  };
}

/** The site's address as Shopify's CustomerAddressInput. The landmark joins the second line. */
export function fromAddress(a: Omit<Address, "id">) {
  const [firstName, ...rest] = a.name.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" ") || firstName,
    address1: a.line1,
    address2: [a.line2, a.landmark && `Near ${a.landmark}`].filter(Boolean).join(", ") || undefined,
    city: a.city,
    zoneCode: stateCode(a.state),
    zip: a.pincode,
    phoneNumber: e164(a.phone),
    countryCode: "IN",
  };
}

// ── Customer ────────────────────────────────────────────────────────────────
export type RawCustomer = {
  firstName?: string | null; lastName?: string | null; displayName?: string | null; creationDate: string;
  emailAddress?: { emailAddress?: string | null } | null; phoneNumber?: { phoneNumber?: string | null } | null;
};

export function toUser(c: RawCustomer): User {
  const email = c.emailAddress?.emailAddress ?? undefined;
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.displayName || email?.split("@")[0] || "there";
  return { name, firstName: c.firstName ?? "", lastName: c.lastName ?? "", email, phone: localPhone(c.phoneNumber?.phoneNumber) || undefined, since: c.creationDate };
}

// ── Lines ───────────────────────────────────────────────────────────────────
type RawItem = { title: string; quantity: number; sku?: string | null; customAttributes?: { key: string; value?: string | null }[]; price: number };

const flavourByName = (name: string) => FLAVOURS.find((f) => norm(f.name) === norm(name));

/** Our SKUs say what a line is: MKZ-<flavour>-1, MKZ-<flavour>-3, MKZ-BOX-<n>. Anything else stays a titled line. */
function toLine(item: RawItem, i: number): Line | null {
  const box = /^MKZ-BOX-(\d+)$/i.exec(item.sku ?? "");
  if (box) {
    const attrs = item.customAttributes ?? [];
    const ids = attrs.filter((a) => /^Bag \d+$/.test(a.key)).map((a) => flavourByName(a.value ?? "")?.id).filter(Boolean) as string[];
    if (ids.length === 0) return null;
    const note = attrs.find((a) => a.key === "Gift note")?.value ?? undefined;
    return { key: `o${i}-box`, kind: "box", ids, qty: item.quantity, ...(note ? { note } : {}) };
  }
  const bag = /^MKZ-(.+)-([13])$/i.exec(item.sku ?? "");
  const f = bag && FLAVOURS.find((x) => x.id === bag[1].toLowerCase());
  if (f) return { key: `o${i}-${f.id}`, kind: "bag", id: f.id, qty: item.quantity, ...(bag[2] === "3" ? { size: 3 as const } : {}) };
  return null;
}

function splitItems(items: RawItem[]) {
  const lines: Line[] = [];
  const others: Order["others"] = [];
  items.forEach((item, i) => {
    const l = toLine(item, i);
    if (l) lines.push(l);
    else others.push({ title: item.title, qty: item.quantity, price: item.price });
  });
  return { lines, others };
}

// ── Orders ──────────────────────────────────────────────────────────────────
type RawFulfillment = { createdAt: string; status?: string | null; shipment?: string | null; deliveredAt?: string | null; events: { status: string; happenedAt: string }[]; tracking: Tracking[] };

type RawOrder = {
  id: string; name: string; processedAt: string; cancelledAt?: string | null; financialStatus?: string | null; statusPageUrl?: string | null;
  email?: string | null; phone?: string | null;
  subtotal: number; shipping: number; total: number; discount?: number; codes: string[];
  shippingTitle?: string | null; shippingAddress?: RawAddress | null;
  items: RawItem[]; fulfillments: RawFulfillment[];
};

const PACKED = ["LABEL_PRINTED", "LABEL_PURCHASED", "CONFIRMED", "SUBMITTED", "READY_FOR_PICKUP"];
const OUT = ["OUT_FOR_DELIVERY", "ATTEMPTED_DELIVERY"];
const DONE = ["DELIVERED", "PICKED_UP"];

/** Where an order is, read from its latest fulfilment's shipment status and its tracking events. */
function progress(o: RawOrder): { status: OrderStatus; history: Order["history"] } {
  const history: Order["history"] = { placed: o.processedAt };
  if (o.cancelledAt) return { status: "cancelled", history: { ...history, cancelled: o.cancelledAt } };
  const live = o.fulfillments.filter((f) => !/CANCEL/i.test(f.status ?? ""));
  if (live.length === 0) return { status: "placed", history };

  const f = live[live.length - 1];
  const at = (statuses: string[]) => f.events.find((e) => statuses.includes(e.status))?.happenedAt;
  const shipment = (f.shipment ?? f.events[f.events.length - 1]?.status ?? "").toUpperCase();

  let status: OrderStatus = "shipped";
  if (DONE.includes(shipment) || f.deliveredAt) status = "delivered";
  else if (OUT.includes(shipment)) status = "out";
  else if (PACKED.includes(shipment) && !f.tracking.some((t) => t.number)) status = "packed";

  history.packed = at(PACKED) ?? f.createdAt;
  if (status !== "packed") history.shipped = at(["IN_TRANSIT", "CARRIER_PICKED_UP"]) ?? f.createdAt;
  if (status === "out" || status === "delivered") history.out = at(OUT) ?? undefined;
  if (status === "delivered") history.delivered = f.deliveredAt ?? at(DONE) ?? f.createdAt;
  return { status, history };
}

function payment(financial?: string | null): Order["payment"] {
  const s = (financial ?? "").toUpperCase();
  if (s.includes("REFUND") || s === "VOIDED") return { method: "refunded", label: s === "VOIDED" ? "Payment voided" : "Refunded" };
  if (s === "PAID" || s === "PARTIALLY_PAID" || s === "AUTHORIZED") return { method: "paid", label: "Paid online" };
  return { method: "cod", label: "Cash on delivery" };
}

function toOrder(o: RawOrder): Order {
  const { status, history } = progress(o);
  const { lines, others } = splitItems(o.items);
  const address = o.shippingAddress ? toAddress(o.shippingAddress) : undefined;
  const discount = o.discount ?? Math.max(0, Math.round((o.subtotal + o.shipping - o.total) * 100) / 100);
  return {
    id: numericId(o.id),
    number: o.name.startsWith("#") ? o.name : `#${o.name}`,
    placedAt: o.processedAt,
    status, history, lines, others,
    saving: 0,
    totals: { subtotal: o.subtotal, discount, delivery: o.shipping, total: o.total },
    ...(o.codes[0] ? { coupon: o.codes[0] } : {}),
    delivery: /express/i.test(o.shippingTitle ?? "") ? "express" : "standard",
    address,
    contact: { name: address?.name ?? "", phone: localPhone(o.phone) || address?.phone || undefined, email: o.email ?? undefined },
    payment: payment(o.financialStatus),
    tracking: o.fulfillments.flatMap((f) => f.tracking).filter((t) => t.number || t.url),
    statusUrl: o.statusPageUrl ?? undefined,
  };
}

type M = { amount: string } | null | undefined;
type Set = { shopMoney: { amount: string } } | null | undefined;

/** An order from the Customer Account API (OrderFields in lib/shopify/customer). */
export type CustomerOrder = {
  id: string; name: string; processedAt: string; cancelledAt?: string | null; financialStatus?: string | null; statusPageUrl?: string | null;
  email?: string | null; phone?: string | null; subtotal?: M; totalPrice: M; totalShipping: M;
  discountApplications: { nodes: { code?: string }[] }; shippingLine?: { title?: string | null } | null; shippingAddress?: RawAddress | null;
  lineItems: { nodes: { title: string; quantity: number; sku?: string | null; customAttributes: { key: string; value?: string | null }[]; totalPrice?: M }[] };
  fulfillments: { nodes: { createdAt: string; status?: string | null; latestShipmentStatus?: string | null; trackingInformation: Tracking[]; events: { nodes: { status: string; happenedAt: string }[] } }[] };
};

export const fromCustomerOrder = (o: CustomerOrder): Order =>
  toOrder({
    id: o.id, name: o.name, processedAt: o.processedAt, cancelledAt: o.cancelledAt, financialStatus: o.financialStatus, statusPageUrl: o.statusPageUrl,
    email: o.email, phone: o.phone,
    subtotal: money(o.subtotal), shipping: money(o.totalShipping), total: money(o.totalPrice),
    codes: o.discountApplications.nodes.map((d) => d.code).filter(Boolean) as string[],
    shippingTitle: o.shippingLine?.title, shippingAddress: o.shippingAddress,
    items: o.lineItems.nodes.map((l) => ({ title: l.title, quantity: l.quantity, sku: l.sku, customAttributes: l.customAttributes, price: money(l.totalPrice) })),
    fulfillments: o.fulfillments.nodes.map((f) => ({
      createdAt: f.createdAt, status: f.status, shipment: f.latestShipmentStatus,
      events: f.events.nodes, tracking: f.trackingInformation,
    })),
  });

/** An order from the Admin API (guest tracking). */
export type AdminOrder = {
  id: string; name: string; processedAt: string; cancelledAt?: string | null; email?: string | null; phone?: string | null;
  displayFinancialStatus?: string | null; statusPageUrl?: string | null;
  subtotalPriceSet: Set; totalPriceSet: Set; totalShippingPriceSet: Set; totalDiscountsSet: Set; discountCodes: string[];
  shippingLine?: { title?: string | null } | null; shippingAddress?: RawAddress | null;
  lineItems: { nodes: { title: string; quantity: number; sku?: string | null; customAttributes: { key: string; value?: string | null }[]; discountedTotalSet: Set }[] };
  fulfillments: { createdAt: string; status?: string | null; displayStatus?: string | null; deliveredAt?: string | null; trackingInfo: Tracking[]; events: { nodes: { status: string; happenedAt: string }[] } }[];
};

const shop = (s: Set) => money(s?.shopMoney);

export const fromAdminOrder = (o: AdminOrder): Order =>
  toOrder({
    id: o.id, name: o.name, processedAt: o.processedAt, cancelledAt: o.cancelledAt, financialStatus: o.displayFinancialStatus, statusPageUrl: o.statusPageUrl,
    email: o.email, phone: o.phone,
    subtotal: shop(o.subtotalPriceSet), shipping: shop(o.totalShippingPriceSet), total: shop(o.totalPriceSet), discount: shop(o.totalDiscountsSet),
    codes: o.discountCodes,
    shippingTitle: o.shippingLine?.title, shippingAddress: o.shippingAddress,
    items: o.lineItems.nodes.map((l) => ({ title: l.title, quantity: l.quantity, sku: l.sku, customAttributes: l.customAttributes, price: shop(l.discountedTotalSet) })),
    fulfillments: o.fulfillments.map((f) => ({
      createdAt: f.createdAt, status: f.status, shipment: f.displayStatus, deliveredAt: f.deliveredAt,
      events: f.events.nodes, tracking: f.trackingInfo,
    })),
  });

// ── Subscriptions ───────────────────────────────────────────────────────────
export type RawContract = {
  id: string; status: string; nextBillingDate?: string | null;
  lines: { nodes: { name: string; quantity: number; sku?: string | null }[] };
  deliveryPolicy?: { interval?: string | null; intervalCount?: { count: number } | null } | null;
};

export function toSubscription(c: RawContract): Subscription {
  const count = c.deliveryPolicy?.intervalCount?.count ?? 0;
  const interval = (c.deliveryPolicy?.interval ?? "").toUpperCase();
  const weeks = interval === "WEEK" ? count : interval === "DAY" ? count / 7 : interval === "MONTH" ? count * 4 : 0;
  const every = weeksOf(`${weeks} weeks`) as Every | undefined;
  const first = c.lines.nodes[0];
  const line = first && c.lines.nodes.length === 1 ? toLine({ title: first.name, quantity: first.quantity, sku: first.sku, price: 0 }, 0) : null;
  const status = c.status.toLowerCase() as Subscription["status"];
  return {
    id: c.id,
    items: c.lines.nodes.map((l) => ({ title: l.name, qty: l.quantity })),
    ...(line ? { line: { ...line, ...(every ? { every } : {}) } } : {}),
    ...(every ? { every } : {}),
    status: ["active", "paused", "cancelled", "failed", "expired"].includes(status) ? status : "active",
    ...(c.nextBillingDate ? { next: c.nextBillingDate } : {}),
  };
}
