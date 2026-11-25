#!/usr/bin/env node
/**
 * End-to-end check of the Storefront side against the real store, using .env.local:
 *   node --env-file=.env.local scripts/shopify/smoke.mjs
 *
 * 1. Reads the catalogue the site reads (products, variants, selling plans, metafields).
 * 2. Creates a cart with a single bag, a pack of 3 and a box of 5 (with its flavours as line properties).
 * 3. Applies FIRSTCRUNCH and prints Shopify's subtotal, discount and total.
 * 4. Prints the checkout host, so you can open the URL and finish a test order with Bogus Gateway.
 * Uses the same operations as src/lib/shopify (validated against Storefront API 2026-10).
 */
const { SHOPIFY_STORE_DOMAIN: domain, SHOPIFY_API_VERSION: version = "2026-10", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: priv, SHOPIFY_STOREFRONT_PUBLIC_TOKEN: pub } = process.env;
if (!domain || !(priv || pub)) {
  console.error("Set SHOPIFY_STORE_DOMAIN and a Storefront token in .env.local first (see docs/shopify-setup.md).");
  process.exit(1);
}

async function sf(query, variables) {
  const headers = { "Content-Type": "application/json", ...(priv ? { "Shopify-Storefront-Private-Token": priv } : { "X-Shopify-Storefront-Access-Token": pub }) };
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, { method: "POST", headers, body: JSON.stringify({ query, variables }) });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`${res.status} ${JSON.stringify(body.errors ?? body)}`);
  return body.data;
}

const ok = (label, cond, extra = "") => {
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`);
  if (!cond) process.exitCode = 1;
};

const { products } = await sf(`query Catalog($country: CountryCode) @inContext(country: $country) {
  products(first: 50, query: "vendor:Makzos") { nodes {
    id handle productType availableForSale
    flavourId: metafield(namespace: "makzos", key: "flavour_id") { value }
    variants(first: 10) { nodes { id title sku availableForSale price { amount } } }
    sellingPlanGroups(first: 5) { nodes { sellingPlans(first: 10) { nodes { id name } } } }
  } }
}`, { country: "IN" });

const flavours = products.nodes.filter((p) => p.flavourId?.value);
const box = products.nodes.find((p) => p.handle === "build-a-box");
ok("Catalogue: 7 flavours with makzos.flavour_id", flavours.length === 7, flavours.map((p) => p.handle).join(", "));
ok("Catalogue: Build a Box with 4–7 bag variants", box?.variants.nodes.length === 4);
ok("Catalogue: every variant purchasable", products.nodes.every((p) => p.variants.nodes.every((v) => v.availableForSale)));
const plans = products.nodes.flatMap((p) => p.sellingPlanGroups.nodes.flatMap((g) => g.sellingPlans.nodes));
console.log(`· Selling plans: ${plans.length ? plans.map((p) => p.name).join(", ") : "none yet (install Shopify Subscriptions)"}`);

const rasam = flavours.find((p) => p.handle === "rasam");
const single = rasam.variants.nodes.find((v) => v.sku?.endsWith("-1"));
const multi = rasam.variants.nodes.find((v) => v.sku?.endsWith("-3"));
const five = box.variants.nodes.find((v) => v.sku === "MKZ-BOX-5");
const names = ["Rasam", "Sweet Tamarind", "Rasam", "Chettinadu", "Curry Leaves"];

const { cartCreate } = await sf(`mutation CartCreate($input: CartInput!, $country: CountryCode) @inContext(country: $country) {
  cartCreate(input: $input) {
    cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount } totalAmount { amount } } discountCodes { code applicable }
      lines(first: 10) { nodes { quantity attributes { key value } discountAllocations(lineLevelOnly: false) { discountedAmount { amount } } } } }
    userErrors { field message code }
  }
}`, {
  country: "IN",
  input: {
    buyerIdentity: { countryCode: "IN" },
    discountCodes: ["FIRSTCRUNCH"],
    lines: [
      { merchandiseId: single.id, quantity: 2 },
      { merchandiseId: multi.id, quantity: 1 },
      { merchandiseId: five.id, quantity: 1, attributes: names.map((n, i) => ({ key: `Bag ${i + 1}`, value: n })) },
    ],
  },
});
ok("Cart created", cartCreate.userErrors.length === 0 && !!cartCreate.cart, JSON.stringify(cartCreate.userErrors));
const c = cartCreate.cart;
const discount = c.lines.nodes.reduce((n, l) => n + l.discountAllocations.reduce((m, d) => m + Number(d.discountedAmount.amount), 0), 0);
const sub = Number(c.cost.subtotalAmount.amount); // already before order-level codes
ok("Cart: 4 items", c.totalQuantity === 4);
ok("Cart: box flavours kept as line properties", c.lines.nodes.some((l) => l.attributes.length === 5));
ok("Cart: FIRSTCRUNCH applies", c.discountCodes.some((d) => d.code === "FIRSTCRUNCH" && d.applicable));
console.log(`· Bags ₹${sub}  −  code ₹${discount}  =  ₹${c.cost.totalAmount.amount} before delivery (expected bags: 2×149 + 419 + 669 = ₹1386)`);
ok("Cart: Shopify prices match the site", sub === 1386 && Math.abs(Number(c.cost.totalAmount.amount) - (1386 - discount)) < 0.01);
console.log(`· Checkout: ${new URL(c.checkoutUrl).host} — open the URL from a dev run to place a Bogus Gateway test order.`);
