"use client";

import Image from "next/image";
import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import ui from "./ui.module.css";
import styles from "./PhotoBand.module.css";

/** One big picture, slowly pushed in as you scroll past: the brand's grey world with the food in colour. */
export function PhotoBand() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(`.${styles.photo} img`, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className={styles.band} aria-labelledby="band-title">
      <figure className={styles.photo}>
        <Image src="/brand/dishes/curry-leaves.webp" alt="A climber hangs from a giant curry leaf branch above the Kerala coast." fill sizes="100vw" />
      </figure>
      <div className={`${ui.shell} ${styles.copy}`}>
        <h2 id="band-title" className={`${ui.display} ${styles.title}`}>On every pack, only the dish is in colour.</h2>
        <a href="#map" className={ui.btnPaprika}>Find your flavour</a>
      </div>
    </section>
  );
}
