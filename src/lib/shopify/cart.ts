import "server-only";
import { BOX_SIZE, byId } from "../products";
import type { Line } from "../cart";
import { money, type Catalog, type Quote } from "../commerce";
import { ShopifyError, assertNoUserErrors, shopify } from "./config";
import { storefront } from "./storefront";

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount } totalAmount { amount } }
    discountCodes { code applicable }
    lines(first: 100) { nodes { id quantity discountAllocations(lineLevelOnly: false) { discountedAmount { amount } } cost { subtotalAmount { amount } } } }
  }
`;

const CREATE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartCreate($input: CartInput!, $country: CountryCode) @inContext(country: $country) {
    cartCreate(input: $input) { cart { ...CartFields } userErrors { field message code } warnings { code message } }
  }
`;

/** Mutations in one document run in order, so this empties the cart, refills it and sets the code in one round trip. */
const REPLACE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartReplace($cartId: ID!, $remove: [ID!]!, $lines: [CartLineInput!]!, $codes: [String!]!, $note: String!, $attributes: [AttributeInput!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $remove) { userErrors { field message code } }
    cartLinesAdd(cartId: $cartId, lines: $lines) { userErrors { field message code } }
    cartNoteUpdate(cartId: $cartId, note: $note) { userErrors { field message code } }
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { userErrors { field message code } }
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) { cart { ...CartFields } userErrors { field message code } warnings { code message } }
  }
`;

const LINE_IDS = /* GraphQL */ `query CartLines($id: ID!) { cart(id: $id) { id lines(first: 100) { nodes { id } } } }`;

const BUYER = /* GraphQL */ `
  mutation CartBuyer($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) { cart { id checkoutUrl } userErrors { field message code } }
  }
`;

type CartLineInput = { merchandiseId: string; quantity: number; sellingPlanId?: string; attributes?: { key: string; value: string }[] };
type Money = { amount: string };
type CartData = {
  id: string; checkoutUrl: string; totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  discountCodes: { code: string; applicable: boolean }[];
  lines: { nodes: { id: string; quantity: number; discountAllocations: { discountedAmount: Money }[]; cost: { subtotalAmount: Money } }[] };
};
type Payload = { cart: CartData | null; userErrors: { field?: string[] | null; message: string; code?: string }[] };

/** Box contents ride on the line as properties, so they print on the order and the packing slip. */
function boxAttributes(ids: string[], note?: string) {
  const attrs = ids.map((id, i) => ({ key: `Bag ${i + 1}`, value: byId(id).name }));
  if (note) attrs.push({ key: "Gift note", value: note });
  return attrs;
}

/**
 * The bag, as Shopify cart lines. The site prices every four loose one-off bags as a box, so
 * those go to Shopify as a four-bag box with the flavours listed on it: the same price, the same
 * bags, and Shopify's total matches the bag's. Everything else maps one to one.
 */
export function toCartLines(lines: Line[], catalog: Catalog): CartLineInput[] {
  const out: CartLineInput[] = [];
  const missing = (what: string) => new ShopifyError(`${what} isn't available to order right now.`);
  const plan = (plans: Partial<Record<number, string>>, every: number | undefined, what: string) => {
    if (!every) return {};
    const id = plans[every];
    if (!id) throw new ShopifyError(`Subscriptions for ${what} aren't open yet. Choose a one-off order for now.`);
    return { sellingPlanId: id };
  };

  // Loose bags, one entry per bag, in the order they were added.
  const loose = lines.flatMap((l) => (l.kind === "bag" && (l.size ?? 1) === 1 && !l.every ? Array<string>(l.qty).fill(l.id) : []));
  const boxed = loose.length - (loose.length % BOX_SIZE);
  for (let i = 0; i < boxed; i += BOX_SIZE) {
    const box = catalog.box[BOX_SIZE];
    if (!box) throw missing(`A box of ${BOX_SIZE}`);
    out.push({ merchandiseId: box.id, quantity: 1, attributes: boxAttributes(loose.slice(i, i + BOX_SIZE)) });
  }
  const rest = loose.slice(boxed).reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {});
  for (const [id, quantity] of Object.entries(rest)) {
    const v = catalog.flavours[id]?.single;
    if (!v) throw missing(byId(id).name);
    out.push({ merchandiseId: v.id, quantity });
  }

  for (const l of lines) {
    if (l.kind === "bag") {
      if ((l.size ?? 1) === 1 && !l.every) continue; // Already placed above.
      const f = catalog.flavours[l.id];
      const v = l.size === 3 ? f?.multi : f?.single;
      if (!v) throw missing(byId(l.id).name);
      out.push({ merchandiseId: v.id, quantity: l.qty, ...plan(f.plans, l.every, byId(l.id).name) });
    } else {
      const v = catalog.box[l.ids.length];
      if (!v) throw missing(`A box of ${l.ids.length}`);
      out.push({ merchandiseId: v.id, quantity: l.qty, attributes: boxAttributes(l.ids, l.note), ...plan(catalog.boxPlans, l.every, "boxes") });
    }
  }
  return out;
}

function quoteOf(cart: CartData, code?: string): Quote {
  const subtotal = cart.lines.nodes.reduce((n, l) => n + money(l.cost.subtotalAmount), 0);
  const discount = cart.lines.nodes.reduce((n, l) => n + l.discountAllocations.reduce((m, d) => m + money(d.discountedAmount), 0), 0);
  const hit = code ? cart.discountCodes.find((c) => c.code.toUpperCase() === code.toUpperCase()) : undefined;
  return {
    subtotal,
    discount,
    total: money(cart.cost.totalAmount),
    ...(code ? { code: { code: code.toUpperCase(), applicable: hit?.applicable ?? false } } : {}),
  };
}

export type SyncedCart = { id: string; checkoutUrl: string; quote: Quote };

/**
 * Makes the Shopify cart match the bag: the same cart is reused while it lives (so Shopify sees
 * one cart per shopper, not one per click), and a new one is made when it's gone or completed.
 */
export async function syncCart({ cartId, lines, catalog, code, note = "" }: {
  cartId?: string; lines: Line[]; catalog: Catalog; code?: string; note?: string;
}): Promise<SyncedCart> {
  const cartLines = toCartLines(lines, catalog);
  const codes = code ? [code.trim().toUpperCase()] : [];
  const attributes = [{ key: "Source", value: "makzos.com" }];

  type Existing = { lines: { nodes: { id: string }[] } } | null;
  const existing: Existing = cartId ? (await storefront<{ cart: Existing }>(LINE_IDS, { variables: { id: cartId }, buyer: true })).cart : null;

  let payload: Payload;
  if (existing && cartId) {
    const data = await storefront<Record<string, Payload>>(REPLACE, {
      variables: { cartId, remove: existing.lines.nodes.map((l) => l.id), lines: cartLines, codes, note, attributes },
      buyer: true,
    });
    for (const step of ["cartLinesRemove", "cartLinesAdd", "cartNoteUpdate", "cartAttributesUpdate"]) assertNoUserErrors("Cart", data[step]);
    payload = data.cartDiscountCodesUpdate;
  } else {
    const data = await storefront<{ cartCreate: Payload }>(CREATE, {
      variables: { country: shopify.country, input: { lines: cartLines, discountCodes: codes, note, attributes, buyerIdentity: { countryCode: shopify.country } } },
      buyer: true,
    });
    payload = data.cartCreate;
  }
  assertNoUserErrors("Cart", payload);
  if (!payload.cart) throw new ShopifyError("Shopify didn't return a cart.");
  return { id: payload.cart.id, checkoutUrl: payload.cart.checkoutUrl, quote: quoteOf(payload.cart, code) };
}

/**
 * Signs the cart in as the customer, so checkout opens logged in with their saved addresses.
 * Shopify asks for this just before checkout, with the freshest token.
 */
export async function attachCustomer(cartId: string, customerAccessToken: string) {
  const data = await storefront<{ cartBuyerIdentityUpdate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(BUYER, {
    variables: { cartId, buyerIdentity: { customerAccessToken, countryCode: shopify.country } },
    buyer: true,
  });
  assertNoUserErrors("Cart", data.cartBuyerIdentityUpdate);
  return data.cartBuyerIdentityUpdate.cart?.checkoutUrl;
}

/** A cart Shopify no longer returns has been checked out (or has expired). */
export async function cartGone(cartId: string) {
  const data = await storefront<{ cart: { id: string } | null }>(LINE_IDS, { variables: { id: cartId }, buyer: true });
  return !data.cart;
}
