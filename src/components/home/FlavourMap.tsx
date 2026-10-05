"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, FLAVOURS, PACK_H, PACK_W, WEIGHT, byId, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import ui from "./ui.module.css";
import styles from "./FlavourMap.module.css";

/**
 * Where each flavour sits, as a rough guide from the dish it's built around:
 * x runs mild (0) to spicy (1), y runs savoury (0) to sweet (1). Not a measurement.
 */
const PLACES: Record<string, [x: number, y: number]> = {
  "mac-cheese": [0.16, 0.3],
  "curry-leaves": [0.36, 0.14],
  rasam: [0.62, 0.32],
  chettinadu: [0.86, 0.12],
  "thai-chilli": [0.8, 0.68],
  "sweet-tamarind": [0.44, 0.76],
  tiramisu: [0.12, 0.88],
};

export function FlavourMap() {
  const [active, setActive] = useState("rasam");
  const f = byId(active);
  const { addBag } = useCart();
  const root = useRef<HTMLElement>(null);

  // Pins drop onto the map the first time it scrolls into view.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(`.${styles.pin}`, {
        scale: 0, y: -30, duration: 0.7, stagger: 0.07, ease: "back.out(2.5)",
        scrollTrigger: { trigger: `.${styles.map}`, start: "top 75%", once: true },
      });
      gsap.from(`.${styles.axis}`, { scale: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: `.${styles.map}`, start: "top 75%", once: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  // The card answers the pick.
  useGSAP(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    gsap.fromTo(`.${styles.cardPack}`, { yPercent: 20, rotation: -14, autoAlpha: 0 }, { yPercent: 0, rotation: -5, autoAlpha: 1, duration: 0.6, ease: "back.out(1.8)" });
    gsap.fromTo(`.${styles.cardText} > *`, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: EASE });
  }, { scope: root, dependencies: [active] });

  return (
    <section id="map" ref={root} className={styles.section} aria-labelledby="map-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <header className={styles.head}>
          <h2 id="map-title" className={`${ui.display} ${styles.title}`}>The flavour map.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Mild or spicy, savoury or sweet. Tap a pack to see where it sits.</p>
        </header>

        <div className={styles.map} role="group" aria-label="Flavours from mild to spicy and savoury to sweet">
          <span className={`${styles.axis} ${styles.axisX}`} aria-hidden="true" />
          <span className={`${styles.axis} ${styles.axisY}`} aria-hidden="true" />
          <span className={`${styles.label} ${styles.lMild}`}>Mild</span>
          <span className={`${styles.label} ${styles.lSpicy}`}>Spicy</span>
          <span className={`${styles.label} ${styles.lSweet}`}>Sweet</span>
          <span className={`${styles.label} ${styles.lSavoury}`}>Savoury</span>
          {FLAVOURS.map((x) => {
            const [px, py] = PLACES[x.id];
            return (
              <button key={x.id} type="button" className={styles.pin} aria-pressed={x.id === active} onClick={() => setActive(x.id)}
                style={{ left: `${6 + px * 88}%`, top: `${6 + (1 - py) * 88}%`, "--field": x.field } as React.CSSProperties}>
                <span className={styles.pinFace}><Image src={x.pack} alt="" width={PACK_W} height={PACK_H} sizes="72px" /></span>
                <span className={styles.pinName}>{x.name}</span>
              </button>
            );
          })}
        </div>

        <aside className={styles.card} style={{ "--field": f.field, "--ink": f.ink } as React.CSSProperties} aria-live="polite">
          <div className={styles.cardPack}><Image src={f.pack} alt={`${f.name} pack`} width={PACK_W} height={PACK_H} sizes="200px" /></div>
          <div className={styles.cardText}>
            <h3 className={`${ui.display} ${styles.cardName}`}>{f.name}</h3>
            <p className={styles.cardLine}>{f.inspired} &ldquo;{f.line}&rdquo;</p>
            <p className={styles.cardMeta}>{WEIGHT}, {inr(BAG_PRICE)}</p>
            <button type="button" className={f.ink === "#ffffff" ? ui.btnLight : ui.btn}
              onClick={(e) => addBag(f.id, e.currentTarget.closest("aside")?.querySelector("img"))}>
              Add {f.name}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
