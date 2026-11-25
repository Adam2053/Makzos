import "server-only";
import { FLAVOURS, type Every } from "../products";
import { money, weeksOf, type Catalog, type VariantRef } from "../commerce";
import { shopify, storefrontReady } from "./config";
import { CATALOG_TAG, storefront } from "./storefront";

const CATALOG = /* GraphQL */ `
  query Catalog($country: CountryCode) @inContext(country: $country) {
    products(first: 50, query: "vendor:Makzos") {
      nodes {
        id handle productType availableForSale
        flavourId: metafield(namespace: "makzos", key: "flavour_id") { value }
        variants(first: 10) { nodes { id title sku availableForSale price { amount } } }
        sellingPlanGroups(first: 5) { nodes { sellingPlans(first: 10) { nodes { id name options { value } priceAdjustments { adjustmentValue { ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage } } } } } } }
      }
    }
  }
`;

type Plan = { id: string; name: string; options: { value: string }[]; priceAdjustments: { adjustmentValue: { adjustmentPercentage?: number } }[] };
type Variant = { id: string; title: string; sku: string | null; availableForSale: boolean; price: { amount: string } };
type Product = {
  id: string; handle: string; productType: string; availableForSale: boolean;
  flavourId: { value: string } | null;
  variants: { nodes: Variant[] };
  sellingPlanGroups: { nodes: { sellingPlans: { nodes: Plan[] } }[] };
};

const ref = (v: Variant): VariantRef => ({ id: v.id, price: money(v.price), available: v.availableForSale });

/** Selling plans by delivery interval, read from the plan's name or options ("Every 4 weeks"). */
function plansOf(p: Product) {
  const plans: Partial<Record<Every, string>> = {};
  let off: number | undefined;
  for (const g of p.sellingPlanGroups.nodes) {
    for (const plan of g.sellingPlans.nodes) {
      const w = weeksOf([plan.name, ...plan.options.map((o) => o.value)].join(" "));
      if (w && !plans[w]) plans[w] = plan.id;
      off ??= plan.priceAdjustments[0]?.adjustmentValue.adjustmentPercentage;
    }
  }
  return { plans, off };
}

/**
 * The live catalogue: which Shopify variant each choice on the site buys, at what price, and
 * whether it's in stock. Products are matched to the site's flavours by the `makzos.flavour_id`
 * metafield (falling back to the handle), and variants by SKU (falling back to their title), so
 * renaming a product in admin doesn't break the site. Cached until a product webhook arrives.
 * Returns null when Shopify isn't configured or can't be reached: the site then shows its
 * placeholder prices and checkout says it's unavailable.
 */
export async function getCatalog(): Promise<Catalog | null> {
  if (!storefrontReady()) return null;
  let products: Product[];
  try {
    const data = await storefront<{ products: { nodes: Product[] } }>(CATALOG, { variables: { country: shopify.country }, tags: [CATALOG_TAG] });
    products = data.products.nodes;
  } catch (e) {
    console.warn("[shopify] catalogue unavailable, using placeholders:", (e as Error).message);
    return null;
  }

  const catalog: Catalog = { flavours: {}, box: {}, boxPlans: {} };
  for (const p of products) {
    const { plans, off } = plansOf(p);
    if (off != null) catalog.subOff ??= off;

    if (p.handle === "build-a-box" || p.productType === "Box") {
      for (const v of p.variants.nodes) {
        const n = Number(/BOX-(\d+)$/i.exec(v.sku ?? "")?.[1] ?? /(\d+)\s*bags?/i.exec(v.title)?.[1]);
        if (n) catalog.box[n] = ref(v);
      }
      catalog.boxPlans = plans;
      continue;
    }

    const flavour = FLAVOURS.find((f) => f.id === p.flavourId?.value) ?? FLAVOURS.find((f) => f.slug === p.handle);
    if (!flavour) continue;
    const multi = p.variants.nodes.find((v) => /-3$/.test(v.sku ?? "") || /pack of 3|3 ?x|three/i.test(v.title));
    const single = p.variants.nodes.find((v) => v !== multi && (/-1$/.test(v.sku ?? "") || /single|55 ?g|default/i.test(v.title))) ?? p.variants.nodes.find((v) => v !== multi);
    catalog.flavours[flavour.id] = {
      handle: p.handle,
      available: p.availableForSale,
      ...(single ? { single: ref(single) } : {}),
      ...(multi ? { multi: ref(multi) } : {}),
      plans,
    };
  }
  return catalog;
}
