import Link from "next/link";
import { inr } from "@/lib/products";
import { PackThumb } from "@/components/shop/Pack";
import { STEPS, fmtDate, type Order } from "@/lib/store";
import styles from "./account.module.css";

const statusLabel = (o: Order) => (o.status === "cancelled" ? "Cancelled" : STEPS.find((s) => s.id === o.status)!.label);

/** One order in a list: its packs fanned out, what and when, the total and where it is. */
export function OrderRow({ o }: { o: Order }) {
  const ids = [...new Set(o.lines.flatMap((l) => (l.kind === "bag" ? [l.id] : l.ids)))];
  const items = o.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <Link href={`/orders/${o.id}`} className={styles.order}>
      <span className={styles.packs} aria-hidden="true">
        {ids.slice(0, 4).map((id) => (
          <PackThumb key={id} id={id} size={36} />
        ))}
      </span>
      <span className={styles.orderText}>
        <strong>Order {o.id}</strong>
        <span>{fmtDate(o.placedAt)}. {items} {items === 1 ? "item" : "items"}{o.sample ? ". Sample order" : ""}</span>
      </span>
      <span className={styles.orderSide}>
        {inr(o.totals.total)}
        <span className={styles.status} data-s={o.status}>{statusLabel(o)}</span>
      </span>
    </Link>
  );
}
