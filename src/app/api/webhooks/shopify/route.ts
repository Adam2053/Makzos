import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@/lib/shopify/admin";
import { CATALOG_TAG } from "@/lib/shopify/storefront";

/**
 * Product, collection and inventory webhooks land here. A verified one expires the cached
 * catalogue at once, so a price or stock change in Shopify admin shows on the site within seconds.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!verifyWebhook(body, request.headers.get("x-shopify-hmac-sha256"))) return new NextResponse("Unauthorized", { status: 401 });

  const topic = request.headers.get("x-shopify-topic") ?? "";
  if (/^(products|collections|inventory_levels|inventory_items|selling_plan_groups)\//.test(topic)) revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
