"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SUB_OFF } from "@/lib/products";
import { describeLine } from "@/lib/cart";
import { fmtDate, useStore, type Subscription } from "@/lib/store";
import { changeSubscription } from "@/app/actions/account";
import { PackThumb } from "@/components/shop/Pack";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

const LIVE = ["active", "paused", "failed"];

/** Subscriptions from Shopify Subscriptions: skip the next delivery, pause, resume or cancel. */
export default function AccountSubscriptions() {
  const { subs } = useStore();
  const live = subs.filter((s) => LIVE.includes(s.status));
  const ended = subs.filter((s) => !LIVE.includes(s.status));

  return (
    <>
      <header>
        <h1 className={`${ui.display} ${styles.title}`}>Subscriptions.</h1>
        <p className={styles.sub}>{SUB_OFF}% off every delivery. Changes apply from the next one.</p>
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
          {ended.length > 0 && <h2 className={`${ui.display} ${styles.h2}`}>Ended</h2>}
          {ended.map((s) => <SubCard key={s.id} s={s} />)}
          <p className={styles.quiet}>To change how often it comes or what&rsquo;s in it, write to hello@makzos.com and we&rsquo;ll switch it for you.</p>
        </div>
      )}
    </>
  );
}

function SubCard({ s }: { s: Subscription }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const d = s.line ? describeLine(s.line) : null;
  const off = !LIVE.includes(s.status);
  const title = d?.title ?? s.items.map((i) => (i.qty > 1 ? `${i.title} ×${i.qty}` : i.title)).join(", ");

  const change = (c: "pause" | "resume" | "cancel" | "skip") =>
    start(async () => {
      const r = await changeSubscription(s.id, c, s.next);
      if (!r.ok) return setError(r.message);
      setError(null);
      setConfirm(false);
      router.refresh();
    });

  const badge = s.status === "active" ? "delivered" : s.status === "paused" || s.status === "failed" ? "shipped" : "cancelled";
  const label = { active: "Active", paused: "Paused", failed: "Payment failed", cancelled: "Cancelled", expired: "Ended" }[s.status];

  return (
    <article className={styles.subCard} data-status={s.status} aria-busy={busy || undefined}>
      <div className={styles.subTop}>
        {d && <PackThumb id={d.packId} size={44} />}
        <div className={styles.orderText}>
          <strong>{title}</strong>
          <span>{s.every ? `Every ${s.every} weeks` : "Repeating delivery"}{d ? `. ${d.detail}` : ""}</span>
        </div>
        <span className={styles.status} data-s={badge}>{label}</span>
      </div>
      {!off && (
        <p className={styles.next}>
          {s.status === "paused" ? "Paused. Nothing will be sent until you resume." : s.next ? <>Next delivery <strong>{fmtDate(s.next)}</strong>.</> : "Next delivery being scheduled."}
        </p>
      )}
      {!off && (
        <div className={styles.subControls}>
          <div className={styles.cardActions}>
            {s.status === "active" && s.next && <button type="button" className={`${ui.link} ${forms.textBtn}`} disabled={busy} onClick={() => change("skip")}>Skip next delivery</button>}
            <button type="button" className={`${ui.link} ${forms.textBtn}`} disabled={busy} onClick={() => change(s.status === "paused" ? "resume" : "pause")}>{s.status === "paused" ? "Resume" : "Pause"}</button>
            {confirm ? (
              <span role="alert">Cancel for good?{" "}
                <button type="button" className={`${ui.link} ${forms.textBtn}`} disabled={busy} onClick={() => change("cancel")}>Yes, cancel</button>{" "}
                <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(false)}>Keep it</button>
              </span>
            ) : <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(true)}>Cancel</button>}
          </div>
          {error && <p className={forms.error} role="alert">{error}</p>}
        </div>
      )}
    </article>
  );
}
