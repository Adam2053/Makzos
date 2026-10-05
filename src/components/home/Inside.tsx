"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Inside.module.css";

/** Brief-approved claims only (guide p.9). Nothing about protein, fat, calories or "guilt-free". */
const CLAIMS = ["No preservatives", "No artificial colours or flavours", "No INS-coded additives", "Made with makhana"];

export function Inside() {
  const root = useRef<HTMLElement>(null);

  // The big makhana turns as you read down the list, and each bullet pops as its line arrives.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(`.${styles.big}`, { rotation: -30 }, { rotation: 30, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.utils.toArray<HTMLElement>(`.${styles.bullet}`).forEach((b) => {
          gsap.from(b, { scale: 0, rotation: -120, duration: 0.7, ease: "back.out(2.5)", scrollTrigger: { trigger: b, start: "top 85%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="inside" ref={root} className={styles.section} aria-labelledby="inside-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <h2 id="inside-title" className={`${ui.display} ${styles.title}`}>Nothing we wouldn&rsquo;t explain.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Makhana, also called fox nut, is the puffed seed of a water lily. We roast it, then season it after the dish named on the front of the pack.
          </p>
          <Makhana variant="outline" className={styles.big} />
        </div>

        <div className={styles.facts}>
          <ul className={styles.claims}>
            {CLAIMS.map((c, i) => (
              <li key={c} className={styles.claim}>
                <Makhana variant={i % 2 ? "outline" : "fill"} className={styles.bullet} />
                <span className={ui.display}>{c}</span>
              </li>
            ))}
          </ul>
          <p className={styles.allergens}>
            <strong>Allergens.</strong> Milk, groundnut and soya are present across the range. Every pack lists its full ingredients and allergen statement on the back.
          </p>
        </div>
      </div>
    </section>
  );
}
