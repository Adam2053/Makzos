"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, POP, gsap, useGSAP } from "@/lib/motion";
import { Stars } from "./Bits";
import styles from "./Hero.module.css";

/* Stat bubbles orbiting the bag, each with a dotted leader running back to it.
   x/y are percentages of the square stage, so the SVG viewBox maps 1:1. */
const BUBBLES = [
  { x: 9, y: 19, big: "0g", small: "palm oil", to: [35, 33] },
  { x: 90, y: 16, big: "100%", small: "roasted", to: [65, 30] },
  { x: 7, y: 76, big: "5g", small: "sugar", to: [35, 68] },
  { x: 92, y: 72, big: "55g", small: "per bag", to: [66, 65] },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const pack = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: EASE } })
          .from(`.${styles.chip}`, { opacity: 0, y: 16, duration: 0.55 })
          .from(`.${styles.headline}`, { opacity: 0, y: 26, duration: 0.75 }, "-=0.3")
          .from(`.${styles.sub}`, { opacity: 0, y: 18, duration: 0.6 }, "-=0.45")
          .from(`.${styles.offer} > *`, { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, "-=0.35")
          .from(`.${styles.proof}`, { opacity: 0, duration: 0.5 }, "-=0.3")
          .from(pack.current, { opacity: 0, scale: 0.9, duration: 0.8, ease: POP }, "-=0.75")
          .from(`.${styles.leader}`, { opacity: 0, duration: 0.5 }, "-=0.3")
          .from(
            `.${styles.bubble}`,
            { opacity: 0, scale: 0, duration: 0.5, ease: POP, stagger: 0.07 },
            "-=0.35",
          );

        /* The bag breathes; the bubbles hold their orbit. */
        gsap.to(pack.current, {
          y: -12,
          duration: 3.2,
          ease: EASE_SOFT,
          yoyo: true,
          repeat: -1,
          delay: 1.4,
        });
      });

      mm.add(MOTION_OFF, () => {
        gsap.set(
          [`.${styles.chip}`, `.${styles.headline}`, `.${styles.sub}`, `.${styles.offer} > *`,
           `.${styles.proof}`, pack.current, `.${styles.bubble}`, `.${styles.leader}`],
          { opacity: 1, scale: 1, y: 0 },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="top" className={styles.hero} ref={root}>
      <div className={`u-shell ${styles.capsule} u-capsule`}>
        <div className={styles.copy}>
          <p className={`u-label ${styles.chip}`}>Roasted makhana · four flavours</p>

          <h1 className={`u-display ${styles.headline}`}>
            Snack light,
            <br />
            <span className={styles.hot}>taste loud.</span>
          </h1>

          <p className={`u-lede ${styles.sub}`}>
            Lotus seeds, puffed and roasted — never fried — then seasoned with
            spice we went and found. Nothing artificial, nothing unnecessary.
          </p>

          <div className={styles.offer}>
            <span className={styles.code}>
              <span className={`u-label ${styles.codeLabel}`}>First order</span>
              MAKZO15
            </span>
            <a href="#shop" className={`u-pill ${styles.cta}`}>
              Use discount
            </a>
          </div>

          <p className={styles.proof}>
            <Stars value={4.8} />
            <span>
              <strong>4.8</strong> · 959 reviews
            </span>
          </p>
        </div>

        <div className={styles.stage}>
          <svg className={styles.leader} viewBox="0 0 100 100" aria-hidden="true">
            {BUBBLES.map((b) => (
              <line key={b.big} x1={b.x} y1={b.y} x2={b.to[0]} y2={b.to[1]} />
            ))}
          </svg>

          <div className={styles.packWrap} ref={pack}>
            <Image
              src="/brand/pack-thai-chilli.png"
              alt="Makzo's Sweet Thai Chilli roasted makhana, 55 g pack"
              width={347}
              height={460}
              priority
              className={styles.pack}
            />
          </div>

          {BUBBLES.map((b) => (
            <span
              key={b.big}
              className={styles.bubble}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <span className={`u-display ${styles.bubbleBig}`}>{b.big}</span>
              <span className={`u-label ${styles.bubbleSmall}`}>{b.small}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
