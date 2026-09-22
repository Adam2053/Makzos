"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import styles from "./LaunchHero.module.css";

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
          .from(`.${styles.footer}`, { opacity: 0, y: 12, duration: 0.55 }, "-=0.45");

        gsap.to(`.${styles.orbit}`, { rotation: 360, duration: 28, repeat: -1, ease: "none", force3D: true });
        gsap.to(`.${styles.sun}`, { scale: 1.045, duration: 3.2, repeat: -1, yoyo: true, ease: EASE_SOFT, force3D: true });
        gsap.to(`.${styles.halo}`, { scale: 1.04, opacity: 0.72, duration: 3.2, repeat: -1, yoyo: true, ease: EASE_SOFT, force3D: true });
        gsap.to(`.${styles.statusDot}`, { scale: 1.22, opacity: 1, duration: 1.15, repeat: -1, yoyo: true, ease: EASE_SOFT, force3D: true });
      });

      mm.add(MOTION_OFF, () => gsap.set([`.${styles.halo}`, `.${styles.sun}`, `.${styles.orbit}`], { opacity: 1 }));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main className={styles.page}>
      <section ref={root} className={styles.hero} aria-labelledby="launch-title">
        <header className={styles.header}>
          <Image src="/brand/logo-light.png" alt="Makzo's" width={1200} height={330} priority className={styles.logo} />
        </header>

        <div className={styles.copy}>
          <div className={styles.circleScene} aria-hidden="true">
            <div className={styles.halo} />
            <div className={styles.sun} />
            <div className={styles.orbit}><span /><span /><span /></div>
          </div>
          <p className={styles.eyebrow}>Roasted makhana, reimagined.</p>
          <h1 id="launch-title" className={styles.title}>
            Your new
            <span>snack ritual</span>
            lands soon.
          </h1>
          <p className={styles.intro}>Big flavour. Honest crunch. Four packs worth making room for.</p>
          <div className={styles.status}><span className={styles.statusDot} aria-hidden="true" />Launching soon</div>
        </div>

        <footer className={styles.footer}>
          <p>Four flavours. One very good reason to wait.</p>
          <p>India</p>
        </footer>
      </section>
    </main>
  );
}
