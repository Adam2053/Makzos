"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BOX_PRICE, BOX_SIZE, FEATURED, FLAVOURS, PACK_H, PACK_W, WEIGHT, byId, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { MOTION_OK, gsap } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./BoxBuilder.module.css";

export function BoxBuilder() {
  const [slots, setSlots] = useState<(string | null)[]>(Array(BOX_SIZE).fill(null));
  // Mirrors state synchronously, so two quick taps never land in the same pocket.
  const live = useRef(slots);
  const commit = (next: (string | null)[]) => { live.current = next; setSlots(next); };
  const { addBox } = useCart();
  const tray = useRef<HTMLDivElement>(null);
  const filled = slots.filter(Boolean) as string[];
  const left = BOX_SIZE - filled.length;

  const motion = () => window.matchMedia(MOTION_OK).matches;
  /** Drops the pack into its slot once React has put it there. */
  const land = (i: number) => requestAnimationFrame(() => {
    if (!motion()) return;
    const img = tray.current?.querySelectorAll(`.${styles.slot}`)[i]?.querySelector("img");
    if (img) gsap.fromTo(img, { yPercent: -80, rotation: -18, scale: 0.6, autoAlpha: 0 }, { yPercent: 0, rotation: (i % 2 ? 6 : -6), scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(2.2)" });
  });

  const put = (id: string) => {
    const i = live.current.indexOf(null);
    if (i < 0) return;
    commit(live.current.map((v, j) => (j === i ? id : v)));
    land(i);
  };
  const take = (i: number) => commit(live.current.map((v, j) => (j === i ? null : v)));
  const fill = () => {
    const next = FEATURED.slice(0, BOX_SIZE).map((f) => f.id);
    commit(next);
    next.forEach((_, i) => setTimeout(() => land(i), i * 90));
  };
  const add = () => {
    addBox(filled, tray.current);
    commit(Array(BOX_SIZE).fill(null));
  };

  return (
    <section id="box" className={styles.section} aria-labelledby="box-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <h2 id="box-title" className={`${ui.display} ${styles.title}`}>One box.<br />Four flavours.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Pick any four {WEIGHT} bags. Doubles are allowed. A good way to find your favourite, or to bring one of each to the table.
          </p>
          <p className={styles.total}>{inr(BOX_PRICE)} <span>for the box of {BOX_SIZE}</span></p>
        </div>

        <div className={styles.builder}>
          <div ref={tray} className={styles.tray} aria-label={`Your box, ${filled.length} of ${BOX_SIZE} filled`} role="group">
            {slots.map((id, i) => (
              <div key={i} className={styles.slot}>
                {id ? (
                  <button type="button" className={styles.filled} onClick={() => take(i)} aria-label={`Remove ${byId(id).name} from the box`}>
                    <Image src={byId(id).pack} alt="" width={PACK_W} height={PACK_H} sizes="140px" />
                    <span className={styles.remove} aria-hidden="true">Remove</span>
                  </button>
                ) : (
                  <span className={styles.empty}><Makhana variant="outline" className={styles.ghost} /><span className={styles.sr}>Empty</span></span>
                )}
              </div>
            ))}
          </div>

          <div className={styles.pickers} role="group" aria-label="Put flavours in the box">
            {FLAVOURS.map((f) => (
              <button key={f.id} type="button" className={styles.pick} onClick={() => put(f.id)} disabled={left === 0}
                aria-label={`Put ${f.name} in the box`} style={{ "--field": f.field } as React.CSSProperties}>
                <span className={styles.pickThumb}><Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="48px" /></span>
                <span><span aria-hidden="true">+ </span>{f.name}</span>
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <button type="button" className={ui.btn} onClick={add} disabled={left > 0} aria-live="polite">
              {left === 0 ? `Add box to bag, ${inr(BOX_PRICE)}` : `Pick ${left} more`}
            </button>
            {filled.length === 0 && (
              <button type="button" className={`${ui.link} ${styles.fill}`} onClick={fill}>Fill it with one of each</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
