"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./track.module.css";

/** For guests, or anyone without their account to hand: the order number and the phone it was placed with. */
export function TrackView() {
  const router = useRouter();
  const { orders, user } = useStore();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = id.trim().toUpperCase();
    if (!/^MKZ\d{5}$/.test(clean)) return setError("Order numbers look like MKZ12345. It's in your SMS and email.");
    if (!/^\d{10}$/.test(phone)) return setError("Enter the 10-digit mobile number you ordered with.");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const o = orders.find((x) => x.id === clean && (x.contact.phone === phone || x.address.phone === phone));
      if (!o) return setError(`No order ${clean} with that number. Check both, or write to hello@makzos.com.`);
      router.push(`/orders/${o.id}`);
    }, 600);
  };

  return (
    <>
      <PageHead title="Track an order." lede="Your order number and the phone number you ordered with." crumbs={[{ href: "/", label: "Home" }, { label: "Track an order" }]} />
      <section className={`${ui.shell} ${styles.body}`}>
        <form className={`${forms.form} ${styles.form}`} onSubmit={find} noValidate>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="t-id">Order number</label>
            <input id="t-id" className={forms.input} placeholder="MKZ12345" autoComplete="off" value={id} onChange={(e) => { setId(e.target.value.toUpperCase()); setError(null); }} />
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="t-phone">Mobile number</label>
            <input id="t-phone" className={forms.input} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(null); }} />
          </div>
          {error && <p className={forms.error} role="alert">{error}</p>}
          <div className={forms.actions}>
            <button type="submit" className={ui.btn} disabled={busy}>{busy ? <><Spinner /> Looking</> : "Track order"}</button>
          </div>
        </form>
        <aside className={styles.aside}>
          <p><strong>Ordered while signed in?</strong></p>
          <p>Every order is in your account, with its tracking.</p>
          <Link href={user ? "/account/orders" : "/login?next=/account/orders"} className={ui.link}>{user ? "Your orders" : "Sign in"}</Link>
        </aside>
      </section>
    </>
  );
}
