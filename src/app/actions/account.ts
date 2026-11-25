"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Address, Order } from "@/lib/account";
import { ShopifyError, assertNoUserErrors } from "@/lib/shopify/config";
import {
  ADDRESS_CREATE, ADDRESS_DELETE, ADDRESS_UPDATE, SUB_ACTIVATE, SUB_CANCEL, SUB_PAUSE, SUB_SKIP, UPDATE_PROFILE,
  customerApi, getSession,
} from "@/lib/shopify/customer";
import { fromAddress, stateCode } from "@/lib/shopify/mappers";
import { findOrderForTracking } from "@/lib/shopify/admin";

/** Every account change: as the signed-in customer, then the account pages re-read Shopify. */
type Result = { ok: true } | { ok: false; message: string };
type Payload = { userErrors?: { message: string }[] };

async function asCustomer(run: (call: <T>(q: string, v?: Record<string, unknown>) => Promise<T>) => Promise<void>): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, message: "You've been signed out. Sign in again to save this." };
  try {
    await run((q, v) => customerApi(session, q, v));
    revalidatePath("/account", "layout");
    return { ok: true };
  } catch (e) {
    if (!(e instanceof ShopifyError)) console.error("[shopify]", e);
    return { ok: false, message: e instanceof ShopifyError ? e.message.replace(/^[^:]+: /, "") : "That didn't save. Please try again." };
  }
}

export async function saveAddress(a: Omit<Address, "id"> & { id?: string }): Promise<Result> {
  if (!stateCode(a.state)) return { ok: false, message: `${a.state} isn't a state we recognise. Use its full name, like Telangana.` };
  return asCustomer(async (call) => {
    const address = fromAddress(a);
    if (a.id) {
      const r = await call<{ customerAddressUpdate: Payload }>(ADDRESS_UPDATE, { addressId: a.id, address, defaultAddress: a.isDefault ?? false });
      assertNoUserErrors("Address", r.customerAddressUpdate);
    } else {
      const r = await call<{ customerAddressCreate: Payload }>(ADDRESS_CREATE, { address, defaultAddress: a.isDefault ?? false });
      assertNoUserErrors("Address", r.customerAddressCreate);
    }
  });
}

export async function removeAddress(id: string): Promise<Result> {
  return asCustomer(async (call) => {
    const r = await call<{ customerAddressDelete: Payload }>(ADDRESS_DELETE, { addressId: id });
    assertNoUserErrors("Address", r.customerAddressDelete);
  });
}

export async function setDefaultAddress(id: string): Promise<Result> {
  return asCustomer(async (call) => {
    const r = await call<{ customerAddressUpdate: Payload }>(ADDRESS_UPDATE, { addressId: id, defaultAddress: true });
    assertNoUserErrors("Address", r.customerAddressUpdate);
  });
}

/** Names only: Shopify owns the sign-in email, so it's changed from Shopify's own account page. */
export async function updateProfile(name: string): Promise<Result> {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  if (!firstName) return { ok: false, message: "Add your name." };
  return asCustomer(async (call) => {
    const r = await call<{ customerUpdate: Payload }>(UPDATE_PROFILE, { input: { firstName, lastName: rest.join(" ") } });
    assertNoUserErrors("Profile", r.customerUpdate);
  });
}

/** Pause, resume, cancel or skip the next delivery of a subscription (Shopify Subscriptions). */
export async function changeSubscription(id: string, change: "pause" | "resume" | "cancel" | "skip", next?: string): Promise<Result> {
  return asCustomer(async (call) => {
    if (change === "skip") {
      if (!next) throw new ShopifyError("There's no next delivery to skip.");
      const r = await call<{ subscriptionBillingCycleSkip: Payload }>(SUB_SKIP, { input: { contractId: id, selector: { date: next } } });
      assertNoUserErrors("Subscription", r.subscriptionBillingCycleSkip);
      return;
    }
    const [q, key] = change === "pause" ? [SUB_PAUSE, "subscriptionContractPause"] : change === "resume" ? [SUB_ACTIVATE, "subscriptionContractActivate"] : [SUB_CANCEL, "subscriptionContractCancel"];
    const r = await call<Record<string, Payload>>(q, { id });
    assertNoUserErrors("Subscription", r[key]);
  });
}

// ── Guest order tracking ────────────────────────────────────────────────────

/** A small in-memory brake on guessing: five lookups a minute per address. Per server instance. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

export async function trackOrder(orderNumber: string, contact: string, trap = ""): Promise<{ ok: true; order: Order } | { ok: false; message: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (trap) return { ok: false, message: "No order found." };
  if (limited(ip)) return { ok: false, message: "Too many tries. Wait a minute and try again." };
  const n = orderNumber.replace(/[^\d]/g, "");
  if (!n) return { ok: false, message: "Order numbers look like #1001. It's in your confirmation email." };
  if (!contact.includes("@") && !/^\d{10}$/.test(contact.replace(/\D/g, "").slice(-10))) return { ok: false, message: "Enter the email or 10-digit mobile number you ordered with." };
  try {
    const order = await findOrderForTracking(n, contact);
    return order ? { ok: true, order } : { ok: false, message: `No order #${n} with those details. Check both, or write to hello@makzos.com.` };
  } catch (e) {
    console.error("[shopify] track", e);
    return { ok: false, message: "Tracking is unavailable right now. Write to hello@makzos.com and we'll look it up." };
  }
}
