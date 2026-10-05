"use client";

import { useRef } from "react";
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "./Makhana";
import styles from "./ClaimsBand.module.css";

/** Brief-approved claims only (guide p.9). */
const CLAIMS = ["No preservatives", "No artificial colours or flavours", "No INS-coded additives", "Made with makhana"];

export function ClaimsBand() {
  const band = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Two identical runs; shifting by one run reads as an endless band.
        const loop = gsap.to(`.${styles.track}`, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
        // Each mark rolls a full turn per pass, as if the band were a conveyor of seeds.
        gsap.to(`.${styles.mark}`, { rotation: 360, duration: 8, ease: "none", repeat: -1 });
        // Scrolling leans on it: the band speeds up with the page, and reverses when you scroll back up.
        const st = ScrollTrigger.create({
          trigger: band.current, start: "top bottom", end: "bottom top",
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 250);
            gsap.to(loop, { timeScale: v === 0 ? 1 : v, duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: Math.sign(v || 1), duration: 1.2, delay: 0.2, ease: "power2.out" });
          },
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: band },
  );

  return (
    <div ref={band} className={styles.band}>
      <ul className={styles.sr}>{CLAIMS.map((c) => <li key={c}>{c}</li>)}</ul>
      <div className={styles.ribbon} aria-hidden="true">
      <div className={styles.track}>
        {[0, 1].map((run) => (
          <div key={run} className={styles.run}>
            {[...CLAIMS, ...CLAIMS].map((c, i) => (
              <span key={i} className={styles.item}>
                {c}
                {/* Filled, then outlined, then filled: the mark changes coat as it rolls past. */}
                <Makhana variant={i % 2 ? "outline" : "fill"} className={styles.mark} />
              </span>
            ))}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
