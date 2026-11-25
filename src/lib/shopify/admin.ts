import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Order } from "../account";
import { ShopifyError, adminReady, shopify } from "./config";
import { fromAdminOrder, type AdminOrder } from "./mappers";

/**
 * Admin API, server-only, for the one job the storefront APIs can't do: let a guest who never
 * made an account look up their order. The token comes from the Dev Dashboard app's client
 * credentials (read_orders only) and lasts 24 hours; it's cached in memory until shortly before.
 */
let token: { value: string; expiresAt: number } | null = null;

async function adminToken() {
  if (token && token.expiresAt - Date.now() > 60_000) return token.value;
  const res = await fetch(`https://${shopify.domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: shopify.admin.clientId!, client_secret: shopify.admin.clientSecret! }),
    cache: "no-store",
  });
  if (!res.ok) throw new ShopifyError(`Admin token request failed: ${res.status}`);
  const t = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: t.access_token, expiresAt: Date.now() + t.expires_in * 1000 };
  return token.value;
}

async function admin<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${shopify.domain}/admin/api/${shopify.version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await adminToken() },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new ShopifyError(`Admin API ${res.status}`);
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) throw new ShopifyError(`Admin API: ${body.errors.map((e) => e.message).join("; ")}`);
  return body.data as T;
}

// Validated against Admin API 2026-10 (scope: read_orders).
const TRACK = /* GraphQL */ `
  query Track($q: String!) {
    orders(first: 1, query: $q) {
      nodes {
        id name processedAt cancelledAt email phone displayFinancialStatus statusPageUrl
        subtotalPriceSet { shopMoney { amount } } totalPriceSet { shopMoney { amount } } totalShippingPriceSet { shopMoney { amount } } totalDiscountsSet { shopMoney { amount } }
        discountCodes
        shippingLine { title }
        shippingAddress { firstName lastName address1 address2 city provinceCode province zip phone }
        lineItems(first: 50) { nodes { title quantity sku customAttributes { key value } discountedTotalSet { shopMoney { amount } } } }
        fulfillments(first: 10) { createdAt status displayStatus deliveredAt trackingInfo { company number url } events(first: 20) { nodes { status happenedAt } } }
      }
    }
  }
`;

const digits = (s?: string | null) => (s ?? "").replace(/\D/g, "").slice(-10);

/**
 * A guest's order, found by its number and checked against the email or phone it was placed
 * with. A wrong contact answers exactly like a missing order, so the form can't be used to
 * confirm which order numbers exist.
 */
export async function findOrderForTracking(orderNumber: string, contact: string): Promise<Order | null> {
  if (!adminReady()) throw new ShopifyError("Order lookup isn't configured (see .env.example).");
  const n = orderNumber.replace(/[^\d]/g, "");
  if (!n) return null;
  const data = await admin<{ orders: { nodes: (AdminOrder & { shippingAddress?: { phone?: string | null } | null })[] } }>(TRACK, { q: `name:#${n}` });
  const o = data.orders.nodes[0];
  if (!o) return null;

  const c = contact.trim().toLowerCase();
  const byEmail = c.includes("@") && o.email?.toLowerCase() === c;
  const byPhone = /^\d{10}$/.test(digits(c)) && [o.phone, o.shippingAddress?.phone].some((p) => digits(p) === digits(c));
  if (!byEmail && !byPhone) return null;

  const order = fromAdminOrder(o);
  // A guest sees where it is and what's in it; the full address stays with the shopper's own email.
  return { ...order, address: order.address && { ...order.address, line1: "", line2: undefined, phone: "" } };
}

/** Shopify signs each webhook with the app's secret; anything else is refused. */
export function verifyWebhook(rawBody: string, hmacHeader: string | null) {
  if (!shopify.webhookSecret || !hmacHeader) return false;
  const digest = createHmac("sha256", shopify.webhookSecret).update(rawBody, "utf8").digest();
  const given = Buffer.from(hmacHeader, "base64");
  return given.length === digest.length && timingSafeEqual(given, digest);
}
