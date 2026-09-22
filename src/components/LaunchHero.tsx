"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import styles from "./LaunchHero.module.css";

const PACKS = [
  { src: "/brand/pack-curry-leaves.png", alt: "Makzo's Curry Leaves & Chilli roasted makhana pack", className: styles.curry },
  { src: "/brand/pack-mac-cheese.png", alt: "Makzo's Mac & Cheese roasted makhana pack", className: styles.mac },
  { src: "/brand/pack-chettinadu.png", alt: "Makzo's Chettinadu roasted makhana pack", className: styles.chettinadu },
  { src: "/brand/pack-thai-chilli.png", alt: "Makzo's Thai Chilli roasted makhana pack", className: styles.thai },
];

export function LaunchHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const intro = gsap.timeline({ defaults: { ease: EASE } });
        intro
          .from(`.${styles.header}`, { opacity: 0, y: 18, duration: 0.65 })
          .from(`.${styles.eyebrow}`, { opacity: 0, y: 18, duration: 0.6 }, "-=0.35")
          .from(`.${styles.title}`, { opacity: 0, y: 28, duration: 0.85 }, "-=0.42")
          .from([`.${styles.intro}`, `.${styles.status}`], { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, "-=0.5")
          .from(`.${styles.pack}`, { opacity: 0, y: 42, scale: 0.94, duration: 0.9, stagger: 0.08 }, "-=0.75")
          .from(`.${styles.footer}`, { opacity: 0, y: 12, duration: 0.55 }, "-=0.45");

        gsap.to(`.${styles.orbit}`, { rotation: 360, duration: 28, repeat: -1, ease: "none", force3D: true });
        gsap.to(`.${styles.sun}`, { scale: 1.035, duration: 3.2, repeat: -1, yoyo: true, ease: EASE_SOFT, force3D: true });
        gsap.to(`.${styles.statusDot}`, { scale: 1.22, opacity: 1, duration: 1.15, repeat: -1, yoyo: true, ease: EASE_SOFT, force3D: true });

        gsap.utils.toArray<HTMLElement>(`.${styles.pack}`).forEach((pack, index) => {
          gsap.to(pack, {
            y: index % 2 === 0 ? -11 : -8,
            duration: 2.6 + index * 0.22,
            delay: index * -0.45,
            repeat: -1,
            yoyo: true,
            ease: EASE_SOFT,
            force3D: true,
          });
        });
      });

      mm.add(MOTION_OFF, () => gsap.set(`.${styles.pack}`, { opacity: 1 }));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main className={styles.page}>
      <section ref={root} className={styles.hero} aria-labelledby="launch-title">
        <header className={styles.header}>
          <Image src="/brand/logo-light.png" alt="Makzo's" width={1200} height={330} priority className={styles.logo} />
          <p className={styles.headerNote}>Roasted makhana, reimagined.</p>
        </header>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>Something crunchy is coming</p>
          <h1 id="launch-title" className={styles.title}>
            Your new
            <span>snack ritual</span>
            lands soon.
          </h1>
          <p className={styles.intro}>Big flavour. Honest crunch. Four packs worth making room for.</p>
          <div className={styles.status}><span className={styles.statusDot} aria-hidden="true" />Launching soon</div>
        </div>

        <div className={styles.display} aria-label="Four upcoming Makzo's flavours">
          <div className={styles.sun} aria-hidden="true" />
          <div className={styles.orbit} aria-hidden="true"><span /><span /><span /></div>
          <div className={styles.packs}>
            {PACKS.map((pack) => (
              <div key={pack.src} className={`${styles.pack} ${pack.className}`}>
                <Image src={pack.src} alt={pack.alt} width={759} height={1008} priority sizes="(max-width: 720px) 31vw, 18vw" />
              </div>
            ))}
          </div>
          <div className={styles.shadow} aria-hidden="true" />
        </div>

        <footer className={styles.footer}>
          <p>Four flavours. One very good reason to wait.</p>
          <p>India</p>
        </footer>
      </section>
    </main>
  );
}
