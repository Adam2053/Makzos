/**
 * What an order costs on top of its bags: delivery and codes. Every number here is a
 * placeholder for the UI, like the bag prices in lib/products: confirm before launch.
 */
import { inr } from "./products";

export type DeliveryId = "standard" | "express";

export const DELIVERY: Record<DeliveryId, { label: string; eta: string; fee: number }> = {
  standard: { label: "Standard", eta: "2 to 4 days", fee: 40 },
  express: { label: "Express", eta: "Next day in Hyderabad", fee: 90 },
};

/** Standard delivery is free from here up. Express always costs its fee. */
export const FREE_FROM = 499;

export type Coupon = { code: string; label: string; kind: "percent" | "flat"; value: number; min?: number };

export const COUPONS: Coupon[] = [
  { code: "FIRSTCRUNCH", label: "10% off your first order", kind: "percent", value: 10 },
  { code: "BOXOFF50", label: `${inr(50)} off orders over ${inr(400)}`, kind: "flat", value: 50, min: 400 },
];

/** Checks a typed code against the subtotal; the message says exactly why it didn't apply. */
export function checkCoupon(raw: string, subtotal: number): { ok: true; coupon: Coupon } | { ok: false; message: string } {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, message: "Type a code first." };
  const coupon = COUPONS.find((c) => c.code === code);
  if (!coupon) return { ok: false, message: `${code} isn't a code we know. Check the spelling.` };
  if (coupon.min && subtotal < coupon.min) return { ok: false, message: `${code} works on orders over ${inr(coupon.min)}. Add ${inr(coupon.min - subtotal)} more.` };
  return { ok: true, coupon };
}

export function discountFor(coupon: Coupon | null, subtotal: number) {
  if (!coupon || (coupon.min && subtotal < coupon.min)) return 0;
  return coupon.kind === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
}

export function deliveryFee(method: DeliveryId, subtotal: number) {
  if (subtotal === 0) return 0;
  return method === "standard" && subtotal >= FREE_FROM ? 0 : DELIVERY[method].fee;
}

export type Totals = { subtotal: number; discount: number; delivery: number; total: number };

export function totals(subtotal: number, coupon: Coupon | null, method: DeliveryId): Totals {
  const discount = discountFor(coupon, subtotal);
  const delivery = deliveryFee(method, subtotal - discount);
  return { subtotal, discount, delivery, total: subtotal - discount + delivery };
}

/**
 * Where we deliver. For now every valid pincode is accepted, except one kept blocked so the
 * "can't deliver" state can be tested. Swap in the courier's serviceability check later.
 */
export const BLOCKED_PINCODE = "442401";

export function serviceFor(pincode: string): { ok: boolean; message: string } {
  if (!/^\d{6}$/.test(pincode)) return { ok: false, message: "Pincodes are six digits." };
  if (pincode === BLOCKED_PINCODE) return { ok: false, message: "We don't deliver to this pincode yet. For now, find us on Amazon." };
  const express = /^50[0-2]/.test(pincode) ? " Next day with Express." : "";
  return { ok: true, message: `Delivers to ${pincode} in ${DELIVERY.standard.eta}.${express}` };
}
