"use client";

import Image from "next/image";
import { useRef } from "react";
import { BAG_PRICE, FLAVOURS, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Stack.module.css";

/**
 * The range as a stack of cards dealt onto the table one at a time. Each card sticks,
 * the next slides over it, and the one underneath settles back and dims. Only ever vertical.
 */
export function Stack() {
  const { addBag } = useCart();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (min-width: 761px)`, () => {
        const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector(`.${styles.face}`), {
            scale: 0.9, filter: "brightness(.45)", ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top+=120", scrub: true },
          });
        });
        // Inside each card the pack rises a little as it arrives.
        cards.forEach((card) => {
          gsap.fromTo(card.querySelector(`.${styles.pack}`), { yPercent: 18, rotation: 8 }, {
            yPercent: 0, rotation: -4, ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "top top+=120", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="flavours" ref={root} className={styles.section} aria-labelledby="stack-title">
      <header className={`${ui.shell} ${styles.head}`}>
        <h2 id="stack-title" className={`${ui.display} ${styles.title}`}>Seven dishes, dealt one at a time.</h2>
        <p className={`${ui.lede} ${styles.lede}`}>Every bag is {WEIGHT} of roasted makhana and {inr(BAG_PRICE)}. Scroll through the table.</p>
      </header>

      <ol className={styles.list}>
        {FLAVOURS.map((f, i) => {
          const dark = f.ink === "#ffffff";
          return (
            <li key={f.id} className={styles.card} style={{ "--i": i } as React.CSSProperties}>
              <article className={styles.face} aria-labelledby={`card-${f.id}`} style={{ "--field": f.field, "--ink": f.ink } as React.CSSProperties}>
                <div className={styles.copy}>
                  <p className={styles.count}>{String(i + 1).padStart(2, "0")} of {String(FLAVOURS.length).padStart(2, "0")}</p>
                  <h3 id={`card-${f.id}`} className={`${ui.display} ${styles.name}`}>{f.name}</h3>
                  <p className={styles.inspired}>{f.inspired}</p>
                  <p className={styles.line}>&ldquo;{f.line}&rdquo;</p>
                  <div className={styles.buy}>
                    <button type="button" className={dark ? ui.btnLight : ui.btnDark}
                      onClick={(e) => addBag(f.id, e.currentTarget.closest("article")?.querySelector(`.${styles.pack} img`))}>
                      Add to bag, {inr(BAG_PRICE)}
                    </button>
                    <span className={styles.weight}>{WEIGHT}</span>
                  </div>
                </div>
                <div className={styles.art}>
                  <div className={styles.plate}>
                    <Image src={f.dish.src} alt={`The dish behind ${f.name}`} fill sizes="(max-width: 760px) 70vw, 30vw"
                      style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%`, transformOrigin: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
                  </div>
                  <div className={styles.pack}>
                    <Image src={f.pack} alt={`Makzo's ${f.name} roasted makhana, ${WEIGHT} pack`} width={PACK_W} height={PACK_H} sizes="(max-width: 760px) 40vw, 17vw" />
                  </div>
                  <Makhana variant={dark ? "outline" : "fill"} className={styles.seed} />
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
