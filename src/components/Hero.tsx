"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FLAVOURS } from "@/lib/flavours";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, POP, gsap, useGSAP } from "@/lib/motion";
import { Stars } from "./Bits";
import styles from "./Hero.module.css";

/* Stat bubbles orbiting the bag, each with a dotted leader running back to it.
   x/y are percentages of the square stage, so the SVG viewBox maps 1:1.
   Three are true of every bag; the fourth reads off the selected flavour. */
const BUBBLES = [
  { x: 9, y: 19, big: "0g", small: "palm oil", to: [35, 33] },
  { x: 90, y: 16, big: "100%", small: "roasted", to: [65, 30] },
  { x: 7, y: 76, big: "5g", small: "sugar", to: [35, 68] },
  { x: 92, y: 72, big: null, small: "heat", to: [66, 65] },
];

export function Hero() {
  const [index, setIndex] = useState(1);
  const active = FLAVOURS[index];

  const root = useRef<HTMLElement>(null);
  const pack = useRef<HTMLDivElement>(null);
  const packs = useRef<(HTMLImageElement | null)[]>([]);
  const first = useRef(true);

  /* The selected bag themes the whole document, not just this section. */
  useEffect(() => {
    const el = document.documentElement;
    const { ground, fill, text, onFill } = active.theme;
    el.style.setProperty("--ground", ground);
    el.style.setProperty("--accent", fill);
    el.style.setProperty("--accent-text", text);
    el.style.setProperty("--accent-on", onFill);
  }, [active]);

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
          .from(`.${styles.pick}`, { opacity: 0, y: 14, duration: 0.45, stagger: 0.06 }, "-=0.4")
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

  /* Crossfade the bag when the flavour changes — but not on first paint. */
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        packs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            opacity: i === index ? 1 : 0,
            scale: i === index ? 1 : 0.92,
            duration: 0.45,
            ease: i === index ? POP : EASE,
          });
        });
      });
      mm.add(MOTION_OFF, () => {
        packs.current.forEach((el, i) => el && gsap.set(el, { opacity: i === index ? 1 : 0 }));
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [index] },
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

        <div className={styles.product}>
          <div className={styles.stage}>
            <svg className={styles.leader} viewBox="0 0 100 100" aria-hidden="true">
              {BUBBLES.map((b) => (
                <line key={b.big} x1={b.x} y1={b.y} x2={b.to[0]} y2={b.to[1]} />
              ))}
            </svg>

            <div className={styles.packWrap} ref={pack}>
              {FLAVOURS.map((f, i) => (
                <Image
                  key={f.id}
                  ref={(el) => {
                    packs.current[i] = el;
                  }}
                  src={f.pack}
                  alt={`Makzo's ${f.name} roasted makhana, 55 g pack`}
                  width={347}
                  height={460}
                  priority={i === 1}
                  className={styles.pack}
                  data-on={i === index || undefined}
                />
              ))}
            </div>

            {BUBBLES.map((b) => (
              <span
                key={b.big}
                className={styles.bubble}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              >
                <span className={`u-display ${styles.bubbleBig}`}>
                  {b.big ?? `${active.heat}/5`}
                </span>
                <span className={`u-label ${styles.bubbleSmall}`}>{b.small}</span>
              </span>
            ))}
          </div>

          <div className={styles.picker} role="tablist" aria-label="Choose a flavour">
            {FLAVOURS.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={styles.pick}
                data-on={i === index || undefined}
                style={{ "--swatch": f.theme.fill } as React.CSSProperties}
                onClick={() => setIndex(i)}
              >
                <span className={styles.swatch} aria-hidden="true" />
                {f.short}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
