"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BOX_SIZE, PACK_H, PACK_W, byId, inr } from "@/lib/products";
import { linePrice, useCart, type Line } from "@/lib/cart";
import { MOTION_OK, gsap } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./CartDrawer.module.css";

function describe(l: Line) {
  if (l.kind === "bag") return { title: byId(l.id).name, detail: "55 g bag", pack: byId(l.id).pack };
  const counts = l.ids.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {});
  const detail = Object.entries(counts).map(([id, n]) => (n > 1 ? `${byId(id).name} ×${n}` : byId(id).name)).join(", ");
  return { title: l.ids.length === BOX_SIZE ? `Box of ${BOX_SIZE}` : `All ${l.ids.length} flavours`, detail, pack: byId(l.ids[0]).pack };
}

/** A real modal dialog, so focus, Escape and the backdrop come from the browser. */
export function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQty } = useCart();
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
            <a href="#shop" className={ui.btn} onClick={() => setOpen(false)}>Shop the flavours</a>
          </div>
        ) : (
          <>
            <ul className={styles.lines}>
              {lines.map((l) => {
                const d = describe(l);
                return (
                  <li key={l.key} className={styles.line}>
                    <span className={styles.thumb}><Image src={d.pack} alt="" width={PACK_W} height={PACK_H} sizes="64px" /></span>
                    <span className={styles.what}>
                      <strong>{d.title}</strong>
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
              <p className={styles.subtotal}><span>Subtotal</span><span>{inr(subtotal)}</span></p>
              <p className={styles.note}>Delivery is worked out at checkout.</p>
              {/* Checkout isn't connected yet. */}
              <button type="button" className={`${ui.btn} ${styles.checkout}`}>Go to checkout</button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
