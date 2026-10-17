import { BAG_PRICE, BOX_PRICE, BOX_SIZE, SUB_OFF, inr } from "@/lib/products";
import { COUPONS, FREE_FROM } from "@/lib/pricing";
import styles from "./PromoStrip.module.css";

/** Every line is read from the price and coupon lists, so the strip can't promise what checkout won't give. */
const OFFERS = [
  `Free delivery on orders over ${inr(FREE_FROM)}`,
  ...COUPONS.map((c) => `${c.label}: code ${c.code}`),
  `Any ${BOX_SIZE} bags for ${inr(BOX_PRICE)}, not ${inr(BOX_SIZE * BAG_PRICE)}`,
  `Subscribe and save ${SUB_OFF}%`,
  "Roasted, never fried",
];

/**
 * The offers band at the top of a flavour's page. It runs sideways without end: the list is
 * laid out twice and slides by exactly one copy. It stops while hovered, and stays still for
 * people who've asked for less motion. Screen readers get the list once, as a list.
 */
export function PromoStrip() {
  return (
    <aside className={styles.strip} aria-label="Offers">
      <div className={styles.track}>
        {[false, true].map((echo) => (
          <ul key={String(echo)} className={styles.run} aria-hidden={echo || undefined}>
            {/* Twice per copy, so one copy is always wider than the widest screen. */}
            {[...OFFERS, ...OFFERS].map((o, i) => <li key={i} aria-hidden={(!echo && i >= OFFERS.length) || undefined}>{o}</li>)}
          </ul>
        ))}
      </div>
    </aside>
  );
}
