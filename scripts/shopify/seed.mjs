#!/usr/bin/env node
/**
 * Seeds a Shopify store with the Makzos catalogue, collection, codes and delivery rates.
 * Safe to re-run: products upsert by handle, and anything that already exists is skipped.
 *
 *   shopify store auth --store <store>.myshopify.com \
 *     --scopes write_products,write_publications,write_discounts,write_shipping,read_locations,read_inventory,read_markets_home,read_orders
 *   node scripts/shopify/seed.mjs --store <store>.myshopify.com [--only defs,products,collection,publish,discounts,shipping]
 *
 * Product copy comes straight from src/lib/products.ts (Node strips its types on import).
 * Prices are the placeholders from that file: change them in Shopify admin once approved.
 * Every operation here was validated against Admin API 2026-10 with the Shopify dev MCP.
 */
import { execFileSync } from "node:child_process";
import { FLAVOURS, BAG_PRICE, MULTI_PRICE, MULTI_SIZE, WEIGHT, boxPrice, BOX_SIZE, BOX_MAX } from "../../src/lib/products.ts";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const STORE = flag("store") ?? process.env.SHOPIFY_STORE_DOMAIN;
const VERSION = flag("version") ?? "2026-10";
const ONLY = flag("only")?.split(",");
if (!STORE) throw new Error("Pass --store <store>.myshopify.com");
const step = (name) => !ONLY || ONLY.includes(name);

const NS = "makzos";

/** Runs one Admin GraphQL operation through `shopify store execute` and returns its data. */
function gql(query, variables, { mutation = false } = {}) {
  const cliArgs = ["store", "execute", "--store", STORE, "--version", VERSION, "--json", "--query", query];
  if (variables) cliArgs.push("--variables", JSON.stringify(variables));
  if (mutation) cliArgs.push("--allow-mutations");
  let out;
  try {
    out = execFileSync("shopify", cliArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 20 * 1024 * 1024 });
  } catch (e) {
    throw new Error(`shopify store execute failed:\n${e.stdout ?? ""}\n${e.stderr ?? ""}`);
  }
  // The CLI may print progress events as JSON lines before the result: take the last object.
  const lines = out.trim().split("\n").filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    let parsed;
    try {
      parsed = JSON.parse(lines.slice(i).join("\n"));
    } catch {
      continue;
    }
    if (parsed?.error) throw new Error(`Shopify error: ${JSON.stringify(parsed.error)}`);
    if (parsed?.errors) throw new Error(`GraphQL errors: ${JSON.stringify(parsed.errors)}`);
    return parsed?.data ?? parsed;
  }
  throw new Error(`Could not parse CLI output:\n${out}`);
}

function check(label, payload) {
  const errors = payload?.userErrors ?? [];
  if (errors.length) {
    console.error(`  ✗ ${label}: ${errors.map((e) => `${e.field?.join(".") ?? ""} ${e.message}`).join("; ")}`);
    return false;
  }
  console.log(`  ✓ ${label}`);
  return true;
}

// ── Lookup ──────────────────────────────────────────────────────────────────
const handles = [...FLAVOURS.map((f) => f.slug), "build-a-box"];
const LOOKUP = `query Lookup($handles: String!) {
  shop { name currencyCode }
  publications(first: 20) { nodes { id catalog { title } } }
  locations(first: 5) { nodes { id name } }
  deliveryProfiles(first: 5) { nodes { id name default profileLocationGroups { locationGroup { id } locationGroupZones(first: 20) { nodes { zone { id name countries { code { countryCode } } } methodDefinitions(first: 10) { nodes { id name } } } } } } }
  collectionByIdentifier(identifier: { handle: "all-flavours" }) { id }
  products(first: 20, query: $handles) { nodes { id handle } }
  a: codeDiscountNodeByCode(code: "FIRSTCRUNCH") { id }
  b: codeDiscountNodeByCode(code: "BOXOFF50") { id }
}`;
const lookup = () => gql(LOOKUP, { handles: handles.map((h) => `handle:${h}`).join(" OR ") });

let state = lookup();
console.log(`Store: ${state.shop.name} (${STORE}), currency ${state.shop.currencyCode}`);
if (state.shop.currencyCode !== "INR") console.warn("  ! Store currency is not INR: set it in Settings → Store details before launch.");

// ── 1. Metafield definitions ────────────────────────────────────────────────
const DEFS = [
  { key: "flavour_id", name: "Flavour ID", type: "single_line_text_field", description: "The site's internal flavour id (src/lib/products.ts)." },
  { key: "kind", name: "Kind", type: "single_line_text_field", description: "flavour or box." },
  { key: "line", name: "Pack tagline", type: "single_line_text_field" },
  { key: "inspired", name: "Inspired by", type: "single_line_text_field" },
  { key: "taste", name: "Taste", type: "list.single_line_text_field", description: "savoury, spicy, sweet, tangy: drives the shop filters." },
  { key: "heat", name: "Heat (0–3)", type: "number_integer" },
  { key: "notes", name: "Tasting notes", type: "list.single_line_text_field" },
  { key: "story", name: "Flavour story", type: "multi_line_text_field" },
  { key: "field_colour", name: "Field colour", type: "color" },
  { key: "ink_colour", name: "Ink colour", type: "color" },
];
const DEFINE = `mutation DefineMetafield($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id namespace key }
    userErrors { field message code }
  }
}`;
if (step("defs")) {
  console.log("Metafield definitions");
  for (const d of DEFS) {
    const r = gql(DEFINE, { definition: { ...d, namespace: NS, ownerType: "PRODUCT", access: { storefront: "PUBLIC_READ" } } }, { mutation: true }).metafieldDefinitionCreate;
    const taken = r.userErrors.some((e) => e.code === "TAKEN");
    if (taken) console.log(`  · ${NS}.${d.key} exists`);
    else check(`${NS}.${d.key}`, r);
  }
}

// ── 2. Products ─────────────────────────────────────────────────────────────
const PRODUCT_SET = `mutation SeedProduct($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
  productSet(synchronous: true, identifier: $identifier, input: $input) {
    product { id handle variants(first: 10) { nodes { id title price } } }
    userErrors { field message code }
  }
}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const mf = (key, type, value) => ({ namespace: NS, key, type, value: typeof value === "string" ? value : JSON.stringify(value) });
const variant = (option, name, price, sku) => ({
  optionValues: [{ optionName: option, name }],
  price: String(price),
  sku,
  taxable: true,
  // Stock isn't tracked on the dev store. Turn tracking on per variant once real stock counts exist.
  inventoryItem: { tracked: false, requiresShipping: true },
  inventoryPolicy: "CONTINUE",
});

const SINGLE = `Single (${WEIGHT})`;
const MULTI = `Pack of ${MULTI_SIZE}`;
const productInputs = [
  ...FLAVOURS.map((f) => ({
    handle: f.slug,
    title: f.name,
    vendor: "Makzos",
    productType: "Makhana",
    status: "ACTIVE",
    tags: [...f.taste, `heat-${f.heat}`],
    descriptionHtml: `<p>${esc(f.story)}</p>`,
    productOptions: [{ name: "Pack", values: [{ name: SINGLE }, { name: MULTI }] }],
    variants: [variant("Pack", SINGLE, BAG_PRICE, `MKZ-${f.id}-1`), variant("Pack", MULTI, MULTI_PRICE, `MKZ-${f.id}-${MULTI_SIZE}`)],
    metafields: [
      mf("flavour_id", "single_line_text_field", f.id),
      mf("kind", "single_line_text_field", "flavour"),
      mf("line", "single_line_text_field", f.line),
      mf("inspired", "single_line_text_field", f.inspired),
      mf("taste", "list.single_line_text_field", f.taste),
      mf("heat", "number_integer", String(f.heat)),
      mf("notes", "list.single_line_text_field", f.notes),
      mf("story", "multi_line_text_field", f.story),
      mf("field_colour", "color", f.field.toLowerCase()),
      mf("ink_colour", "color", f.ink.toLowerCase()),
    ],
  })),
  (() => {
    const sizes = Array.from({ length: BOX_MAX - BOX_SIZE + 1 }, (_, i) => BOX_SIZE + i);
    const name = (n) => `${n} bags`;
    return {
      handle: "build-a-box",
      title: "Build a Box",
      vendor: "Makzos",
      productType: "Box",
      status: "ACTIVE",
      tags: ["box"],
      descriptionHtml: `<p>Any mix of flavours, ${BOX_SIZE} to ${BOX_MAX} bags. The flavours you pick travel with the order as line properties.</p>`,
      productOptions: [{ name: "Size", values: sizes.map((n) => ({ name: name(n) })) }],
      variants: sizes.map((n) => variant("Size", name(n), boxPrice(n), `MKZ-BOX-${n}`)),
      metafields: [mf("kind", "single_line_text_field", "box")],
    };
  })(),
];

if (step("products")) {
  console.log("Products");
  for (const input of productInputs) {
    const r = gql(PRODUCT_SET, { identifier: { handle: input.handle }, input }, { mutation: true }).productSet;
    if (check(`${input.handle} (${input.variants.length} variants)`, r)) {
      for (const v of r.product.variants.nodes) console.log(`      ${v.title.padEnd(16)} ₹${v.price}  ${v.id}`);
    }
  }
  state = lookup();
}

// ── 3. Collection ───────────────────────────────────────────────────────────
const COLLECTION = `mutation SeedCollection($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id handle }
    userErrors { field message }
  }
}`;
if (step("collection")) {
  console.log("Collection");
  if (state.collectionByIdentifier) console.log("  · all-flavours exists");
  else {
    // A smart collection: every product of type Makhana joins it automatically, so new flavours
    // added in admin show up on the shop without touching this script.
    const r = gql(COLLECTION, {
      input: {
        title: "All flavours",
        handle: "all-flavours",
        descriptionHtml: "<p>Every Makzos flavour.</p>",
        ruleSet: { appliedDisjunctively: false, rules: [{ column: "TYPE", relation: "EQUALS", condition: "Makhana" }] },
      },
    }, { mutation: true }).collectionCreate;
    check("all-flavours (smart: type = Makhana)", r);
  }
  state = lookup();
}

// ── 4. Publish to every sales channel (re-run after installing Headless) ────
const PUBLISH = `mutation Publish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    userErrors { field message }
  }
}`;
if (step("publish")) {
  console.log(`Publishing to ${state.publications.nodes.map((p) => p.catalog?.title ?? p.id).join(", ") || "(no channels)"}`);
  const input = state.publications.nodes.map((p) => ({ publicationId: p.id }));
  const ids = [...state.products.nodes.map((p) => [p.handle, p.id]), ...(state.collectionByIdentifier ? [["all-flavours", state.collectionByIdentifier.id]] : [])];
  if (input.length) for (const [label, id] of ids) check(label, gql(PUBLISH, { id, input }, { mutation: true }).publishablePublish);
}

// ── 5. Discount codes (mirrors COUPONS in src/lib/pricing.ts) ───────────────
const DISCOUNT = `mutation Discount($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode { id }
    userErrors { field message code }
  }
}`;
if (step("discounts")) {
  console.log("Discount codes");
  const startsAt = new Date().toISOString();
  const codes = [
    {
      exists: state.a,
      input: {
        title: "FIRSTCRUNCH: 10% off your first order",
        code: "FIRSTCRUNCH",
        startsAt,
        context: { all: "ALL" },
        appliesOncePerCustomer: true,
        customerGets: { value: { percentage: 0.1 }, items: { all: true } },
      },
    },
    {
      exists: state.b,
      input: {
        title: "BOXOFF50: ₹50 off orders over ₹400",
        code: "BOXOFF50",
        startsAt,
        context: { all: "ALL" },
        minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: "400" } },
        customerGets: { value: { discountAmount: { amount: "50", appliesOnEachItem: false } }, items: { all: true } },
      },
    },
  ];
  for (const c of codes) {
    if (c.exists) console.log(`  · ${c.input.code} exists`);
    else check(c.input.code, gql(DISCOUNT, { basicCodeDiscount: c.input }, { mutation: true }).discountCodeBasicCreate);
  }
}

// ── 6. Delivery rates for India (mirrors DELIVERY + FREE_FROM in pricing.ts) ─
const SHIPPING = `mutation Shipping($id: ID!, $profile: DeliveryProfileInput!) {
  deliveryProfileUpdate(id: $id, profile: $profile) {
    profile { id }
    userErrors { field message }
  }
}`;
if (step("shipping")) {
  console.log("Delivery rates");
  const profile = state.deliveryProfiles.nodes.find((p) => p.default);
  const group = profile?.profileLocationGroups[0];
  if (!profile || !group) console.error("  ✗ No default delivery profile or location group found");
  else {
    const zones = group.locationGroupZones.nodes;
    const ours = zones.find((z) => z.zone.name === "India" && z.methodDefinitions.nodes.some((m) => m.name === "Express"));
    if (ours) console.log("  · India zone with Makzos rates exists");
    else {
      // Replace any zone that already ships to India (dev stores come with a default one).
      const replace = zones.filter((z) => z.zone.countries.some((c) => c.code.countryCode === "IN")).map((z) => z.zone.id);
      const inr = (amount) => ({ amount: String(amount), currencyCode: "INR" });
      const r = gql(SHIPPING, {
        id: profile.id,
        profile: {
          ...(replace.length ? { zonesToDelete: replace } : {}),
          locationGroupsToUpdate: [{
            id: group.locationGroup.id,
            zonesToCreate: [{
              name: "India",
              countries: [{ code: "IN", includeAllProvinces: true }],
              methodDefinitionsToCreate: [
                { name: "Standard", description: "2 to 4 days", active: true, rateDefinition: { price: inr(40) },
                  priceConditionsToCreate: [{ operator: "LESS_THAN_OR_EQUAL_TO", criteria: inr("498.99") }] },
                { name: "Standard (free)", description: "2 to 4 days", active: true, rateDefinition: { price: inr(0) },
                  priceConditionsToCreate: [{ operator: "GREATER_THAN_OR_EQUAL_TO", criteria: inr(499) }] },
                { name: "Express", description: "Next day in Hyderabad", active: true, rateDefinition: { price: inr(90) } },
              ],
            }],
          }],
        },
      }, { mutation: true }).deliveryProfileUpdate;
      check(`India: Standard ₹40 (free from ₹499), Express ₹90${replace.length ? ` (replaced ${replace.length} zone)` : ""}`, r);
    }
  }
}

console.log("Done.");
