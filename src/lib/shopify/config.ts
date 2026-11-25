import "server-only";

/**
 * Shopify settings, read once from the environment. Everything Shopify-related reads them
 * through here so a missing key fails loudly in one place instead of as a 401 somewhere deep.
 * `.env.example` lists every key; docs/shopify-setup.md says where each one comes from.
 */
const env = (name: string) => process.env[name]?.trim() || undefined;

export const shopify = {
  domain: env("SHOPIFY_STORE_DOMAIN"),
  version: env("SHOPIFY_API_VERSION") ?? "2026-10",
  storefront: {
    privateToken: env("SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),
    publicToken: env("SHOPIFY_STOREFRONT_PUBLIC_TOKEN"),
  },
  customer: {
    clientId: env("SHOPIFY_CUSTOMER_CLIENT_ID"),
    clientSecret: env("SHOPIFY_CUSTOMER_CLIENT_SECRET"),
  },
  admin: {
    clientId: env("SHOPIFY_ADMIN_CLIENT_ID"),
    clientSecret: env("SHOPIFY_ADMIN_CLIENT_SECRET"),
  },
  webhookSecret: env("SHOPIFY_WEBHOOK_SECRET"),
  sessionSecret: env("SESSION_SECRET"),
  siteUrl: env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  /** India only, for now: prices, availability and checkout are asked for in this market. */
  country: "IN" as const,
};

/** True when the catalogue and cart can talk to Shopify. Without it the site runs on its local placeholders. */
export const storefrontReady = () => Boolean(shopify.domain && (shopify.storefront.privateToken || shopify.storefront.publicToken));
export const customerReady = () => Boolean(shopify.domain && shopify.customer.clientId && shopify.sessionSecret);
export const adminReady = () => Boolean(shopify.domain && shopify.admin.clientId && shopify.admin.clientSecret);

export class ShopifyError extends Error {
  constructor(message: string, readonly detail?: unknown) {
    super(message);
    this.name = "ShopifyError";
  }
}

/** Throws a readable error for the first `userErrors` entry of a mutation payload. */
export function assertNoUserErrors(label: string, payload: { userErrors?: { message: string; field?: string[] | null }[] } | null | undefined) {
  const e = payload?.userErrors?.[0];
  if (e) throw new ShopifyError(`${label}: ${e.message}`, payload?.userErrors);
}
