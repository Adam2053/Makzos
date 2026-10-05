"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, BOX_PRICE, FLAVOURS, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Hero.module.css";

/** Degrees between neighbouring packs in the hand. */
const SPREAD = 9;
/** The hand opens on the middle card. */
const START = 3;

/**
 * All seven packs held like a hand of cards. They're dealt out from one pile on load;
 * picking one lifts it out of the hand and puts its name and price on the line below.
 */
export function Hero() {
  const [picked, setPicked] = useState(START);
  const f = FLAVOURS[picked];
  const { addBag } = useCart();
  const root = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);

  const angle = (i: number) => (i - (FLAVOURS.length - 1) / 2) * SPREAD;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.timeline({ defaults: { ease: "expo.out" } })
          .from(q(`.${styles.line} > span`), { yPercent: 105, duration: 1, stagger: 0.1 }, 0.1)
          .from(q(`.${styles.sub}`), { autoAlpha: 0, y: 14, duration: 0.7 }, 0.35)
          // Dealt from a single pile at the centre, then fanned.
          .from(q(`.${styles.card}`), { rotation: 0, yPercent: 60, autoAlpha: 0, duration: 1.1, stagger: { each: 0.06, from: "center" }, ease: "back.out(1.3)", clearProps: "transform,opacity,visibility" }, 0.45)
          .from(q(`.${styles.buy}`), { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.5")
          .from(q(`.${styles.seed}`), { scale: 0, duration: 0.8, stagger: 0.1, ease: "back.out(2.4)" }, "-=0.6");
        q(`.${styles.seed}`).forEach((el, i) => {
          gsap.to(el, { y: i % 2 ? 12 : -12, rotation: i % 2 ? -12 : 12, duration: 2.6 + i * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const pick = (i: number) => {
    setPicked(i);
    // A small shrug through the hand, outward from the chosen card.
    if (window.matchMedia(MOTION_OK).matches) {
      cards.current.forEach((c, j) => {
        const inner = c?.firstElementChild;
        if (inner && j !== i) gsap.fromTo(inner, { x: 0 }, { x: Math.sign(j - i) * 10, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", delay: Math.abs(j - i) * 0.03 });
      });
    }
  };

  return (
    <section id="top" ref={root} className={styles.hero} aria-labelledby="hero-title">
      <Makhana variant="outline" className={`${styles.seed} ${styles.seedA}`} />
      <Makhana variant="fill" className={`${styles.seed} ${styles.seedB}`} />
      <Makhana variant="outline" className={`${styles.seed} ${styles.seedC}`} />

      <div className={`${ui.shell} ${styles.inner}`}>
        <h1 id="hero-title" className={`${ui.display} ${styles.title}`}>
          <span className={styles.line}><span>Familiar dishes.</span></span>
          <span className={styles.line}><span>A different crunch.</span></span>
        </h1>
        <p className={`${ui.lede} ${styles.sub}`}>Roasted makhana in seven flavours, each built around a dish you already know. {WEIGHT} a bag.</p>

        <div className={styles.hand} role="group" aria-label="Pick a flavour">
          {FLAVOURS.map((x, i) => (
            <button key={x.id} ref={(el) => { cards.current[i] = el; }} type="button" className={styles.card}
              style={{ "--a": `${angle(i)}deg`, zIndex: i === picked ? 20 : 10 - Math.abs(i - picked) } as React.CSSProperties}
              aria-pressed={i === picked} aria-label={x.name} onClick={() => pick(i)}>
              <span className={styles.lift}>
                <Image src={x.pack} alt="" width={PACK_W} height={PACK_H} sizes="(max-width: 700px) 30vw, 200px" loading={Math.abs(i - START) < 2 ? "eager" : "lazy"} />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.buy}>
          <p className={styles.picked} aria-live="polite">
            <span className={`${ui.display} ${styles.pickedName}`}>{f.name}</span>
            <span className={styles.pickedLine}>{f.inspired}</span>
          </p>
          <div className={styles.ctas}>
            <button type="button" className={ui.btn} onClick={() => addBag(f.id, cards.current[picked]?.querySelector("img"))}>
              Add {f.name}, {inr(BAG_PRICE)}
            </button>
            <a href="#offers" className={ui.btnLine}>Or a box of 4, {inr(BOX_PRICE)}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
