"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore, type Order } from "@/lib/store";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import { OrderRow } from "../OrderRow";
import styles from "../account.module.css";

const FILTERS: { id: string; label: string; test: (o: Order) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "active", label: "On the way", test: (o) => !["delivered", "cancelled"].includes(o.status) },
  { id: "delivered", label: "Delivered", test: (o) => o.status === "delivered" },
  { id: "cancelled", label: "Cancelled", test: (o) => o.status === "cancelled" },
];

export default function AccountOrders() {
  const { orders, addSampleOrders } = useStore();
  const [filter, setFilter] = useState("all");
  const shown = orders.filter(FILTERS.find((f) => f.id === filter)!.test);

  return (
    <>
      <header>
        <h1 className={`${ui.display} ${styles.title}`}>Orders.</h1>
        <p className={styles.sub}>Tap an order to track it, cancel it or buy it again.</p>
      </header>

      {orders.length > 0 && (
        <div className={styles.filters} role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={forms.segment} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} ({orders.filter(f.test).length})
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className={styles.emptyBox}>
          <Makhana variant="outline" className={styles.emptySeed} />
          <p>No orders yet. When you order, you can follow it from here to your door.</p>
          <div className={forms.actions}>
            <Link href="/shop" className={ui.btnPaprika}>Shop the flavours</Link>
            {/* Demo only: fills the list so its states can be seen without placing orders. */}
            <button type="button" className={ui.btnLine} onClick={addSampleOrders}>Load sample orders</button>
          </div>
        </div>
      ) : shown.length === 0 ? (
        <p className={styles.quiet}>No {FILTERS.find((f) => f.id === filter)!.label.toLowerCase()} orders.</p>
      ) : (
        <div className={styles.orders}>{shown.map((o) => <OrderRow key={o.id} o={o} />)}</div>
      )}
      {orders.length > 0 && !orders.some((o) => o.sample) && (
        <button type="button" className={`${ui.link} ${forms.textBtn} ${styles.reset}`} onClick={addSampleOrders}>Demo: add sample orders</button>
      )}
    </>
  );
}
