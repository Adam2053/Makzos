#!/usr/bin/env node
/**
 * Gives every Makzos product in Shopify its photos, built from the site's own artwork:
 *   - each flavour: the pack, three packs (shown on the "Pack of 3" variant) and the dish photo
 *   - Build a Box: four flavours fanned, then the whole range
 * Images are square 1600 px JPEGs on the flavour's own colour, so they read well in Shopify
 * admin, checkout, order emails and the order-status page.
 *
 *   shopify store auth --store <store>.myshopify.com --scopes write_products,write_files
 *   node scripts/shopify/images.mjs --store <store>.myshopify.com [--replace]
 *
 * Safe to re-run: products that already have photos are skipped unless --replace is passed.
 * Every operation here was validated against Admin API 2026-10 with the Shopify dev MCP.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { FLAVOURS } from "../../src/lib/products.ts";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const STORE = flag("store") ?? process.env.SHOPIFY_STORE_DOMAIN;
const VERSION = flag("version") ?? "2026-10";
const REPLACE = args.includes("--replace");
if (!STORE) throw new Error("Pass --store <store>.myshopify.com");

const BRAND = new URL("../../public/brand/", import.meta.url).pathname;
const OUT = mkdtempSync(join(tmpdir(), "makzos-images-"));
const S = 1600;
const CREAM = "#F6EFE6";

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

const errors = (label, list) => {
  if (list?.length) throw new Error(`${label}: ${list.map((e) => e.message).join("; ")}`);
};

// ── Images ──────────────────────────────────────────────────────────────────
const pack = (flavour, h, angle = 0) =>
  sharp(join(BRAND, flavour.pack.replace(/^\/brand\//, "")))
    .resize({ height: h })
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });

async function compose(bg, items, file) {
  const layers = items.map(({ img, cx, cy }) => ({ input: img.data, left: Math.round(cx - img.info.width / 2), top: Math.round(cy - img.info.height / 2) }));
  const path = join(OUT, file);
  await sharp({ create: { width: S, height: S, channels: 4, background: bg } }).composite(layers).jpeg({ quality: 88 }).toFile(path);
  return path;
}

const fan = (flavours, h, spread, step) =>
  Promise.all(
    flavours.map(async (f, i) => {
      const k = i - (flavours.length - 1) / 2;
      return { img: await pack(f, h, k * step), cx: S / 2 + k * spread, cy: S / 2 + Math.abs(k) * 30 };
    }),
  );

/** handle → [{ path, alt, variant? }] where `variant` is the SKU suffix the image belongs to. */
async function buildImages() {
  const plan = {};
  for (const f of FLAVOURS) {
    const one = await compose(f.field, [{ img: await pack(f, 1250), cx: S / 2, cy: S / 2 }], `${f.slug}-pack.jpg`);
    const three = await compose(
      f.field,
      [
        { img: await pack(f, 1050, -12), cx: S / 2 - 380, cy: S / 2 + 40 },
        { img: await pack(f, 1050, 12), cx: S / 2 + 380, cy: S / 2 + 40 },
        { img: await pack(f, 1150), cx: S / 2, cy: S / 2 },
      ],
      `${f.slug}-pack-of-3.jpg`,
    );
    const dish = join(OUT, `${f.slug}-dish.jpg`);
    await sharp(join(BRAND, f.dish.src.replace(/^\/brand\//, ""))).resize(S, S, { fit: "cover", position: "attention" }).jpeg({ quality: 86 }).toFile(dish);
    plan[f.slug] = [
      { path: one, alt: `${f.name} roasted makhana, 55 g pack`, variant: "-1" },
      { path: three, alt: `${f.name} roasted makhana, pack of 3`, variant: "-3" },
      { path: dish, alt: `${f.name}: the dish behind the flavour` },
    ];
  }
  const pick = (ids) => ids.map((id) => FLAVOURS.find((f) => f.id === id)).filter(Boolean);
  plan["build-a-box"] = [
    { path: await compose(CREAM, await fan(pick(["rasam", "tiramisu", "curry-leaves", "thai-chilli"]), 1000, 300, 9), "box-four.jpg"), alt: "Build a Box: any mix of Makzo's flavours" },
    { path: await compose(CREAM, await fan(FLAVOURS, 820, 190, 6), "box-all.jpg"), alt: "The full Makzo's range" },
  ];
  return plan;
}

// ── Upload ──────────────────────────────────────────────────────────────────
const STAGED = `mutation Staged($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets { url resourceUrl parameters { name value } }
    userErrors { field message }
  }
}`;
const LOOKUP = `query Images($query: String!) {
  products(first: 20, query: $query) { nodes { id handle variants(first: 10) { nodes { id sku } } media(first: 20) { nodes { id alt mediaContentType status } } } }
}`;
const ADD_MEDIA = `mutation AddMedia($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
  productUpdate(product: $product, media: $media) {
    product { id media(first: 20) { nodes { id alt status } } }
    userErrors { field message }
  }
}`;
const DELETE_MEDIA = `mutation DeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
  productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { deletedMediaIds mediaUserErrors { field message } }
}`;
const VARIANT_IMAGES = `mutation VariantImages($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    productVariants { id media(first: 1) { nodes { id } } }
    userErrors { field message }
  }
}`;

async function stage(images) {
  const input = images.map(({ path }) => ({ filename: path.split("/").pop(), mimeType: "image/jpeg", httpMethod: "POST", resource: "IMAGE", fileSize: String(statSync(path).size) }));
  const { stagedUploadsCreate: r } = gql(STAGED, { input }, { mutation: true });
  errors("stagedUploadsCreate", r.userErrors);
  await Promise.all(
    r.stagedTargets.map(async (t, i) => {
      const form = new FormData();
      for (const p of t.parameters) form.append(p.name, p.value);
      form.append("file", new Blob([readFileSync(images[i].path)], { type: "image/jpeg" }), input[i].filename);
      const res = await fetch(t.url, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload of ${input[i].filename} failed: ${res.status} ${await res.text()}`);
    }),
  );
  return r.stagedTargets.map((t) => t.resourceUrl);
}

const plan = await buildImages();
const handles = Object.keys(plan);
const { products } = gql(LOOKUP, { query: handles.map((h) => `handle:${h}`).join(" OR ") });

for (const handle of handles) {
  const product = products.nodes.find((p) => p.handle === handle);
  if (!product) {
    console.log(`  · ${handle}: not in the store, run seed.mjs first`);
    continue;
  }
  const existing = product.media.nodes;
  if (existing.length && !REPLACE) {
    console.log(`  · ${handle}: already has ${existing.length} photo(s), skipped (pass --replace to redo)`);
    continue;
  }
  if (existing.length) {
    const { productDeleteMedia: d } = gql(DELETE_MEDIA, { productId: product.id, mediaIds: existing.map((m) => m.id) }, { mutation: true });
    errors("productDeleteMedia", d.mediaUserErrors);
  }

  const images = plan[handle];
  const urls = await stage(images);
  const { productUpdate: u } = gql(
    ADD_MEDIA,
    { product: { id: product.id }, media: images.map((img, i) => ({ originalSource: urls[i], alt: img.alt, mediaContentType: "IMAGE" })) },
    { mutation: true },
  );
  errors("productUpdate", u.userErrors);
  const media = u.product.media.nodes;

  // Each variant shows its own photo (Single → the pack, Pack of 3 → three packs).
  const variants = images
    .map((img, i) => (img.variant ? { variant: product.variants.nodes.find((v) => v.sku?.endsWith(img.variant)), media: media.find((m) => m.alt === img.alt) ?? media[i] } : null))
    .filter((x) => x?.variant && x.media)
    .map((x) => ({ id: x.variant.id, mediaId: x.media.id }));
  if (variants.length) {
    // Media must finish processing before a variant can point at it.
    for (let tries = 0; tries < 20; tries++) {
      const now = gql(LOOKUP, { query: `handle:${handle}` }).products.nodes[0].media.nodes;
      if (now.every((m) => m.status === "READY")) break;
      if (now.some((m) => m.status === "FAILED")) throw new Error(`${handle}: Shopify could not process a photo`);
      await new Promise((r) => setTimeout(r, 1500));
    }
    const { productVariantsBulkUpdate: v } = gql(VARIANT_IMAGES, { productId: product.id, variants }, { mutation: true });
    errors("productVariantsBulkUpdate", v.userErrors);
  }
  console.log(`  ✓ ${handle}: ${images.length} photos${variants.length ? `, ${variants.length} variant images` : ""}`);
}
