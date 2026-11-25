/**
 * The shapes Shopify data takes on its way into the site, shared by the server code that reads
 * Shopify (lib/shopify) and the client code that shows it. Plain types and pure helpers only:
 * safe to import from either side.
 */
import type { Every } from "./products";

export type VariantRef = { id: string; price: number; available: boolean };

/** What the site needs from Shopify's catalogue: the variant to buy for each choice, its price and stock. */
export type Catalog = {
  flavours: Record<string, { handle: string; available: boolean; single?: VariantRef; multi?: VariantRef; plans: Partial<Record<Every, string>> }>;
  /** Build a Box variants by bag count. */
  box: Record<number, VariantRef>;
  boxPlans: Partial<Record<Every, string>>;
  /** The subscribe-and-save discount the selling plans give, in percent, when Shopify has one. */
  subOff?: number;
};

/** Shopify's numbers for the bag as it stands: what checkout will charge before delivery. */
export type Quote = {
  subtotal: number;
  discount: number;
  total: number;
  /** The code on the bag and whether Shopify accepted it for these lines. */
  code?: { code: string; applicable: boolean };
};

/** Prices from Shopify arrive as decimal strings. */
export const money = (m: { amount: string } | null | undefined) => (m ? Math.round(Number(m.amount) * 100) / 100 : 0);

/** "Every 2 weeks", "2 Week(s)", "Deliver every 4 weeks, 10% off" all mean 2 or 4. */
export function weeksOf(text: string): Every | undefined {
  const n = Number(/(\d+)\s*-?\s*week/i.exec(text)?.[1]);
  return n === 2 || n === 4 || n === 6 ? n : undefined;
}
