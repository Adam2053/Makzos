"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, FLAVOURS, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { CrunchMark } from "./CrunchMark";
import ui from "./ui.module.css";
import styles from "./Hero.module.css";

/** Crumbs thrown out by each crunch. */
const CRUMBS = 14;

/**
 * The guide's own line, "Rasam. On makhana. Yes, really." (p.7), with the dish swapped in.
 * The makhana is the button: every tap crunches it and serves the next dish.
 */
export function Hero() {
  const [index, setIndex] = useState(0);
  const f = FLAVOURS[index];
  const { addBag } = useCart();
  const root = useRef<HTMLElement>(null);
  const packRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shown = useRef(0);
  const crumbs = useRef<HTMLDivElement>(null);

  const motion = () => window.matchMedia(MOTION_OK).matches;

  /** The crunch: a squeeze, the piece snapping off, the burst, a spray of crumbs. */
  const crunch = () => {
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

  // First load: the line rises, the makhana pops and crunches, the first pack comes out.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(packRefs.current.slice(1), { autoAlpha: 0 });
        gsap.timeline({ defaults: { ease: "expo.out" } })
          .from(q(`.${styles.line} > span`), { yPercent: 110, duration: 1, stagger: 0.09 }, 0.1)
          .from(q(`.${styles.sub}, .${styles.ctas}, .${styles.stories}`), { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.4)
          .from(q(`.${styles.mark}`), { scale: 0, rotation: -40, duration: 0.9, ease: "back.out(2)" }, 0.3)
          .call(crunch, [], 1.05)
          .from(packRefs.current[0], { xPercent: -50, scale: 0.5, rotation: -30, autoAlpha: 0, duration: 0.9, ease: "back.out(1.6)" }, 1.15)
          .from(q(`.${styles.hint}`), { autoAlpha: 0, duration: 0.5 }, 1.8);
        gsap.to(q(`.${styles.mark}`), { y: -10, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Serving a new dish: the old pack slides off the counter, the new one pops out from behind the seed.
  useGSAP(
    () => {
      const from = shown.current;
      if (from === index) return;
      shown.current = index;
      const out = packRefs.current[from], into = packRefs.current[index];
      if (!motion()) {
        gsap.set(out, { autoAlpha: 0 });
        gsap.set(into, { autoAlpha: 1 });
        return;
      }
      gsap.killTweensOf([out, into]);
      gsap.to(out, { xPercent: 60, rotation: 24, autoAlpha: 0, duration: 0.4, ease: "power2.in" });
      gsap.fromTo(into, { xPercent: -50, scale: 0.5, rotation: -30, autoAlpha: 0 }, { xPercent: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.85, delay: 0.15, ease: "back.out(1.6)" });
      gsap.from(`.${styles.dishWord}`, { yPercent: 110, duration: 0.6, ease: "expo.out" });
    },
    { scope: root, dependencies: [index] },
  );

  const serve = (i: number) => {
    if (motion()) crunch();
    setIndex(i);
  };

  return (
    <section id="top" ref={root} className={styles.hero} aria-labelledby="hero-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={`${ui.display} ${styles.title}`} aria-live="polite">
            <span className={`${styles.line} ${styles.dishLine}`} style={{ "--len": f.name.length + 1 } as React.CSSProperties}>
              <span key={f.id} className={styles.dishWord}>{f.name}.</span>
            </span>
            <span className={styles.line}><span>On makhana.</span></span>
            <span className={styles.line}><span>Yes, really.</span></span>
          </h1>
          <p className={`${ui.lede} ${styles.sub}`}>{f.inspired} Roasted makhana, {WEIGHT} a bag.</p>
          <div className={styles.ctas}>
            <button type="button" className={ui.btnPaprika} onClick={() => addBag(f.id, packRefs.current[index]?.querySelector("img"))}>
              Add {f.name}, {inr(BAG_PRICE)}
            </button>
            <a href="#mix" className={ui.btnLine}>Make a mix of 4</a>
          </div>

          {/* Every flavour as a round "story": the top of its pack, ringed when it's on the counter. */}
          <div className={styles.stories} role="group" aria-label="Pick a flavour">
            {FLAVOURS.map((x, i) => (
              <button key={x.id} type="button" className={styles.story} aria-pressed={i === index} aria-label={x.name}
                style={{ "--field": x.field } as React.CSSProperties} onClick={() => serve(i)}>
                <span><Image src={x.pack} alt="" width={PACK_W} height={PACK_H} sizes="56px" /></span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.stage}>
          <button type="button" className={styles.markBtn} onClick={() => serve((index + 1) % FLAVOURS.length)} aria-label="Crunch the makhana for the next flavour">
            <CrunchMark variant="fill" className={styles.mark}
              partClass={{ main: `${styles.part} ${styles.main}`, piece: `${styles.part} ${styles.piece}`, burst: `${styles.part} ${styles.burst}`, crumbs: `${styles.part} ${styles.crumbs}` }} />
          </button>
          <div ref={crumbs} className={styles.spray} aria-hidden="true" />
          <div className={styles.packs}>
            {FLAVOURS.map((x, i) => (
              <div key={x.id} ref={(el) => { packRefs.current[i] = el; }} className={styles.pack}>
                <Image src={x.pack} alt={`Makzo's ${x.name} roasted makhana, ${WEIGHT} pack`} width={PACK_W} height={PACK_H}
                  sizes="(max-width: 900px) 40vw, 18vw" loading={i < 2 ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
          <p className={styles.hint} aria-hidden="true">Tap the makhana</p>
        </div>
      </div>
    </section>
  );
}
