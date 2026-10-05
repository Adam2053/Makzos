"use client";

import { useRef } from "react";
import { BOX_PRICE, inr } from "@/lib/products";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import ui from "./ui.module.css";
import styles from "./StickyBuy.module.css";

/** Phones only: once the hero's buttons have scrolled away, the next step stays in reach. */
export function StickyBuy() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const show = (on: boolean) => gsap.to(bar.current, { yPercent: on ? 0 : 110, duration: 0.35, ease: on ? "power3.out" : "power2.in" });
    gsap.set(bar.current, { yPercent: 110 });
    // Visible between the hero and the box builder's own button, hidden again from the sign-up onwards.
    const a = ScrollTrigger.create({ trigger: "#top", start: "bottom top", endTrigger: "#box", end: "top center", onToggle: (s) => show(s.isActive) });
    const b = ScrollTrigger.create({ trigger: "#inside", start: "top bottom", endTrigger: "#updates", end: "top bottom", onToggle: (s) => show(s.isActive) });
    return () => { a.kill(); b.kill(); };
  });

  return (
    <div ref={bar} className={styles.bar}>
      <a href="#box" className={`${ui.btn} ${styles.cta}`}>Build a box of 4, {inr(BOX_PRICE)}</a>
    </div>
  );
}
