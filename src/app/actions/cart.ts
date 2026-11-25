"use server";

import type { Line } from "@/lib/cart";
import type { Quote } from "@/lib/commerce";
import { ShopifyError } from "@/lib/shopify/config";
import { getCatalog } from "@/lib/shopify/catalog";
import { attachCustomer, cartGone, syncCart } from "@/lib/shopify/cart";
import { getSession } from "@/lib/shopify/customer";
import { COOKIES, clear, readPlain, writePlain } from "@/lib/shopify/session";

/**
 * The bag lives in the browser for instant feedback; these actions make Shopify's cart match it
 * whenever real numbers are needed: a quote for the bag page, a code check, and checkout.
 */
type Result<T> = { ok: true; data: T } | { ok: false; message: string };

const CART_AGE = 60 * 60 * 24 * 10; // Shopify keeps an untouched cart for 10 days.

/** Lines arrive from the browser: keep only well-formed ones with sane quantities. */
function clean(lines: Line[]): Line[] {
  if (!Array.isArray(lines)) return [];
  return lines
    .filter((l) => l && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 50)
    .filter((l) => (l.kind === "bag" && typeof l.id === "string") || (l.kind === "box" && Array.isArray(l.ids) && l.ids.length >= 4 && l.ids.length <= 7))
    .slice(0, 50);
}

async function sync(lines: Line[], code?: string, note?: string) {
  const catalog = await getCatalog();
  if (!catalog) throw new ShopifyError("Checkout is offline right now. Please try again in a few minutes.");
  const cart = await syncCart({ cartId: await readPlain(COOKIES.cart), lines: clean(lines), catalog, code, note });
  await writePlain(COOKIES.cart, cart.id, CART_AGE);
  return cart;
}

const fail = (e: unknown): { ok: false; message: string } => {
  if (!(e instanceof ShopifyError)) console.error("[shopify]", e);
  return { ok: false, message: e instanceof ShopifyError ? e.message : "Something went wrong. Please try again." };
};

/** Shopify's numbers for the bag: subtotal, discount and total before delivery. */
export async function quoteBag(lines: Line[], code?: string): Promise<Result<Quote>> {
  if (clean(lines).length === 0) return { ok: true, data: { subtotal: 0, discount: 0, total: 0 } };
  try {
    return { ok: true, data: (await sync(lines, code)).quote };
  } catch (e) {
    return fail(e);
  }
}

/** Checks a code against the bag as it stands; the message says why it didn't apply. */
export async function checkCode(lines: Line[], code: string): Promise<Result<Quote>> {
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false, message: "Type a code first." };
  if (clean(lines).length === 0) return { ok: false, message: "Add something to your bag first." };
  const r = await quoteBag(lines, c);
  if (!r.ok) return r;
  if (!r.data.code?.applicable) return { ok: false, message: `${c} doesn't apply to this bag. Check the spelling, or what it needs.` };
  return r;
}

/**
 * Builds the Shopify cart from the bag, signs it in as the customer when there is one (so
 * checkout opens with their addresses), and returns Shopify's checkout URL to go to.
 */
export async function beginCheckout(lines: Line[], code?: string): Promise<Result<{ url: string }>> {
  if (clean(lines).length === 0) return { ok: false, message: "Your bag is empty." };
  try {
    const cart = await sync(lines, code);
    const session = await getSession();
    const url = (session && (await attachCustomer(cart.id, session.accessToken).catch(() => undefined))) || cart.checkoutUrl;
    return { ok: true, data: { url } };
  } catch (e) {
    return fail(e);
  }
}

/** True once the cart that went to checkout is gone from Shopify: the order was placed. */
export async function checkoutFinished(): Promise<boolean> {
  const id = await readPlain(COOKIES.cart);
  if (!id) return false;
  try {
    if (!(await cartGone(id))) return false;
    await clear(COOKIES.cart);
    return true;
  } catch {
    return false;
  }
}
