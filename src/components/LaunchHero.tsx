"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import styles from "./LaunchHero.module.css";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

/**
 * Hand-scattered so server and client render the same thing. Colours are the four
 * pack accents; `offset` rotates the state list so neighbouring strips never line up.
 */
const STRIPS = [
  { top: 7, rot: -7, color: "#F0A21C", speed: 150, reverse: false, offset: 0 },
  { top: 19, rot: 4, color: "#2FC2E2", speed: 190, reverse: true, offset: 9 },
  { top: 33, rot: -13, color: "#F2402A", speed: 130, reverse: false, offset: 17 },
  { top: 52, rot: 9, color: "#CBE05C", speed: 170, reverse: true, offset: 4 },
  { top: 66, rot: -4, color: "#F0A21C", speed: 210, reverse: false, offset: 22 },
  { top: 80, rot: 12, color: "#F2402A", speed: 140, reverse: true, offset: 13 },
  { top: 93, rot: -9, color: "#2FC2E2", speed: 180, reverse: false, offset: 6 },
];

export function LaunchHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // The mark sits at 72% of the lockup; shift it to the page centre until the name opens out.
        gsap.set(`.${styles.lockup}`, { xPercent: -22.08 });
        gsap.set(`.${styles.left} img`, { xPercent: 100 });
        gsap.set(`.${styles.right} img`, { xPercent: -100 });

        const intro = gsap
          .timeline({ delay: 0.25 })
          .from(`.${styles.mark}`, { scale: 0, rotation: -24, duration: 0.9, ease: "back.out(2.2)", transformOrigin: "50% 60%" })
          .to(`.${styles.lockup}`, { xPercent: 0, duration: 1.05, ease: "expo.inOut" }, "+=0.35")
          .to([`.${styles.left} img`, `.${styles.right} img`], { xPercent: 0, duration: 1.05, ease: "expo.inOut" }, "<")
          .fromTo(`.${styles.strip}`, { clipPath: "inset(0 50% 0 50%)" }, {
            clipPath: "inset(0 0% 0 0%)",
            duration: 0.9,
            ease: EASE,
            stagger: { each: 0.06, from: "center" },
          }, "<0.35")
          .from([`.${styles.pool}`, `.${styles.grid}`], { opacity: 0, duration: 1.2 }, "<")
          // Only once everything has landed does the page say what it's for.
          .from(`.${styles.tagline}`, { opacity: 0, y: 14, filter: "blur(6px)", duration: 0.8, ease: EASE }, ">0.15")
          .addLabel("idle", "<");

        // After the reveal the makhana never quite sits still: a lazy bob and a wobble on different beats.
        intro
          .to(`.${styles.mark}`, { y: -8, duration: 1.3, repeat: -1, yoyo: true, ease: EASE_SOFT }, "idle")
          .fromTo(`.${styles.mark}`, { rotation: -5 }, { rotation: 5, immediateRender: false, duration: 1.9, repeat: -1, yoyo: true, ease: EASE_SOFT }, "idle");
        gsap.to(`.${styles.gridGlow}`, { opacity: 0.35, duration: 2.6, repeat: -1, yoyo: true, ease: EASE_SOFT });
      });

      mm.add(MOTION_OFF, () => gsap.set(`.${styles.lockup}`, { xPercent: 0 }));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.page}>
      <div className={styles.grid} aria-hidden="true"><div className={styles.gridGlow} /></div>

      <div className={styles.strips} aria-hidden="true">
        {STRIPS.map((s, i) => {
          const run = [...STATES.slice(s.offset), ...STATES.slice(0, s.offset)];
          return (
            <div
              key={i}
              className={styles.strip}
              style={{ top: `${s.top}%`, rotate: `${s.rot}deg`, background: s.color }}
            >
              <div
                className={styles.track}
                style={{ animationDuration: `${s.speed}s`, animationDirection: s.reverse ? "reverse" : "normal" }}
              >
                {[0, 1].map((copy) => (
                  <div key={copy} className={styles.run}>
                    {run.map((state) => <span key={state}>{state}</span>)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.pool} aria-hidden="true" />

      <div className={styles.center}>
        <h1 className={styles.lockup}>
          <span className={styles.sr}>Makzo&rsquo;s</span>
          <span className={styles.left}><Image src="/brand/logo-left.png" alt="" width={742} height={296} priority /></span>
          <Image className={styles.mark} src="/brand/logo-mark.png" alt="" width={246} height={296} priority />
          <span className={styles.right}><Image src="/brand/logo-right.png" alt="" width={212} height={296} priority /></span>
        </h1>
        <p className={styles.tagline}><span className={styles.dot} aria-hidden="true" />Launching soon</p>
      </div>
    </main>
  );
}
