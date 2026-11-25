/**
 * What an order costs on top of its bags, for the estimates the bag shows before Shopify answers.
 * Shopify is the authority: delivery rates and the free-delivery threshold live in its shipping
 * settings, codes in its discounts, serviceable pincodes in its shipping zones
 * (scripts/shopify/seed.mjs set them to these same numbers). Keep the two in step.
 */
import { inr } from "./products";

export type DeliveryId = "standard" | "express";

export const DELIVERY: Record<DeliveryId, { label: string; eta: string; fee: number }> = {
  standard: { label: "Standard", eta: "2 to 4 days", fee: 40 },
  express: { label: "Express", eta: "Next day in Hyderabad", fee: 90 },
};

/** Standard delivery is free from here up. Express always costs its fee. */
export const FREE_FROM = 499;

/** A code on the bag. `kind` and `value` are known for the codes we advertise; Shopify decides for any other. */
export type Coupon = { code: string; label: string; kind?: "percent" | "flat"; value?: number; min?: number };

/** The codes the site advertises (offers strip, product page). Each one exists in Shopify discounts. */
export const COUPONS: Coupon[] = [
  { code: "FIRSTCRUNCH", label: "10% off your first order", kind: "percent", value: 10 },
  { code: "BOXOFF50", label: `${inr(50)} off orders over ${inr(400)}`, kind: "flat", value: 50, min: 400 },
];

export function discountFor(coupon: Coupon | null, subtotal: number) {
  if (!coupon?.kind || !coupon.value || (coupon.min && subtotal < coupon.min)) return 0;
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
 * A quick pincode check for the forms: six digits, and when Express reaches it. Whether we
 * deliver there at all is Shopify checkout's call, from the shipping zones.
 */
export function serviceFor(pincode: string): { ok: boolean; message: string } {
  if (!/^\d{6}$/.test(pincode)) return { ok: false, message: "Pincodes are six digits." };
  const express = /^50[0-2]/.test(pincode) ? " Next day with Express." : "";
  return { ok: true, message: `Delivers to ${pincode} in ${DELIVERY.standard.eta}.${express}` };
}
