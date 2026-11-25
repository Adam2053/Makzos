"use client";

import Link from "next/link";
import { useState } from "react";
import { inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { DELIVERY } from "@/lib/pricing";
import { STEPS, addressLines, canCancel, fmtDate, fmtPhone, loginHref, type Order } from "@/lib/store";
import { Makhana } from "@/components/home/Makhana";
import { LineList, TotalsTable } from "@/components/shop/Summary";
import { Crumbs } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./order.module.css";

/** When the order can't be shown: not theirs, not signed in, or no such order. */
export function OrderMissing({ id, signedIn }: { id: string; signedIn: boolean }) {
  return (
    <section className={`${ui.shell} ${styles.missing}`}>
      <Makhana variant="outline" className={styles.missingSeed} />
      <h1 className={`${ui.display} ${styles.missingTitle}`}>{signedIn ? `We can’t find that order.` : "Sign in to see this order."}</h1>
      <p className={ui.lede}>
        {signedIn ? "It isn't on this account. If you ordered as a guest, track it with its number and your email." : "Orders live in your account. Ordered as a guest? Track it with its number and your email."}
      </p>
      <div className={forms.actions}>
        <Link href="/track" className={ui.btn}>Track an order</Link>
        {signedIn ? <Link href="/account/orders" className={ui.btnLine}>Your orders</Link> : <a href={loginHref(`/orders/${id}`)} className={ui.btnLine}>Sign in</a>}
      </div>
    </section>
  );
}

/**
 * One order: where it is, what's in it, where it's going and how it was paid, all from Shopify.
 * `guest` is the tracking view: no account links, and the address stays partly hidden.
 */
export function OrderView({ o, guest = false }: { o: Order; guest?: boolean }) {
  const { addBag, addBox, setOpen } = useCart();
  const [reordered, setReordered] = useState(false);

  const cancelled = o.status === "cancelled";
  const at = STEPS.findIndex((s) => s.id === o.status);
  const reorder = () => {
    o.lines.forEach((l) => {
      if (l.kind === "bag") addBag(l.id, null, { quiet: true, qty: l.qty, ...(l.size === 3 ? { size: 3 } : {}) });
      else for (let i = 0; i < l.qty; i++) addBox(l.ids, null, l.note);
    });
    setReordered(true);
  };
  const Title = guest ? "h2" : "h1";

  return (
    <section className={`${ui.shell} ${styles.page}`}>
      <div className={styles.head}>
        {!guest && <Crumbs items={[{ href: "/account", label: "Account" }, { href: "/account/orders", label: "Orders" }, { label: o.number }]} />}
        <Title className={`${ui.display} ${styles.title}`}>Order {o.number}</Title>
        <p className={styles.meta}>Placed {fmtDate(o.placedAt, true)}. {inr(o.totals.total)}, {o.payment.label.toLowerCase()}.</p>
      </div>

      {/* ---------- Where it is ---------- */}
      <div className={styles.track} data-cancelled={cancelled || undefined}>
        {cancelled ? (
          <div className={styles.cancelled}>
            <strong className={ui.display}>Cancelled</strong>
            <span>Cancelled {o.history.cancelled && fmtDate(o.history.cancelled, true)}. {o.payment.method === "cod" ? "Nothing was charged." : `${inr(o.totals.total)} goes back to the way you paid, in 5 to 7 working days.`}</span>
          </div>
        ) : (
          <>
            <p className={styles.now}>
              <span className={ui.display}>{STEPS[at].label}</span>
              <span>{o.status === "delivered" && o.history.delivered ? `Delivered ${fmtDate(o.history.delivered)}.` : `${STEPS[at].note} ${DELIVERY[o.delivery].label} delivery: ${DELIVERY[o.delivery].eta}.`}</span>
            </p>
            <ol className={styles.steps} aria-label="Order progress">
              {STEPS.map((s, i) => (
                <li key={s.id} data-state={i < at ? "done" : i === at ? "now" : "next"} aria-current={i === at ? "step" : undefined}>
                  <span className={styles.dot} aria-hidden="true" />
                  <strong>{s.label}</strong>
                  <span>{o.history[s.id] ? fmtDate(o.history[s.id]!, true) : i <= at ? "Done" : "Not yet"}</span>
                </li>
              ))}
            </ol>
            {o.tracking.map((t, i) => (
              <p key={i} className={styles.quiet}>
                {t.company ?? "Courier"}{t.number ? `, tracking number ${t.number}` : ""}.{" "}
                {t.url && <a href={t.url} className={ui.link} target="_blank" rel="noreferrer">Follow it with the courier</a>}
              </p>
            ))}
          </>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.items}>
          <h3 className={styles.h3}>In this order</h3>
          {o.lines.length > 0 && <LineList lines={o.lines} compact />}
          {o.others.length > 0 && (
            <ul className={styles.quiet}>
              {o.others.map((x, i) => <li key={i}>{x.qty} × {x.title}, {inr(x.price)}</li>)}
            </ul>
          )}
          <div className={styles.totals}><TotalsTable saving={o.saving} totals={o.totals} coupon={o.coupon} method={o.delivery} /></div>
        </div>

        <div className={styles.info}>
          {o.address && (
            <div className={styles.card}>
              <h3 className={styles.h3}>Delivering to</h3>
              <p><strong>{o.address.name}</strong>{o.address.phone && <>, {fmtPhone(o.address.phone)}</>}</p>
              {addressLines(o.address).map((l) => <p key={l}>{l}</p>)}
            </div>
          )}
          <div className={styles.card}>
            <h3 className={styles.h3}>Payment</h3>
            <p>{o.payment.label}</p>
            <p className={styles.quiet}>{o.payment.method === "cod" ? `Pay ${inr(o.totals.total)} when it arrives.` : o.payment.method === "refunded" ? "Refunded to the way you paid." : `Paid ${inr(o.totals.total)}.`}</p>
          </div>

          <div className={styles.actions}>
            {o.lines.length > 0 && (reordered ? (
              <p className={styles.reordered} role="status">Added to your bag. <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setOpen(true)}>View bag</button></p>
            ) : (
              <button type="button" className={ui.btnPaprika} onClick={reorder}>Order these again</button>
            ))}
            {o.statusUrl && <a href={o.statusUrl} className={ui.btnLine} target="_blank" rel="noreferrer">Receipt and order status</a>}
            {canCancel(o) && <a href={`mailto:hello@makzos.com?subject=Cancel%20order%20${encodeURIComponent(o.number)}`} className={ui.btnLine}>Ask to cancel</a>}
            <a href={`mailto:hello@makzos.com?subject=Order%20${encodeURIComponent(o.number)}`} className={ui.link}>Help with this order</a>
          </div>
        </div>
      </div>
    </section>
  );
}
