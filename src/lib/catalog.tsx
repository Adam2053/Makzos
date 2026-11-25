"use client";

import { createContext, useContext, type ReactNode } from "react";
import { applyCatalog } from "./products";
import type { Catalog } from "./commerce";

const CatalogContext = createContext<Catalog | null>(null);

/**
 * Hands Shopify's catalogue (read once on the server, in the root layout) to the browser. The
 * prices are applied during render, before any child reads them, so the first paint already
 * shows the Shopify price: no flash of placeholder prices.
 */
export function CatalogProvider({ catalog, children }: { catalog: Catalog | null; children: ReactNode }) {
  // Idempotent: the same catalogue always sets the same prices, so running it on every render is safe.
  applyCatalog(catalog);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

/** The live catalogue, or null when Shopify isn't connected (the site then runs on placeholders). */
export const useCatalog = () => useContext(CatalogContext);

/** Whether a flavour can be bought right now. Unknown means yes: placeholders never block a sale. */
export function useAvailable() {
  const c = useCatalog();
  return (id: string, size: 1 | 3 = 1) => {
    const f = c?.flavours[id];
    if (!c || !f) return true;
    const v = size === 3 ? f.multi : f.single;
    return Boolean(v?.available);
  };
}
