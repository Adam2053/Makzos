"use client";

import type { ReactNode } from "react";
import type { Catalog } from "@/lib/commerce";
import { CatalogProvider } from "@/lib/catalog";
import { CartProvider } from "@/lib/cart";
import { StoreProvider } from "@/lib/store";

/**
 * The catalogue, the bag and the account live above every page, so none of them resets between
 * the shop and checkout. The catalogue comes first: it sets the live prices everything below reads.
 */
export function Providers({ catalog, children }: { catalog: Catalog | null; children: ReactNode }) {
  return (
    <CatalogProvider catalog={catalog}>
      <StoreProvider>
        <CartProvider>{children}</CartProvider>
      </StoreProvider>
    </CatalogProvider>
  );
}
