import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { logout } from "@/lib/shopify/customer";

/** Signs out here and at Shopify, so the next checkout isn't still signed in. POST, so a link can't sign anyone out. */
export async function POST(request: NextRequest) {
  redirect(await logout(request.nextUrl.origin));
}
