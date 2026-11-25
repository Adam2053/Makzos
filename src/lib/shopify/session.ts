import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ShopifyError, shopify } from "./config";

/**
 * Small encrypted cookies (AES-256-GCM, keyed from SESSION_SECRET): the customer's tokens never
 * reach the browser's JavaScript, and a tampered cookie fails to open instead of being trusted.
 */
function key() {
  if (!shopify.sessionSecret || shopify.sessionSecret.length < 32) throw new ShopifyError("SESSION_SECRET must be set to 32+ characters.");
  return createHash("sha256").update(shopify.sessionSecret).digest();
}

export function seal(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function unseal<T>(sealed: string | undefined): T | null {
  if (!sealed) return null;
  try {
    const raw = Buffer.from(sealed, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8")) as T;
  } catch {
    return null;
  }
}

const secure = process.env.NODE_ENV === "production";

export const COOKIES = {
  /** The signed-in customer's tokens. */
  session: "mz_session",
  /** PKCE verifier, state and nonce, for the few minutes a sign-in takes. */
  pkce: "mz_pkce",
  /** The shopper's Shopify cart id. */
  cart: "mz_cart",
} as const;

export async function readSealed<T>(name: string) {
  return unseal<T>((await cookies()).get(name)?.value);
}

/** Only callable from a Server Action or Route Handler: Next.js can't set cookies while rendering. */
export async function writeSealed(name: string, value: unknown, maxAge: number) {
  (await cookies()).set(name, seal(value), { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge });
}

export async function writePlain(name: string, value: string, maxAge: number) {
  (await cookies()).set(name, value, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge });
}

export async function readPlain(name: string) {
  return (await cookies()).get(name)?.value;
}

export async function clear(name: string) {
  (await cookies()).delete(name);
}
