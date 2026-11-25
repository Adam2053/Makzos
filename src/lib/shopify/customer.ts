import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ShopifyError, customerReady, shopify } from "./config";
import { COOKIES, clear, readSealed, writeSealed } from "./session";

/**
 * Customer Account API: Shopify's passwordless sign-in (a six-digit code by email) and the
 * signed-in customer's own data. A confidential OAuth client with PKCE; endpoints are discovered
 * from the store rather than hard-coded, as Shopify asks.
 */

type OpenId = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint: string };
type ApiConfig = { graphql_api: string };

async function discover<T>(path: string): Promise<T> {
  if (!shopify.domain) throw new ShopifyError("SHOPIFY_STORE_DOMAIN isn't set.");
  const res = await fetch(`https://${shopify.domain}/.well-known/${path}`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new ShopifyError(`Discovery ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
const openId = () => discover<OpenId>("openid-configuration");
const apiConfig = () => discover<ApiConfig>("customer-account-api");

export type Session = { accessToken: string; refreshToken: string; idToken: string; expiresAt: number };
type Pkce = { verifier: string; state: string; nonce: string; returnTo: string };

const b64url = (b: Buffer) => b.toString("base64url");
const SESSION_AGE = 60 * 60 * 24 * 30; // The refresh token outlives this; the cookie is the limit.

export const callbackUrl = (origin: string) => `${origin}/api/auth/callback`;

/** Step 1: the URL to send the shopper to, with a fresh verifier, state and nonce saved for the callback. */
export async function beginLogin(origin: string, returnTo: string) {
  if (!customerReady()) throw new ShopifyError("Customer accounts aren't configured (see .env.example).");
  const { authorization_endpoint } = await openId();
  const verifier = b64url(randomBytes(32));
  const pkce: Pkce = { verifier, state: b64url(randomBytes(16)), nonce: b64url(randomBytes(16)), returnTo };
  await writeSealed(COOKIES.pkce, pkce, 600);

  const url = new URL(authorization_endpoint);
  url.searchParams.set("client_id", shopify.customer.clientId!);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", callbackUrl(origin));
  url.searchParams.set("state", pkce.state);
  url.searchParams.set("nonce", pkce.nonce);
  url.searchParams.set("code_challenge", b64url(createHash("sha256").update(verifier).digest()));
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

async function tokenRequest(params: Record<string, string>) {
  const { token_endpoint } = await openId();
  const { clientId, clientSecret } = shopify.customer;
  // A public client (the Hydrogen channel's) has no secret: Shopify identifies it by an Origin
  // listed in its JavaScript origins, and refuses token requests without a User-Agent.
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Makzos web" };
  if (clientSecret) headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  else headers.Origin = new URL(shopify.siteUrl).origin;
  const res = await fetch(token_endpoint, { method: "POST", headers, body: new URLSearchParams({ client_id: clientId!, ...params }), cache: "no-store" });
  if (!res.ok) throw new ShopifyError(`Token request failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
  const t = (await res.json()) as { access_token: string; refresh_token: string; id_token?: string; expires_in: number };
  return t;
}

function nonceOf(idToken: string) {
  try {
    return (JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8")) as { nonce?: string }).nonce;
  } catch {
    return undefined;
  }
}

/** Step 2: the callback. Checks state and nonce, trades the code for tokens and saves the session. */
export async function finishLogin(origin: string, code: string, state: string) {
  const pkce = await readSealed<Pkce>(COOKIES.pkce);
  await clear(COOKIES.pkce);
  if (!pkce || pkce.state !== state) throw new ShopifyError("Sign-in expired or didn't match. Please try again.");

  const t = await tokenRequest({ grant_type: "authorization_code", redirect_uri: callbackUrl(origin), code, code_verifier: pkce.verifier });
  if (!t.id_token || nonceOf(t.id_token) !== pkce.nonce) throw new ShopifyError("Sign-in couldn't be verified. Please try again.");
  const session: Session = { accessToken: t.access_token, refreshToken: t.refresh_token, idToken: t.id_token, expiresAt: Date.now() + t.expires_in * 1000 };
  await writeSealed(COOKIES.session, session, SESSION_AGE);
  return { session, returnTo: pkce.returnTo };
}

/**
 * The current session, refreshed when its access token has under five minutes left. Refreshing
 * writes a cookie, which only Server Actions and Route Handlers may do: elsewhere pass
 * `canWrite: false` and an expiring token is simply treated as signed out for that render.
 */
export async function getSession({ canWrite = true } = {}): Promise<Session | null> {
  if (!customerReady()) return null;
  const s = await readSealed<Session>(COOKIES.session);
  if (!s) return null;
  if (s.expiresAt - Date.now() > 5 * 60 * 1000) return s;
  if (!canWrite) return null;
  try {
    const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: s.refreshToken });
    const next: Session = { accessToken: t.access_token, refreshToken: t.refresh_token ?? s.refreshToken, idToken: t.id_token ?? s.idToken, expiresAt: Date.now() + t.expires_in * 1000 };
    await writeSealed(COOKIES.session, next, SESSION_AGE);
    return next;
  } catch {
    await clear(COOKIES.session);
    return null;
  }
}

/** Ends the session here and returns Shopify's logout URL, which ends it there too. */
export async function logout(origin: string) {
  const s = await readSealed<Session>(COOKIES.session);
  await clear(COOKIES.session);
  if (!s || !customerReady()) return origin;
  const { end_session_endpoint } = await openId();
  const url = new URL(end_session_endpoint);
  url.searchParams.set("id_token_hint", s.idToken);
  url.searchParams.set("post_logout_redirect_uri", `${origin}/`);
  return url.toString();
}

/** One Customer Account API call as the signed-in customer. */
export async function customerApi<T>(session: Session, query: string, variables?: Record<string, unknown>): Promise<T> {
  const { graphql_api } = await apiConfig();
  const res = await fetch(graphql_api, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: session.accessToken, "User-Agent": "Makzos web", Origin: new URL(shopify.siteUrl).origin },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (res.status === 401) throw new ShopifyError("Signed out", { status: 401 });
  if (!res.ok) throw new ShopifyError(`Customer Account API ${res.status}`);
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) throw new ShopifyError(`Customer Account API: ${body.errors.map((e) => e.message).join("; ")}`, body.errors);
  return body.data as T;
}

// ── Operations (validated against Customer Account API 2026-10) ───────────────

const ADDRESS_FIELDS = /* GraphQL */ `fragment AddressFields on CustomerAddress { id firstName lastName address1 address2 city zoneCode province zip phoneNumber }`;

export const ORDER_FIELDS = /* GraphQL */ `
  fragment OrderFields on Order {
    id name number processedAt cancelledAt financialStatus statusPageUrl email phone
    subtotal { amount } totalPrice { amount } totalShipping { amount }
    discountApplications(first: 5) { nodes { ... on DiscountCodeApplication { code } } }
    shippingLine { title }
    shippingAddress { firstName lastName address1 address2 city zoneCode province zip phoneNumber }
    lineItems(first: 50) { nodes { title quantity sku variantTitle customAttributes { key value } totalPrice { amount } } }
    fulfillments(first: 10) { nodes { createdAt status latestShipmentStatus trackingInformation { company number url } events(first: 20) { nodes { status happenedAt } } } }
  }
`;

export const ME = /* GraphQL */ `query Me { customer { id firstName lastName displayName creationDate emailAddress { emailAddress } phoneNumber { phoneNumber } } }`;

export const ACCOUNT = /* GraphQL */ `
  ${ADDRESS_FIELDS}
  ${ORDER_FIELDS}
  query Account {
    customer {
      id firstName lastName displayName creationDate
      emailAddress { emailAddress } phoneNumber { phoneNumber }
      defaultAddress { id }
      addresses(first: 20) { nodes { ...AddressFields } }
      orders(first: 30, sortKey: PROCESSED_AT, reverse: true) { nodes { ...OrderFields } }
      subscriptionContracts(first: 20) { nodes { id status nextBillingDate lines(first: 10) { nodes { name quantity sku } } deliveryPolicy { interval intervalCount { count } } } }
    }
  }
`;

export const ONE_ORDER = /* GraphQL */ `${ORDER_FIELDS} query OneOrder($id: ID!) { order(id: $id) { ...OrderFields } }`;

export const UPDATE_PROFILE = /* GraphQL */ `mutation Profile($input: CustomerUpdateInput!) { customerUpdate(input: $input) { customer { id } userErrors { field message code } } }`;
export const ADDRESS_CREATE = /* GraphQL */ `mutation AddrCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) { customerAddressCreate(address: $address, defaultAddress: $defaultAddress) { customerAddress { id } userErrors { field message code } } }`;
export const ADDRESS_UPDATE = /* GraphQL */ `mutation AddrUpdate($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) { customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) { customerAddress { id } userErrors { field message code } } }`;
export const ADDRESS_DELETE = /* GraphQL */ `mutation AddrDelete($addressId: ID!) { customerAddressDelete(addressId: $addressId) { deletedAddressId userErrors { field message code } } }`;

export const SUB_PAUSE = /* GraphQL */ `mutation SubPause($id: ID!) { subscriptionContractPause(subscriptionContractId: $id) { contract { id status } userErrors { field message code } } }`;
export const SUB_ACTIVATE = /* GraphQL */ `mutation SubActivate($id: ID!) { subscriptionContractActivate(subscriptionContractId: $id) { contract { id status } userErrors { field message code } } }`;
export const SUB_CANCEL = /* GraphQL */ `mutation SubCancel($id: ID!) { subscriptionContractCancel(subscriptionContractId: $id) { contract { id status } userErrors { field message code } } }`;
export const SUB_SKIP = /* GraphQL */ `mutation SubSkip($input: SubscriptionBillingCycleInput!) { subscriptionBillingCycleSkip(billingCycleInput: $input) { billingCycle { skipped } userErrors { field message code } } }`;
