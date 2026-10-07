"use client";

import Image from "next/image";
import { useRef } from "react";
import { FEATURED, WEIGHT } from "@/lib/products";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { CrunchMark } from "./CrunchMark";
import ui from "./ui.module.css";
import styles from "./Banner.module.css";

/** Where each launch dish hangs beside the lockup: two a side, one large and one small. */
const SPOTS = ["leftTop", "rightTop", "leftBottom", "rightBottom"] as const;

/** Crumbs thrown out by each crunch. */
const CRUMBS = 14;

/**
 * The banner is about Makzo's, not one flavour, so it's built like the logo: the broken
 * makhana sits in the middle of the words, the way it sits in the middle of the wordmark.
 * The line is the guide's own (p.33). The makhana crunches on load and whenever it's tapped.
 * On wide screens the dishes behind the launch flavours hang either side, cropped round like
 * the seed, each tagged in its flavour's colour.
 */
export function Banner() {
  const root = useRef<HTMLElement>(null);
  const crumbs = useRef<HTMLDivElement>(null);

  /** The crunch: a squeeze, the piece snapping off, the burst, a spray of crumbs. */
  const crunch = () => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    const q = gsap.utils.selector(root);
    const main = q(`.${styles.main}`), piece = q(`.${styles.piece}`), burst = q(`.${styles.burst} path`), bits = q(`.${styles.crumbs}`);
    gsap.timeline()
      .to(main, { scaleX: 1.07, scaleY: 0.9, duration: 0.1, ease: "power2.in" })
      .to(piece, { x: -14, y: 12, rotation: -22, duration: 0.1, ease: "power2.in" }, 0)
      .set(burst, { scale: 0, autoAlpha: 0 })
      .to(main, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" })
      .to(piece, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: "back.out(3.5)" }, "<")
      .to(burst, { scale: 1, autoAlpha: 1, duration: 0.35, stagger: 0.05, ease: "back.out(3)" }, "<")
      .fromTo(bits, { x: -10, y: 10, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.4 }, "<");

    // Loose crumbs: paprika and black specks that fly out and fall.
    const box = crumbs.current!;
    for (let i = 0; i < CRUMBS; i++) {
      const c = document.createElement("span");
      c.className = styles.crumb;
      if (i % 3 === 0) c.style.background = "var(--black)";
      box.appendChild(c);
      const a = (i / CRUMBS) * Math.PI * 2 + Math.random() * 0.4;
      const d = 90 + Math.random() * 140;
      gsap.timeline({ onComplete: () => c.remove() })
        .fromTo(c, { x: 0, y: 0, scale: 0.6 + Math.random() * 0.8 }, { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, duration: 0.55, ease: "power3.out" })
        .to(c, { y: "+=120", autoAlpha: 0, rotation: 180, duration: 0.6, ease: "power2.in" });
    }
  };

  // First load: the two lines part, the makhana pops between them and crunches.
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(q(`.${styles.line} > span`), { yPercent: (i) => (i ? -110 : 110), duration: 1, stagger: 0.09 }, 0.1)
        .from(q(`.${styles.mark}`), { scale: 0, rotation: -40, duration: 0.9, ease: "back.out(2)" }, 0.3)
        .call(crunch, [], 1.05)
        .from(q(`.${styles.sub}, .${styles.ctas}, .${styles.claims}`), { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.6)
        .from(q(`.${styles.dish}`), { scale: 0, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "back.out(1.6)" }, 0.7);
      // Each dish drifts on its own clock, so the four never move as one.
      q(`.${styles.dish}`).forEach((el, i) => gsap.to(el, { y: i % 2 ? 12 : -12, duration: 3 + i * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.8 }));
      gsap.to(q(`.${styles.mark}`), { y: -10, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className={styles.banner} aria-labelledby="banner-title">
      <div className={styles.dishes} aria-hidden="true">
        {FEATURED.map((f, i) => (
          <figure key={f.id} className={`${styles.dish} ${styles[SPOTS[i]]}`} style={{ "--field": f.field, "--ink": f.ink } as React.CSSProperties}>
            <span className={styles.plate}>
              {/* Framed and zoomed about the food itself, so the dish is never the part cropped away (guide p.26). */}
              <Image src={f.dish.src} alt="" fill sizes="(max-width: 1199px) 1px, 28vw"
                style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%`, transformOrigin: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
            </span>
            <figcaption>{f.name}</figcaption>
          </figure>
        ))}
      </div>
      <div className={`${ui.shell} ${styles.inner}`}>
        <div className={styles.lockup}>
          <h1 id="banner-title" className={`${ui.display} ${styles.title}`}>
            <span className={styles.line}><span>Real dishes.</span></span>
            <span className={`${styles.line} ${styles.accent}`}><span>New crunch.</span></span>
          </h1>
          <button type="button" className={styles.markBtn} onClick={crunch} aria-label="Crunch the makhana">
            <CrunchMark variant="fill" className={styles.mark}
              partClass={{ main: `${styles.part} ${styles.main}`, piece: `${styles.part} ${styles.piece}`, burst: `${styles.part} ${styles.burst}`, crumbs: `${styles.part} ${styles.crumbs}` }} />
          </button>
          <div ref={crumbs} className={styles.spray} aria-hidden="true" />
        </div>

        <p className={`${ui.lede} ${styles.sub}`}>
          Roasted makhana inspired by dishes you know. {FEATURED.map((f) => f.name).join(", ")} and more, {WEIGHT} a bag.
        </p>
        <div className={styles.ctas}>
          <a href="#shop" className={ui.btnPaprika}>Explore flavours</a>
          <a href="#box" className={ui.btnLine}>Build a box</a>
        </div>
        <ul className={styles.claims}>
          <li>No preservatives</li>
          <li>No artificial colours or flavours</li>
        </ul>
      </div>
    </section>
  );
}
