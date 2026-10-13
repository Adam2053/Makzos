"use client";

import Link from "next/link";
import { BOX_SIZE, FLAVOURS, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { FREE_FROM, totals } from "@/lib/pricing";
import { Makhana } from "@/components/home/Makhana";
import { Products } from "@/components/home/Products";
import { CouponField, LineList, TotalsTable } from "@/components/shop/Summary";
import { PageHead, Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import styles from "./cart.module.css";

/**
 * The bag at full size: change counts, add a code, see what delivery will cost, then go.
 * The nudges say exactly how far each saving is: the next box price, free delivery.
 */
export function CartView() {
  const { lines, bags, saving, subtotal, coupon, ready, count } = useCart();
  const t = totals(subtotal, coupon, "standard");
  const loose = bags % BOX_SIZE;
  const toBox = loose === 0 ? 0 : BOX_SIZE - loose;
  const toFree = Math.max(0, FREE_FROM - (subtotal - t.discount));
  const inBag = new Set(lines.flatMap((l) => (l.kind === "bag" ? [l.id] : l.ids)));
  const others = FLAVOURS.filter((f) => !inBag.has(f.id)).map((f) => f.id);

  if (!ready) return <div className={`${ui.shell} ${styles.loading}`}><Spinner /> Opening your bag</div>;

  if (lines.length === 0) {
    return (
      <>
        <section className={`${ui.shell} ${styles.empty}`}>
          <Makhana variant="outline" className={styles.emptySeed} />
          <h1 className={`${ui.display} ${styles.emptyTitle}`}>Your bag is empty.</h1>
          <p className={ui.lede}>Start with a dish you already know.</p>
          <div className={styles.emptyActions}>
            <Link href="/shop" className={ui.btnPaprika}>Shop the flavours</Link>
            <Link href="/build-a-box" className={ui.btnLine}>Build a box</Link>
          </div>
        </section>
        <Products layout="rail" title="Start here." />
      </>
    );
  }

  return (
    <>
      <PageHead title="Your bag." lede={`${count} ${count === 1 ? "item" : "items"}. Change anything before you check out.`} crumbs={[{ href: "/", label: "Home" }, { label: "Bag" }]} />
      <section className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.main}>
          {(toBox > 0 || toFree > 0) && (
            <div className={styles.nudges}>
              {toBox > 0 && (
                <p><span className={styles.dot} />Add {toBox} more {toBox === 1 ? "bag" : "bags"} and {bags > BOX_SIZE ? "the next four are" : "they're"} priced as a box. <Link href="/shop" className={ui.link}>Add bags</Link></p>
              )}
              {toFree > 0 && <p><span className={styles.dot} />{inr(toFree)} more for free delivery.</p>}
              <div className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.min(100, ((subtotal - t.discount) / FREE_FROM) * 100)}%` }} /></div>
            </div>
          )}
          <LineList lines={lines} editable />
          <Link href="/shop" className={`${ui.link} ${styles.keep}`}>Keep shopping</Link>
        </div>

        <aside className={styles.side} aria-label="Order summary">
          <h2 className={`${ui.display} ${styles.sideTitle}`}>Summary</h2>
          <TotalsTable saving={saving} totals={t} coupon={coupon?.code} estimate />
          <CouponField />
          <Link href="/checkout" className={`${ui.btnPaprika} ${styles.go}`}>Check out, {inr(t.total)}</Link>
          <p className={styles.pay}>UPI, cards, net banking or cash on delivery. Delivery is confirmed at checkout.</p>
        </aside>
      </section>
      {others.length > 0 && <Products layout="rail" ids={others} title="Not in your bag yet." />}
    </>
  );
}
