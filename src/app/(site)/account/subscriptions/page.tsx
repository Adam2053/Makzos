"use client";

import Link from "next/link";
import { useState } from "react";
import { FLAVOURS, SUB_EVERY, SUB_OFF, inr } from "@/lib/products";
import { describeLine, unitPrice } from "@/lib/cart";
import { addressLines, fmtDate, useStore, type Subscription } from "@/lib/store";
import { PackThumb } from "@/components/shop/Pack";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

/** Self-serve subscriptions (requirements form): skip, pause, change how often, swap the flavour, cancel. */
export default function AccountSubscriptions() {
  const { subs } = useStore();
  const live = subs.filter((s) => s.status !== "cancelled");
  const ended = subs.filter((s) => s.status === "cancelled");

  return (
    <>
      <header>
        <h1 className={`${ui.display} ${styles.title}`}>Subscriptions.</h1>
        <p className={styles.sub}>{SUB_OFF}% off every delivery. Change anything here; it applies from the next one.</p>
      </header>
      {subs.length === 0 ? (
        <div className={styles.emptyBox}>
          <Makhana variant="outline" className={styles.emptySeed} />
          <p>No subscriptions yet. Pick &ldquo;Subscribe and save&rdquo; on any flavour or box, and it&rsquo;ll show up here after your first order.</p>
          <div className={forms.actions}>
            <Link href="/shop" className={ui.btnPaprika}>Choose a flavour</Link>
            <Link href="/build-a-box#subscribe" className={ui.link}>How it works</Link>
          </div>
        </div>
      ) : (
        <div className={styles.orders}>
          {live.map((s) => <SubCard key={s.id} s={s} />)}
          {ended.length > 0 && <h2 className={`${ui.display} ${styles.h2}`}>Cancelled</h2>}
          {ended.map((s) => <SubCard key={s.id} s={s} />)}
        </div>
      )}
    </>
  );
}

function SubCard({ s }: { s: Subscription }) {
  const { updateSub } = useStore();
  const [swap, setSwap] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const d = describeLine(s.line);
  const off = s.status === "cancelled";

  return (
    <article className={styles.subCard} data-status={s.status}>
      <div className={styles.subTop}>
        <PackThumb id={d.packId} size={44} />
        <div className={styles.orderText}>
          <strong>{d.title}</strong>
          <span>{s.line.qty} × {inr(unitPrice(s.line))}, every {s.every} weeks</span>
        </div>
        <span className={styles.status} data-s={s.status === "active" ? "delivered" : s.status === "paused" ? "shipped" : "cancelled"}>
          {s.status === "active" ? "Active" : s.status === "paused" ? "Paused" : "Cancelled"}
        </span>
      </div>
      {!off && (
        <p className={styles.next}>
          {s.status === "paused" ? "Paused. Nothing will be sent until you resume." : <>Next delivery <strong>{fmtDate(s.next)}</strong>, to {s.address.label.toLowerCase()}: {addressLines(s.address)[0]}</>}
        </p>
      )}
      {!off && (
        <div className={styles.subControls}>
          <div className={forms.segments} role="group" aria-label="Deliver every">
            {SUB_EVERY.map((w) => <button key={w} type="button" className={forms.segment} aria-pressed={s.every === w} onClick={() => updateSub(s.id, { every: w })}>Every {w} weeks</button>)}
          </div>
          <div className={styles.cardActions}>
            {s.status === "active" && <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => updateSub(s.id, { skip: true })}>Skip next delivery</button>}
            <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => updateSub(s.id, { status: s.status === "paused" ? "active" : "paused" })}>{s.status === "paused" ? "Resume" : "Pause"}</button>
            {s.line.kind === "bag" && <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setSwap((x) => !x)}>Swap flavour</button>}
            {confirm ? (
              <span role="alert">Cancel for good?{" "}
                <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => updateSub(s.id, { status: "cancelled" })}>Yes, cancel</button>{" "}
                <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(false)}>Keep it</button>
              </span>
            ) : <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(true)}>Cancel</button>}
          </div>
          {swap && s.line.kind === "bag" && (
            <div className={forms.segments} role="group" aria-label="Swap to">
              {FLAVOURS.map((f) => (
                <button key={f.id} type="button" className={forms.segment} aria-pressed={s.line.kind === "bag" && s.line.id === f.id} onClick={() => { updateSub(s.id, { swapTo: f.id }); setSwap(false); }}>{f.name}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
