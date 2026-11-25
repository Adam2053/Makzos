import "server-only";
import { headers } from "next/headers";
import { ShopifyError, shopify } from "./config";

type FetchOpts = {
  variables?: Record<string, unknown>;
  /** Cache tags for catalogue reads; revalidated by the product webhooks. Omit for carts. */
  tags?: string[];
  /** Pass for requests made on behalf of a shopper, so Shopify can tell shoppers apart. */
  buyer?: boolean;
};

/** The tag every catalogue read carries; the webhook route expires it. */
export const CATALOG_TAG = "shopify-catalog";

async function buyerIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
}

/**
 * One Storefront API call. Server-side only: it prefers the private token, and for shopper
 * traffic sends the shopper's IP so Shopify's bot protection and logged-in checkout work.
 * Catalogue reads are cached until a webhook says the catalogue changed; carts never are.
 */
export async function storefront<T>(query: string, { variables, tags, buyer }: FetchOpts = {}): Promise<T> {
  const { domain, version, storefront: tokens } = shopify;
  if (!domain || !(tokens.privateToken || tokens.publicToken)) throw new ShopifyError("Shopify Storefront API isn't configured (see .env.example).");

  const head: Record<string, string> = { "Content-Type": "application/json" };
  if (tokens.privateToken) head["Shopify-Storefront-Private-Token"] = tokens.privateToken;
  else head["X-Shopify-Storefront-Access-Token"] = tokens.publicToken!;
  if (buyer) {
    const ip = await buyerIp();
    if (ip) head["Shopify-Storefront-Buyer-IP"] = ip;
  }

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: head,
    body: JSON.stringify({ query, variables }),
    ...(tags ? { next: { tags, revalidate: 3600 } } : { cache: "no-store" as const }),
  });
  if (!res.ok) throw new ShopifyError(`Storefront API ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 500));
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) throw new ShopifyError(`Storefront API: ${body.errors.map((e) => e.message).join("; ")}`, body.errors);
  return body.data as T;
}
