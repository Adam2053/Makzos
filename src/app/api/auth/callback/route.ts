import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { finishLogin } from "@/lib/shopify/customer";

/** Shopify sends the shopper back here with a code; it becomes a session cookie, then on to where they were going. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) redirect(`/login?error=${params.get("error") === "access_denied" ? "cancelled" : "failed"}`);

  let to: string;
  try {
    to = (await finishLogin(request.nextUrl.origin, code, state)).returnTo;
  } catch (e) {
    console.error("[shopify] callback", e);
    redirect("/login?error=failed");
  }
  redirect(to);
}
