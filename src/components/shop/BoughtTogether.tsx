"use client";

import Link from "next/link";
import { useState } from "react";
import { BAG_PRICE, BOX_SIZE, BOX_PRICE, byId, inr, productHref } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ui from "@/components/home/ui.module.css";
import { Pack } from "./Pack";
import styles from "./BoughtTogether.module.css";

/** Two that go with each flavour: one that contrasts, one that keeps it company. */
const PAIRS: Record<string, [string, string]> = {
  rasam: ["sweet-tamarind", "curry-leaves"],
  "sweet-tamarind": ["rasam", "chettinadu"],
  "mac-cheese": ["thai-chilli", "tiramisu"],
  tiramisu: ["mac-cheese", "sweet-tamarind"],
  "curry-leaves": ["rasam", "tiramisu"],
  chettinadu: ["sweet-tamarind", "mac-cheese"],
  "thai-chilli": ["mac-cheese", "curry-leaves"],
};

/**
 * The upsell, as a suggestion rather than a pop-up: this bag and two that go with it, ticked
 * by default, one button to add what's ticked. One more bag turns it into a box, and it says so.
 */
export function BoughtTogether({ id }: { id: string }) {
  const ids = [id, ...PAIRS[id]];
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(ids.map((x) => [x, true])));
  const [done, setDone] = useState(false);
  const { addBag, setOpen } = useCart();
  const picked = ids.filter((x) => on[x]);
  const total = picked.length * BAG_PRICE;

  const add = () => {
    picked.forEach((x, i) => addBag(x, null, { quiet: i < picked.length - 1 }));
    setDone(true);
  };

  return (
    <section className={styles.section} aria-labelledby="together-title">
      <div className={`${ui.shell} ${styles.inner}`}>
        <div className={styles.copy}>
          <h2 id="together-title" className={`${ui.display} ${styles.title}`}>Good together.</h2>
          <p className={styles.lede}>{byId(id).name} with one that contrasts and one that keeps it company. Add a fourth and all four are priced as a box, {inr(BOX_PRICE)}.</p>
        </div>
        <ul className={styles.row}>
          {ids.map((x, i) => {
            const f = byId(x);
            return (
              <li key={x} className={styles.item} data-off={!on[x] || undefined}>
                {i > 0 && <span className={styles.plus} aria-hidden="true">+</span>}
                <label className={styles.tile}>
                  <input type="checkbox" checked={!!on[x]} onChange={(e) => { setOn((o) => ({ ...o, [x]: e.target.checked })); setDone(false); }} disabled={i === 0} />
                  <Pack id={x} sizes="120px" className={styles.pack} alt="" />
                  <span className={styles.name}>{i === 0 ? `This: ${f.name}` : f.name}</span>
                  <span className={styles.price}>{inr(BAG_PRICE)}</span>
                </label>
                {i > 0 && <Link href={productHref(x)} className={styles.view}>View</Link>}
              </li>
            );
          })}
        </ul>
        <div className={styles.total}>
          <p><span>{picked.length} {picked.length === 1 ? "bag" : "bags"}</span><strong className={ui.display}>{inr(total)}</strong></p>
          {done ? (
            <p className={styles.done} role="status">Added. <button type="button" className={ui.link} onClick={() => setOpen(true)}>View bag</button></p>
          ) : (
            <button type="button" className={ui.btnPaprika} onClick={add}>Add {picked.length} to bag</button>
          )}
          {picked.length === BOX_SIZE - 1 && <p className={styles.hint}>One more makes it a box. <Link href="/build-a-box" className={ui.link}>Build a box</Link></p>}
        </div>
      </div>
    </section>
  );
}
