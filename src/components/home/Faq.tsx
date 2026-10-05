"use client";

import { useRef, useState } from "react";
import { BOX_PRICE, WEIGHT, inr } from "@/lib/products";
import { MOTION_OK, gsap } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Faq.module.css";

/** Only brief-approved claims and confirmed facts (guide p.9, p.37). */
const QUESTIONS = [
  { q: "What is makhana?", a: "Makhana, also called fox nut, is the puffed seed of a water lily. We roast it, then season it after a dish you already know." },
  { q: "What's in it, and what isn't?", a: "No preservatives, no artificial colours or flavours, and no INS-coded additives. The full ingredient list for each flavour is printed on the back of its pack." },
  { q: "Does it contain allergens?", a: "Milk, groundnut and soya are present across the range. Check the allergen statement on each pack before you open it." },
  { q: "How big is a bag?", a: `Each bag is ${WEIGHT}.` },
  { q: "Where do you deliver?", a: "We're launching in Hyderabad first, then Bengaluru. Leave your email below and we'll tell you when we reach your city." },
  { q: "Can I order for an office, a party or a gift?", a: "Yes. Email hello@makzos.com with the date and how many people, and we'll confirm which flavours we can send." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  // Opening shows what changed: the answer grows into place, the last one folds away.
  const toggle = (i: number) => {
    const next = open === i ? null : i;
    if (window.matchMedia(MOTION_OK).matches) {
      // Inline heights only while moving; at rest the CSS decides, so React and GSAP never disagree.
      if (open !== null) gsap.fromTo(panels.current[open], { height: panels.current[open]!.offsetHeight }, { height: 0, duration: 0.35, ease: "power2.inOut", clearProps: "height" });
      if (next !== null) gsap.fromTo(panels.current[next], { height: 0 }, { height: "auto", duration: 0.45, ease: "power3.out", clearProps: "height" });
    }
    setOpen(next);
  };

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.side}>
          <h2 id="faq-title" className={`${ui.display} ${styles.title}`}>Straight answers.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Still deciding? The starter box has four of them in it.</p>
          <a href="#offers" className={ui.btn}>See the box, {inr(BOX_PRICE)}</a>
          <Makhana variant="outline" className={styles.seed} />
        </div>

        <ul className={styles.list}>
          {QUESTIONS.map((item, i) => (
            <li key={item.q} className={styles.item} data-open={open === i || undefined}>
              <h3 className={styles.q}>
                <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => toggle(i)}>
                  {item.q}
                  <span className={styles.icon} aria-hidden="true" />
                </button>
              </h3>
              <div ref={(el) => { panels.current[i] = el; }} id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={styles.a}>
                <p>{item.a}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
