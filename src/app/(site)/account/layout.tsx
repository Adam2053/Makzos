import type { Metadata } from "next";
import { connection } from "next/server";
import { getAccount } from "@/lib/shopify/account";
import { AccountShell } from "./AccountShell";

export const metadata: Metadata = { title: "Your account — Makzo's" };

/** Reads the signed-in customer's account from Shopify on every visit: orders and tracking change underneath us. */
export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Always per request: whose account this is comes from the session cookie.
  await connection();
  const data = await getAccount().catch((e) => {
    console.error("[shopify] account", e);
    return null;
  });
  return <AccountShell data={data}>{children}</AccountShell>;
}
