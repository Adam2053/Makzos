import { NextResponse } from "next/server";
import { getUser } from "@/lib/shopify/account";

/**
 * Who's signed in, for the header and other client components. Asked from the browser after the
 * page loads, so every page can stay static instead of reading the session while rendering.
 * Refreshes an expiring token on the way (route handlers may write cookies).
 */
export async function GET() {
  try {
    return NextResponse.json({ user: await getUser() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error("[shopify] me", e);
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
