"use client";

import Link from "next/link";
import { addressLines, fmtDate, useStore } from "@/lib/store";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import { OrderRow } from "./OrderRow";
import styles from "./account.module.css";

/** The account at a glance: the latest order, counts, the default address. */
export default function AccountOverview() {
  const { user, orders, addresses } = useStore();
  if (!user) return null;
  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const home = addresses.find((a) => a.isDefault);

  return (
    <>
      <header>
        <h1 className={`${ui.display} ${styles.title}`}>Hi, {user.name.split(" ")[0]}.</h1>
        <p className={styles.sub}>With us since {fmtDate(user.since)}.</p>
      </header>

      <div className={styles.cards}>
        <Link href="/account/orders" className={styles.stat}><strong>{orders.length}</strong><span>{orders.length === 1 ? "Order" : "Orders"}</span></Link>
        <Link href="/account/orders" className={styles.stat}><strong>{active.length}</strong><span>On the way</span></Link>
        <Link href="/account/addresses" className={styles.stat}><strong>{addresses.length}</strong><span>Saved {addresses.length === 1 ? "address" : "addresses"}</span></Link>
      </div>

      <section className={styles.body}>
        <div className={styles.row}>
          <h2 className={`${ui.display} ${styles.h2}`}>Latest order</h2>
          {orders.length > 1 && <Link href="/account/orders" className={ui.link}>All orders</Link>}
        </div>
        {orders[0] ? <OrderRow o={orders[0]} /> : (
          <div className={styles.emptyBox}>
            <Makhana variant="outline" className={styles.emptySeed} />
            <p>No orders yet. Your first bag is a tap away.</p>
            <Link href="/shop" className={ui.btnPaprika}>Shop the flavours</Link>
          </div>
        )}
      </section>

      <section className={styles.body}>
        <div className={styles.row}>
          <h2 className={`${ui.display} ${styles.h2}`}>Default address</h2>
          <Link href="/account/addresses" className={ui.link}>{home ? "Manage" : "Add one"}</Link>
        </div>
        {home ? (
          <div className={styles.card}>
            <strong>{home.label}</strong>
            <span>{home.name}</span>
            {addressLines(home).map((l) => <span key={l}>{l}</span>)}
          </div>
        ) : <p className={styles.quiet}>No saved address yet. Add one here or at checkout.</p>}
      </section>
    </>
  );
}
