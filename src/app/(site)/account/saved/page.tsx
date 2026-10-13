"use client";

import Link from "next/link";
import { BAG_PRICE, byId, inr, productHref } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import { Pack } from "@/components/shop/Pack";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

/** The wishlist: flavours saved with the heart on their page. */
export default function AccountSaved() {
  const { saved, toggleSaved } = useStore();
  const { addBag } = useCart();
  return (
    <>
      <header>
        <h1 className={`${ui.display} ${styles.title}`}>Saved.</h1>
        <p className={styles.sub}>Flavours you&rsquo;ve hearted, to come back to.</p>
      </header>
      {saved.length === 0 ? (
        <div className={styles.emptyBox}>
          <Makhana variant="outline" className={styles.emptySeed} />
          <p>Nothing saved yet. Tap the heart on any flavour to keep it here.</p>
          <Link href="/shop" className={ui.btnPaprika}>Browse flavours</Link>
        </div>
      ) : (
        <ul className={styles.savedGrid}>
          {saved.map((id) => {
            const f = byId(id);
            return (
              <li key={id} className={styles.savedItem}>
                <Link href={productHref(id)} className={styles.savedShot}><Pack id={id} sizes="140px" alt="" /></Link>
                <Link href={productHref(id)} className={`${ui.display} ${styles.savedName}`}>{f.name}</Link>
                <span className={styles.quiet}>{inr(BAG_PRICE)}</span>
                <div className={styles.cardActions}>
                  <button type="button" className={ui.btnDark} onClick={(e) => addBag(id, e.currentTarget.closest("li")?.querySelector("img"))}>Add to bag</button>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => toggleSaved(id)}>Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
