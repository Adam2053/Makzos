"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { inr } from "@/lib/products";
import { PackThumb } from "@/components/shop/Pack";
import { describeLine, linePrice, useCart } from "@/lib/cart";
import { FREE_FROM } from "@/lib/pricing";
import { MOTION_OK, gsap } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./CartDrawer.module.css";

/** A real modal dialog, so focus, Escape and the backdrop come from the browser. */
export function CartDrawer() {
  const { lines, subtotal, saving, open, setOpen, setQty } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current!;
    const motion = window.matchMedia(MOTION_OK).matches;
    if (open && !d.open) {
      d.showModal();
      if (motion) gsap.fromTo(d, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "expo.out" });
    } else if (!open && d.open) {
      if (motion) gsap.to(d, { xPercent: 100, duration: 0.35, ease: "power2.in", onComplete: () => d.close() });
      else d.close();
    }
  }, [open]);

  return (
    <dialog ref={ref} className={styles.drawer} aria-labelledby="bag-title"
      onCancel={(e) => { e.preventDefault(); setOpen(false); }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id="bag-title" className={`${ui.display} ${styles.title}`}>Your bag</h2>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close bag">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <Makhana variant="outline" className={styles.emptySeed} />
            <p>Your bag is empty. Start with a dish you already know.</p>
            <Link href="/shop" className={ui.btn} onClick={() => setOpen(false)}>Shop the flavours</Link>
          </div>
        ) : (
          <>
            <ul className={styles.lines}>
              {lines.map((l) => {
                const d = describeLine(l);
                return (
                  <li key={l.key} className={styles.line}>
                    <span className={styles.thumb}><PackThumb id={d.packId} size={38} /></span>
                    <span className={styles.what}>
                      <Link href={d.href} onClick={() => setOpen(false)}><strong>{d.title}</strong></Link>
                      <span>{d.detail}</span>
                    </span>
                    <span className={styles.qty} role="group" aria-label={`Quantity of ${d.title}`}>
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label={l.qty === 1 ? `Remove ${d.title}` : "One fewer"}>−</button>
                      <output aria-live="polite">{l.qty}</output>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="One more">+</button>
                    </span>
                    <span className={styles.linePrice}>{inr(linePrice(l))}</span>
                  </li>
                );
              })}
            </ul>
            <div className={styles.foot}>
              {saving > 0 && <p className={styles.saving}><span>Every 4 bags at the box price</span><span>−{inr(saving)}</span></p>}
              <p className={styles.subtotal}><span>Subtotal</span><span>{inr(subtotal)}</span></p>
              <p className={styles.note}>
                {subtotal >= FREE_FROM ? "Standard delivery is free on this order." : `Add ${inr(FREE_FROM - subtotal)} more for free delivery.`}
              </p>
              <Link href="/checkout" className={`${ui.btnPaprika} ${styles.checkout}`} onClick={() => setOpen(false)}>Go to checkout</Link>
              <Link href="/cart" className={`${ui.link} ${styles.full}`} onClick={() => setOpen(false)}>See the full bag</Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
