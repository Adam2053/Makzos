"use client";

import Link from "next/link";
import { useState } from "react";
import { inr } from "@/lib/products";
import { PackThumb } from "./Pack";
import { describeLine, linePrice, useCart, type Line } from "@/lib/cart";
import { DELIVERY, FREE_FROM, type DeliveryId, type Totals } from "@/lib/pricing";
import forms from "./forms.module.css";
import ui from "@/components/home/ui.module.css";
import styles from "./Summary.module.css";

/** The bag's lines. Editable on the bag page; read-only in checkout and on orders. */
export function LineList({ lines, editable = false, compact = false }: { lines: Line[]; editable?: boolean; compact?: boolean }) {
  const { setQty } = useCart();
  return (
    <ul className={styles.lines} data-compact={compact || undefined}>
      {lines.map((l) => {
        const d = describeLine(l);
        return (
          <li key={l.key} className={styles.line}>
            <span className={styles.thumb}>
              <PackThumb id={d.packId} size={compact ? 38 : 50} />
              {!editable && <span className={styles.qtyBadge}>{l.qty}</span>}
            </span>
            <span className={styles.what}>
              {editable ? <Link href={d.href}><strong>{d.title}</strong></Link> : <strong>{d.title}</strong>}
              <span>{d.detail}</span>
              {editable && (
                <span className={styles.qty} role="group" aria-label={`Quantity of ${d.title}`}>
                  <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label={l.qty === 1 ? `Remove ${d.title}` : "One fewer"}>−</button>
                  <output aria-live="polite">{l.qty}</output>
                  <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="One more">+</button>
                </span>
              )}
            </span>
            <span className={styles.right}>
              <span className={styles.price}>{inr(linePrice(l))}</span>
              {editable && <button type="button" className={styles.remove} onClick={() => setQty(l.key, 0)}>Remove</button>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** The money, line by line. `delivery` undefined means it isn't known yet. */
export function TotalsTable({ saving, totals, coupon, method, estimate = false }: {
  saving: number; totals: Totals; coupon?: string | null; method?: DeliveryId; estimate?: boolean;
}) {
  return (
    <dl className={styles.totals}>
      <div><dt>Bags</dt><dd>{inr(totals.subtotal + saving)}</dd></div>
      {saving > 0 && <div className={styles.good}><dt>Every 4 bags at the box price</dt><dd>−{inr(saving)}</dd></div>}
      {totals.discount > 0 && <div className={styles.good}><dt>Code {coupon}</dt><dd>−{inr(totals.discount)}</dd></div>}
      <div>
        <dt>Delivery{method ? `, ${DELIVERY[method].label.toLowerCase()}` : ""}</dt>
        <dd>{estimate ? (totals.subtotal - totals.discount >= FREE_FROM ? "Free" : "From " + inr(DELIVERY.standard.fee)) : totals.delivery === 0 ? "Free" : inr(totals.delivery)}</dd>
      </div>
      <div className={styles.total}><dt>{estimate ? "Estimated total" : "Total"}</dt><dd>{inr(totals.total)}</dd></div>
    </dl>
  );
}

/** A code field: apply, see why it didn't work, or take it off again. Open by default: no hunting. */
export function CouponField() {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (coupon) {
    return (
      <div className={styles.applied}>
        <span><strong>{coupon.code}</strong> {coupon.label}</span>
        <button type="button" className={ui.link} onClick={removeCoupon}>Remove</button>
      </div>
    );
  }
  return (
    <form className={styles.codeForm} onSubmit={(e) => { e.preventDefault(); setError(applyCoupon(code)); }} noValidate>
      <div className={styles.codeRow}>
        <label htmlFor="coupon" className={ui.sr}>Discount code</label>
        <input id="coupon" className={styles.codeInput} value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }} placeholder="Discount code"
          autoComplete="off" aria-invalid={error ? true : undefined} aria-describedby="coupon-note" />
        <button type="submit" className={styles.codeBtn} disabled={!code.trim()}>Apply</button>
      </div>
      <p id="coupon-note" className={error ? forms.error : forms.hint} role={error ? "alert" : undefined}>{error ?? "Try FIRSTCRUNCH or BOXOFF50."}</p>
    </form>
  );
}
