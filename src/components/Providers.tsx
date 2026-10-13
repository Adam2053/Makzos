"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { StoreProvider } from "@/lib/store";

/** The bag and the account live above every page, so neither resets between the shop and checkout. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <CartProvider>{children}</CartProvider>
    </StoreProvider>
  );
}
