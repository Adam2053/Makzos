import type { Metadata } from "next";
import { LoginView } from "./LoginView";

export const metadata: Metadata = { title: "Sign in — Makzo's" };

/** `?next=/somewhere` sends people back where they were once they're in. */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const to = typeof next === "string" && next.startsWith("/") ? next : "/account";
  return <LoginView next={to} />;
}
