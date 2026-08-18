"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import styles from "./Marquee.module.css";

const PHRASES = [
  "Nothing artificial",
  "Nothing unnecessary",
  "Roasted, never fried",
  "55 g",
];

export function Marquee() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      /* Two identical runs; shifting one full run reads as an endless band. */
      mm.add(MOTION_OK, () => {
        gsap.to(track.current, {
          xPercent: -50,
          duration: 46,
          ease: "none",
          repeat: -1,
        });
      });
      return () => mm.revert();
    },
    { scope: track },
  );

  const run = [...PHRASES, ...PHRASES, ...PHRASES];

  return (
    <div className={styles.band} aria-hidden="true">
      <div ref={track} className={styles.track}>
        {[0, 1].map((copy) => (
          <div key={copy} className={styles.run}>
            {run.map((p, i) => (
              <span key={`${copy}-${i}`} className={`u-mono ${styles.item}`}>
                {p}
                <span className={styles.sep}>◦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className={styles.sr}>Nothing artificial, nothing unnecessary.</p>
    </div>
  );
}
