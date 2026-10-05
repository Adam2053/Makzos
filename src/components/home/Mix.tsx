"use client";

import Image from "next/image";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FLAVOURS, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Mix.module.css";

/**
 * Ordering the way people already order food: tap Add and it's in your bag, and the
 * button becomes a stepper for that flavour's count in the bag. The bar below shows what
 * the bag holds and takes you to it. Nothing flies or bounces; the stepper is the feedback.
 */
export function Mix() {
  const { lines, bags, subtotal, addBag, setQty, setOpen } = useCart();

  const inBag = (id: string) => lines.find((l) => l.kind === "bag" && l.id === id)?.qty ?? 0;
  const loose = bags % BOX_SIZE;
  const toBox = loose === 0 ? 0 : BOX_SIZE - loose;

  const change = (id: string, d: number) => {
    const n = inBag(id);
    if (n === 0 && d > 0) addBag(id, null, { quiet: true });
    else setQty(`bag-${id}`, n + d);
  };

  return (
    <section id="mix" className={styles.section} aria-labelledby="mix-title">
      <div className={ui.shell}>
        <header className={styles.head}>
          <h2 id="mix-title" className={`${ui.display} ${styles.title}`}>Make your own mix.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            {inr(BAG_PRICE)} a bag. Every four you pick count as a box, {inr(BOX_PRICE)}.
          </p>
        </header>

        <ul className={styles.grid}>
          {FLAVOURS.map((f) => {
            const n = inBag(f.id);
            return (
              <li key={f.id} className={styles.item} data-in={n > 0 || undefined} style={{ "--field": f.field } as React.CSSProperties}>
                <div className={styles.shot}>
                  <span className={styles.disc} />
                  <Image src={f.pack} alt={`Makzo's ${f.name}, ${WEIGHT}`} width={PACK_W} height={PACK_H} sizes="(max-width: 700px) 36vw, 200px" />
                  {n > 0 && <span className={styles.badge} aria-hidden="true">{n}</span>}
                </div>
                <h3 className={`${ui.display} ${styles.name}`}>{f.name}</h3>
                <p className={styles.inspired}>{f.inspired}</p>
                <div className={styles.row}>
                  <span className={styles.price}>{inr(BAG_PRICE)}</span>
                  {n === 0 ? (
                    <button type="button" className={styles.addBtn} aria-label={`Add ${f.name} to bag`} onClick={() => change(f.id, 1)}>
                      Add <span aria-hidden="true">+</span>
                    </button>
                  ) : (
                    <span className={styles.stepper} role="group" aria-label={`${f.name} in your bag`}>
                      <button type="button" onClick={() => change(f.id, -1)} aria-label={`One fewer ${f.name}`}>−</button>
                      <output aria-live="polite">{n}</output>
                      <button type="button" onClick={() => change(f.id, 1)} aria-label={`One more ${f.name}`}>+</button>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {/* The eighth cell: a nudge, not a product. */}
          <li className={styles.note}>
            <Makhana variant="outline" className={styles.noteSeed} />
            <p>Can&rsquo;t choose? Pick four different ones and find your favourite.</p>
          </li>
        </ul>

        <div className={styles.bar} data-on={bags > 0 || undefined} aria-live="polite">
          <div className={styles.barText}>
            <strong>{bags} {bags === 1 ? "bag" : "bags"} in your bag, {inr(subtotal)}</strong>
            <span>{toBox > 0 ? `Add ${toBox} more and ${bags > BOX_SIZE ? "the next four are" : "they're"} priced as a box.` : "Every four priced as a box."}</span>
          </div>
          <button type="button" className={ui.btnPaprika} onClick={() => setOpen(true)}>
            Go to bag
          </button>
        </div>
      </div>
    </section>
  );
}
