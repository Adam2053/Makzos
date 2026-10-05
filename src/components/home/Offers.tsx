"use client";

import Image from "next/image";
import { BAG_PRICE, BOX_PRICE, FEATURED, FLAVOURS, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ui from "./ui.module.css";
import styles from "./Offers.module.css";

/**
 * Three ways to buy, as three round tokens. The middle one is the brand colour because
 * it's the one most people will want; the price sits at the centre of each.
 */
export function Offers() {
  const { addBox } = useCart();
  const all = FLAVOURS.map((f) => f.id);
  const starter = FEATURED.map((f) => f.id);

  return (
    <section id="offers" className={styles.section} aria-labelledby="offers-title">
      <div className={ui.shell}>
        <h2 id="offers-title" className={`${ui.display} ${styles.title}`}>Pick how many.</h2>

        <ul className={styles.coins}>
          <li className={styles.coin}>
            <div className={styles.packs} data-n="1">
              <Image src={FLAVOURS[0].pack} alt="" width={PACK_W} height={PACK_H} sizes="90px" />
            </div>
            <h3 className={styles.name}>One bag</h3>
            <p className={`${ui.display} ${styles.price}`}>{inr(BAG_PRICE)}</p>
            <p className={styles.note}>Any flavour, {WEIGHT}.</p>
            <a href="#flavours" className={ui.btnLine}>Choose a flavour</a>
          </li>

          <li className={`${styles.coin} ${styles.lead}`}>
            <div className={styles.packs} data-n="4">
              {FEATURED.map((f, i) => <Image key={f.id} src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="80px" style={{ "--i": i - 1.5 } as React.CSSProperties} />)}
            </div>
            <h3 className={styles.name}>Starter box of 4</h3>
            <p className={`${ui.display} ${styles.price}`}>{inr(BOX_PRICE)}</p>
            <p className={styles.note}>{FEATURED.map((f) => f.name).join(", ")}.</p>
            <button type="button" className={ui.btnDark} onClick={(e) => addBox(starter, e.currentTarget.closest("li")?.querySelector(`.${styles.packs}`) as HTMLElement)}>
              Add the box
            </button>
          </li>

          <li className={styles.coin}>
            <div className={styles.packs} data-n="7">
              {FLAVOURS.map((f, i) => <Image key={f.id} src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="64px" style={{ "--i": i - 3 } as React.CSSProperties} />)}
            </div>
            <h3 className={styles.name}>The full table</h3>
            <p className={`${ui.display} ${styles.price}`}>{inr(BAG_PRICE * all.length)}</p>
            <p className={styles.note}>One of every flavour, all seven.</p>
            <button type="button" className={ui.btn} onClick={(e) => addBox(all, e.currentTarget.closest("li")?.querySelector(`.${styles.packs}`) as HTMLElement)}>
              Add all seven
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}
