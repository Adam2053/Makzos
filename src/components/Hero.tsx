"use client";

import Image from "next/image";
import { useRef } from "react";
import { FLAVOURS } from "@/lib/flavours";
import { EASE_SOFT, MOTION_OK, POP, gsap, useGSAP } from "@/lib/motion";
import { Stars } from "./Bits";
import styles from "./Hero.module.css";

/* Scattered puffs, placed by hand so they frame the packs instead of landing on
   them. Values are % of the stage box. */
const CONFETTI = [
  { x: -2, y: 8, s: 78, r: -18 },
  { x: 12, y: 74, s: 54, r: 24 },
  { x: 44, y: -6, s: 46, r: 12 },
  { x: 86, y: 12, s: 68, r: -10 },
  { x: 72, y: 84, s: 56, r: 30 },
  { x: 95, y: 58, s: 40, r: -26 },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const packs = useRef<(HTMLDivElement | null)[]>([]);
  const puffs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: POP } })
          .from(`.${styles.kicker}`, { opacity: 0, y: 18, duration: 0.6 })
          .from(`.${styles.line}`, { opacity: 0, y: 34, duration: 0.75, stagger: 0.1 }, "-=0.35")
          .from(`.${styles.sub}`, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
          .from(`.${styles.cta} > *`, { opacity: 0, y: 20, duration: 0.55, stagger: 0.08 }, "-=0.35")
          .from(
            packs.current.filter(Boolean),
            { opacity: 0, y: 70, rotate: 0, duration: 0.8, stagger: 0.09 },
            "-=0.7",
          )
          .from(puffs.current.filter(Boolean), { opacity: 0, scale: 0, duration: 0.5, stagger: 0.05 }, "-=0.5");

        /* The packs land once and stay put. What keeps moving is the makhana:
           each puff runs a slow loop, drawn as two quarter-phase-offset sine
           tweens, so x and y together trace a circle. */
        puffs.current.forEach((el, i) => {
          if (!el) return;
          const radius = 10 + (i % 3) * 6;
          const period = 5.5 + i * 0.9;
          gsap.fromTo(
            el,
            { x: -radius },
            { x: radius, duration: period, ease: EASE_SOFT, yoyo: true, repeat: -1 },
          );
          gsap.fromTo(
            el,
            { y: -radius },
            { y: radius, duration: period, ease: EASE_SOFT, yoyo: true, repeat: -1, delay: period / 2 },
          );
          gsap.to(el, {
            rotation: i % 2 ? 360 : -360,
            duration: 40 + i * 8,
            ease: "none",
            repeat: -1,
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="top" className={styles.hero} ref={root}>
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={`u-label ${styles.kicker}`}>
            <span className={styles.kickerPill}>Roasted makhana</span> 55 g · four flavours
          </p>

          <h1 className={`u-display u-rough ${styles.headline}`}>
            <span className={styles.line}>Halka snack,</span>
            <span className={`${styles.line} ${styles.lineHot}`}>bhari swad.</span>
          </h1>

          <p className={`u-lede ${styles.sub}`}>
            Lotus seeds puffed and roasted — never fried — then seasoned with
            spice we went and found. Light on everything except flavour.
          </p>

          <div className={styles.cta}>
            <a href="#flavours" className={styles.buy}>
              Shop all four <span aria-hidden="true">→</span>
            </a>
            <a href="#box" className={styles.alt}>
              Try the box · ₹220
            </a>
          </div>

          <p className={styles.proof}>
            <Stars value={4.8} />
            <span>
              <strong>4.8</strong> from 959 snackers
            </span>
          </p>
        </div>

        <div className={styles.stage}>
          {CONFETTI.map((c, i) => (
            <div
              key={i}
              ref={(el) => {
                puffs.current[i] = el;
              }}
              className={styles.puff}
              style={
                {
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: `${c.s}px`,
                  rotate: `${c.r}deg`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <Image src="/brand/puff.png" alt="" width={226} height={296} />
            </div>
          ))}

          {FLAVOURS.map((f, i) => (
            <div
              key={f.id}
              ref={(el) => {
                packs.current[i] = el;
              }}
              className={styles.packSlot}
              style={{ "--i": i } as React.CSSProperties}
            >
              <Image
                src={f.pack}
                alt={`Makzo's ${f.name} roasted makhana, 55 g pack`}
                width={347}
                height={460}
                priority={i < 2}
                className={styles.pack}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
