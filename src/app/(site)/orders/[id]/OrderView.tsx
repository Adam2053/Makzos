"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { DELIVERY } from "@/lib/pricing";
import { STEPS, addressLines, canCancel, fmtDate, fmtPhone, useStore } from "@/lib/store";
import { Makhana } from "@/components/home/Makhana";
import { LineList, TotalsTable } from "@/components/shop/Summary";
import { Crumbs, SampleTag, Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./order.module.css";

const REASONS = ["Ordered by mistake", "Wrong address", "Want to change what's in it", "Found it cheaper elsewhere", "Something else"];

/**
 * One order: where it is, what's in it, where it's going and how it was paid. It can be
 * cancelled until it leaves us, and reordered any time. Right after checkout it opens with
 * the thank-you.
 */
export function OrderView({ id, placed }: { id: string; placed: boolean }) {
  const { orders, ready, user, cancelOrder, advanceOrder } = useStore();
  const { addBag, addBox, setOpen } = useCart();
  const [reason, setReason] = useState("");
  const [reordered, setReordered] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const o = orders.find((x) => x.id === id);

  if (!ready) return <div className={`${ui.shell} ${styles.loading}`}><Spinner /> Finding your order</div>;

  if (!o) {
    return (
      <section className={`${ui.shell} ${styles.missing}`}>
        <Makhana variant="outline" className={styles.missingSeed} />
        <h1 className={`${ui.display} ${styles.missingTitle}`}>We can&rsquo;t find order {id}.</h1>
        <p className={ui.lede}>Check the number in your SMS or email. If you ordered while signed in, it&rsquo;s in your account.</p>
        <div className={forms.actions}>
          <Link href="/track" className={ui.btn}>Track an order</Link>
          <Link href={user ? "/account/orders" : "/login?next=/account/orders"} className={ui.btnLine}>Your orders</Link>
        </div>
      </section>
    );
  }

  const cancelled = o.status === "cancelled";
  const at = STEPS.findIndex((s) => s.id === o.status);
  const reorder = () => {
    o.lines.forEach((l) => {
      for (let i = 0; i < l.qty; i++) {
        if (l.kind === "bag") addBag(l.id, null, { quiet: true });
        else addBox(l.ids, null, l.note);
      }
    });
    setReordered(true);
  };

  return (
    <>
      {placed && !cancelled && (
        <section className={styles.thanks} aria-labelledby="thanks-title">
          <div className={`${ui.shell} ${styles.thanksInner}`}>
            <Makhana variant="ink" className={styles.thanksSeed} />
            <div>
              <h1 id="thanks-title" className={`${ui.display} ${styles.thanksTitle}`}>Order placed. Thank you, {o.contact.name.split(" ")[0]}.</h1>
              <p className={styles.thanksText}>
                We&rsquo;ve texted the details to {fmtPhone(o.contact.phone)}{o.contact.email && <> and emailed {o.contact.email}</>}. Your order number is <strong>{o.id}</strong>.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className={`${ui.shell} ${styles.page}`}>
        <div className={styles.head}>
          <Crumbs items={user ? [{ href: "/account", label: "Account" }, { href: "/account/orders", label: "Orders" }, { label: o.id }] : [{ href: "/", label: "Home" }, { label: `Order ${o.id}` }]} />
          {placed && !cancelled ? <h2 className={`${ui.display} ${styles.title}`}>Order {o.id}</h2> : <h1 className={`${ui.display} ${styles.title}`}>Order {o.id}</h1>}
          <p className={styles.meta}>Placed {fmtDate(o.placedAt, true)}. {inr(o.totals.total)}, {o.payment.label}. {o.sample && <SampleTag>Sample order</SampleTag>}</p>
        </div>

        {/* ---------- Where it is ---------- */}
        <div className={styles.track} data-cancelled={cancelled || undefined}>
          {cancelled ? (
            <div className={styles.cancelled}>
              <strong className={ui.display}>Cancelled</strong>
              <span>Cancelled {o.history.cancelled && fmtDate(o.history.cancelled, true)}. {o.payment.method === "cod" ? "Nothing was charged." : `${inr(o.totals.total)} goes back to your ${o.payment.method === "card" ? "card" : "account"} in 5 to 7 working days.`}</span>
            </div>
          ) : (
            <>
              <p className={styles.now}>
                <span className={ui.display}>{STEPS[at].label}</span>
                <span>{o.status === "delivered" ? `Delivered ${fmtDate(o.history.delivered!)}.` : `${STEPS[at].note} ${DELIVERY[o.delivery].label} delivery: ${DELIVERY[o.delivery].eta}.`}</span>
              </p>
              <ol className={styles.steps} aria-label="Order progress">
                {STEPS.map((s, i) => (
                  <li key={s.id} data-state={i < at ? "done" : i === at ? "now" : "next"} aria-current={i === at ? "step" : undefined}>
                    <span className={styles.dot} aria-hidden="true" />
                    <strong>{s.label}</strong>
                    <span>{o.history[s.id] ? fmtDate(o.history[s.id]!, true) : "Not yet"}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        <div className={styles.grid}>
          <div className={styles.items}>
            <h3 className={styles.h3}>In this order</h3>
            <LineList lines={o.lines} compact />
            <div className={styles.totals}><TotalsTable saving={o.saving} totals={o.totals} coupon={o.coupon} method={o.delivery} /></div>
          </div>

          <div className={styles.info}>
            <div className={styles.card}>
              <h3 className={styles.h3}>Delivering to</h3>
              <p><strong>{o.address.name}</strong>, {fmtPhone(o.address.phone)}</p>
              {addressLines(o.address).map((l) => <p key={l}>{l}</p>)}
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>Payment</h3>
              <p>{o.payment.label}</p>
              <p className={styles.quiet}>{o.payment.method === "cod" ? `Pay ${inr(o.totals.total)} when it arrives.` : `Paid ${inr(o.totals.total)}.`}</p>
            </div>

            <div className={styles.actions}>
              {reordered ? (
                <p className={styles.reordered} role="status">Added to your bag. <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setOpen(true)}>View bag</button></p>
              ) : (
                <button type="button" className={ui.btnPaprika} onClick={reorder}>Order these again</button>
              )}
              {canCancel(o) && <button type="button" className={ui.btnLine} onClick={() => dialog.current?.showModal()}>Cancel order</button>}
              <button type="button" className={ui.btnLine} onClick={() => window.print()}>Print receipt</button>
              <a href={`mailto:hello@makzos.com?subject=Order%20${o.id}`} className={ui.link}>Help with this order</a>
            </div>

            {/* Only here so the order can be walked through its steps without a courier. */}
            {!cancelled && o.status !== "delivered" && (
              <div className={styles.demo}>
                <span>Demo</span>
                <p>Move this order to its next step, to see how tracking looks.</p>
                <button type="button" className={ui.btnLine} onClick={() => advanceOrder(o.id)}>Mark as {STEPS[at + 1].label.toLowerCase()}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="cancel-title" onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
        <form method="dialog" className={forms.form} onSubmit={() => { cancelOrder(o.id); setReason(""); }}>
          <h2 id="cancel-title" className={`${ui.display} ${styles.dialogTitle}`}>Cancel order {o.id}?</h2>
          <p className={styles.quiet}>{o.payment.method === "cod" ? "Nothing has been charged." : `We'll refund ${inr(o.totals.total)} to the way you paid, in 5 to 7 working days.`}</p>
          <div className={forms.choices} role="radiogroup" aria-label="Why are you cancelling?">
            {REASONS.map((r) => (
              <label key={r} className={forms.choice}>
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
                <span className={forms.choiceBody}><strong>{r}</strong></span>
              </label>
            ))}
          </div>
          <div className={forms.actions}>
            <button type="submit" className={ui.btn} disabled={!reason}>Cancel order</button>
            <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => dialog.current?.close()}>Keep order</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
