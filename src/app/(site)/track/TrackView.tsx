"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loginHref, useStore, type Order } from "@/lib/store";
import { trackOrder } from "@/app/actions/account";
import { PageHead, Spinner } from "@/components/shop/bits";
import { OrderView } from "../orders/[id]/OrderView";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./track.module.css";

/** For guests, or anyone without their account to hand: the order number and the email or phone it was placed with. */
export function TrackView() {
  const { user } = useStore();
  const [id, setId] = useState("");
  const [contact, setContact] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, start] = useTransition();

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\d/.test(id)) return setError("Order numbers look like #1001. It's in your confirmation email.");
    if (!contact.trim()) return setError("Enter the email or mobile number you ordered with.");
    setError(null);
    start(async () => {
      const r = await trackOrder(id, contact, trap);
      if (r.ok) setOrder(r.order);
      else { setOrder(null); setError(r.message); }
    });
  };

  return (
    <>
      <PageHead title="Track an order." lede="Your order number and the email or phone number you ordered with." crumbs={[{ href: "/", label: "Home" }, { label: "Track an order" }]} />
      <section className={`${ui.shell} ${styles.body}`}>
        <form className={`${forms.form} ${styles.form}`} onSubmit={find} noValidate>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="t-id">Order number</label>
            <input id="t-id" className={forms.input} placeholder="#1001" autoComplete="off" value={id} onChange={(e) => { setId(e.target.value); setError(null); }} />
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="t-contact">Email or mobile number</label>
            <input id="t-contact" className={forms.input} autoComplete="email" value={contact} onChange={(e) => { setContact(e.target.value); setError(null); }} />
          </div>
          {/* Left empty by people; filled by bots. */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} style={{ position: "absolute", left: "-9999px" }} />
          {error && <p className={forms.error} role="alert">{error}</p>}
          <div className={forms.actions}>
            <button type="submit" className={ui.btn} disabled={busy}>{busy ? <><Spinner /> Looking</> : "Track order"}</button>
          </div>
        </form>
        <aside className={styles.aside}>
          <p><strong>Ordered while signed in?</strong></p>
          <p>Every order is in your account, with its tracking.</p>
          {user ? <Link href="/account/orders" className={ui.link}>Your orders</Link> : <a href={loginHref("/account/orders")} className={ui.link}>Sign in</a>}
        </aside>
      </section>
      {order && <OrderView o={order} guest />}
    </>
  );
}
