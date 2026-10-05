"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, FLAVOURS, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { EASE, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Menu.module.css";

/** Two columns with a pinned preview only where there's room for one, and motion is welcome. */
const SPLIT = "(min-width: 961px)";

/**
 * Real dishes, so the range is laid out as a menu: name, a dotted leader, the price.
 * Beside it a preview stays put while you read down the list, and always shows the
 * dish your eye is on, whether you got there by scrolling or by pointing.
 */
export function Menu() {
  const [active, setActive] = useState(0);
  const { addBag } = useCart();
  const root = useRef<HTMLElement>(null);
  const packRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dishRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shown = useRef(0);

  // Whichever row crosses the middle of the screen is the one on the plate.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SPLIT, () => {
        const triggers = gsap.utils.toArray<HTMLElement>(`.${styles.row}`).map((row, i) =>
          ScrollTrigger.create({ trigger: row, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && setActive(i) }),
        );
        return () => triggers.forEach((t) => t.kill());
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // The swap: the old pack drops away, the new one lands, the dish opens from its centre.
  useGSAP(
    () => {
      const from = shown.current;
      if (from === active) return;
      shown.current = active;
      const out = packRefs.current[from], into = packRefs.current[active];
      const dishOut = dishRefs.current[from], dishIn = dishRefs.current[active];
      if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        gsap.set([out, dishOut], { autoAlpha: 0 });
        gsap.set([into, dishIn], { autoAlpha: 1 });
        return;
      }
      gsap.killTweensOf([out, into, dishOut, dishIn]);
      gsap.to(out, { yPercent: 30, rotation: 12, autoAlpha: 0, duration: 0.35, ease: "power2.in" });
      gsap.fromTo(into, { yPercent: -30, rotation: -14, autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.75, delay: 0.12, ease: "back.out(1.7)" });
      gsap.set(dishOut, { zIndex: 1 });
      gsap.set(dishIn, { zIndex: 2, autoAlpha: 1 });
      gsap.fromTo(dishIn, { clipPath: "circle(0% at 50% 50%)" }, {
        clipPath: "circle(75% at 50% 50%)", duration: 0.7, ease: EASE,
        onComplete: () => void gsap.set(dishOut, { autoAlpha: 0 }),
      });
      gsap.fromTo(`.${styles.sticker}`, { scale: 0.6, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, delay: 0.3, ease: "back.out(3)" });
    },
    { scope: root, dependencies: [active] },
  );

  const f = FLAVOURS[active];

  return (
    <section id="flavours" ref={root} className={styles.section} aria-labelledby="menu-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <header className={styles.head}>
          <h2 id="menu-title" className={`${ui.display} ${styles.title}`}>Seven dishes.<br />One crunch.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Every bag is {WEIGHT} of roasted makhana, seasoned after a dish you already know.</p>
        </header>

        {/* The preview: the flavour's own colour, its dish on a plate, its pack in front. */}
        <div className={styles.previewCol} aria-hidden="true">
          <div className={styles.preview} style={{ "--field": f.field } as React.CSSProperties}>
            <div className={styles.disc} />
            <div className={styles.plate}>
              {FLAVOURS.map((x, i) => (
                <div key={x.id} ref={(el) => { dishRefs.current[i] = el; }} className={styles.dish}>
                  <Image src={x.dish.src} alt="" fill sizes="20vw"
                    style={{ objectPosition: `${x.dish.spot[0] * 100}% ${x.dish.spot[1] * 100}%`, transformOrigin: `${x.dish.spot[0] * 100}% ${x.dish.spot[1] * 100}%` }} />
                </div>
              ))}
            </div>
            <div className={styles.packs}>
              {FLAVOURS.map((x, i) => (
                <div key={x.id} ref={(el) => { packRefs.current[i] = el; }} className={styles.pack}>
                  <Image src={x.pack} alt="" width={PACK_W} height={PACK_H} sizes="(max-width: 1400px) 22vw, 300px" />
                </div>
              ))}
            </div>
            {/* A price sticker slapped on the bag, as at a shop counter. */}
            <p className={styles.sticker}><span>{inr(BAG_PRICE)}</span><small>{WEIGHT}</small></p>
            <Makhana variant="outline" className={styles.seedA} />
            <Makhana variant="fill" className={styles.seedB} />
          </div>
        </div>

        <ol className={styles.list}>
          {FLAVOURS.map((x, i) => (
            <li key={x.id} className={styles.row} data-active={i === active || undefined}
              style={{ "--field": x.field } as React.CSSProperties}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}>
              <div className={styles.thumb}>
                <Image src={x.pack} alt="" width={PACK_W} height={PACK_H} sizes="96px" />
              </div>
              <div className={styles.body}>
                <h3 className={styles.dishLine}>
                  <Makhana variant="fill" className={styles.rowSeed} />
                  <span className={`${ui.display} ${styles.name}`}>{x.name}</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={`${ui.display} ${styles.price}`}><span className={ui.sr}>, </span>{inr(BAG_PRICE)}</span>
                </h3>
                <p className={styles.inspired}>{x.inspired} <span className={styles.quote}>&ldquo;{x.line}&rdquo;</span></p>
                <button type="button" className={`${ui.btn} ${styles.add}`} aria-label={`Add ${x.name} to bag, ${inr(BAG_PRICE)}`}
                  onFocus={() => setActive(i)}
                  onClick={(e) => {
                    setActive(i);
                    const visible = window.matchMedia(SPLIT).matches ? packRefs.current[i] : e.currentTarget.closest("li")?.querySelector(`.${styles.thumb}`);
                    addBag(x.id, visible?.querySelector("img"));
                  }}>
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
                  Add to bag
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
