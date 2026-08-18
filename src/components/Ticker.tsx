"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import styles from "./Ticker.module.css";

const CLAIMS = [
  "Roasted, never fried",
  "No palm oil",
  "Grown in Bihar",
  "Free delivery over ₹499",
  "Nothing artificial",
];

export function Ticker() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(track.current, { xPercent: -50, duration: 34, ease: "none", repeat: -1 });
      });
      return () => mm.revert();
    },
    { scope: track },
  );

  return (
    <div className={styles.strip} aria-hidden="true">
      <div ref={track} className={styles.track}>
        {[0, 1].map((copy) => (
          <div key={copy} className={styles.run}>
            {[...CLAIMS, ...CLAIMS].map((c, i) => (
              <span key={`${copy}-${i}`} className={`u-label ${styles.item}`}>
                <span className={styles.dot}>✦</span>
                {c}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
