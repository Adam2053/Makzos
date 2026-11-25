import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { beginLogin } from "@/lib/shopify/customer";

/** Sends the shopper to Shopify's sign-in (a six-digit code by email). `?next=/path` brings them back there. */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const returnTo = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";
  let url: string;
  try {
    url = await beginLogin(request.nextUrl.origin, returnTo);
  } catch (e) {
    console.error("[shopify] login", e);
    redirect(`/login?error=unavailable&next=${encodeURIComponent(returnTo)}`);
  }
  redirect(url);
}
