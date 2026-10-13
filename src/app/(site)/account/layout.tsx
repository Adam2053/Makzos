import type { Metadata } from "next";
import { AccountShell } from "./AccountShell";

export const metadata: Metadata = { title: "Your account — Makzo's" };

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AccountShell>{children}</AccountShell>;
}
