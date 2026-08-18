"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FLAVOURS } from "@/lib/flavours";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { HeatMeter } from "./HeatMeter";
import styles from "./Hero.module.css";

export function Hero() {
  const [index, setIndex] = useState(1);
  const active = FLAVOURS[index];

  const root = useRef<HTMLElement>(null);
  const packWrap = useRef<HTMLDivElement>(null);
  const packs = useRef<(HTMLImageElement | null)[]>([]);
  const plates = useRef<(HTMLElement | null)[]>([]);
  const name = useRef<HTMLParagraphElement>(null);
  const first = useRef(true);

  /* Load: one orchestrated entrance, then the pack is left drifting. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.set(packs.current.filter(Boolean), { rotate: -7, opacity: 0, yPercent: 4, scale: 0.94 });
        gsap.set(packs.current[index], { opacity: 1, yPercent: 0, scale: 1 });

        gsap
          .timeline({ defaults: { ease: EASE } })
          .from(`.${styles.eyebrow}`, { opacity: 0, y: 20, duration: 0.8 })
          .from(`.${styles.headline}`, { opacity: 0, y: 26, duration: 0.9 }, "-0.62")
          .from(`.${styles.deck}`, { opacity: 0, y: 24, duration: 0.9 }, "-0.7")
          .from(packWrap.current, { opacity: 0, y: 34, duration: 1 }, "-0.75");

        /* Barely there — the pack should look suspended, not animated. */
        gsap.to(packWrap.current, {
          y: -10,
          rotate: 1,
          duration: 3.6,
          ease: EASE_SOFT,
          yoyo: true,
          repeat: -1,
        });
      });

      mm.add(MOTION_OFF, () => {
        gsap.set(packs.current.filter(Boolean), { rotate: -7, opacity: 0 });
        gsap.set(packs.current[index], { opacity: 1 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  /* Flavour change: crossfade the pack and scene, wipe the name back in. */
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        packs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            opacity: i === index ? 1 : 0,
            yPercent: i === index ? 0 : 4,
            scale: i === index ? 1 : 0.94,
            duration: 0.55,
            ease: EASE,
          });
        });
        plates.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, { opacity: i === index ? 1 : 0, duration: 0.9, ease: EASE });
          gsap.to(el, { scale: i === index ? 1 : 1.06, duration: 1.4, ease: EASE });
        });
        gsap.fromTo(
          name.current,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.6, ease: EASE },
        );
      });

      mm.add(MOTION_OFF, () => {
        packs.current.forEach((el, i) => el && gsap.set(el, { opacity: i === index ? 1 : 0 }));
        plates.current.forEach((el, i) => el && gsap.set(el, { opacity: i === index ? 1 : 0 }));
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [index] },
  );

  return (
    <section
      id="top"
      ref={root}
      className={styles.hero}
      style={{ "--flavour": active.accent, "--deep": active.deep } as React.CSSProperties}
    >
      {/* Each scene is already a grey world with one thing in colour; the page
          simply continues it. */}
      <div className={styles.stage} aria-hidden="true">
        {FLAVOURS.map((f, i) =>
          f.scene ? (
            <picture
              key={f.id}
              ref={(el) => {
                plates.current[i] = el;
              }}
              className={styles.plate}
              data-on={i === index || undefined}
            >
              <source srcSet={`${f.scene}.webp`} type="image/webp" />
              <img src={`${f.scene}.jpg`} alt="" />
            </picture>
          ) : (
            <div
              key={f.id}
              ref={(el) => {
                plates.current[i] = el;
              }}
              className={styles.plateBlank}
              data-on={i === index || undefined}
            />
          ),
        )}
        <div className={styles.scrim} />
        <div className={styles.glow} />
      </div>

      <div className={styles.body}>
        <p className={`u-mono ${styles.eyebrow}`}>
          Roasted makhana <span className={styles.dot}>/</span> 55 g{" "}
          <span className={styles.dot}>/</span> four flavours
        </p>

        <h1 className={`u-display ${styles.headline}`}>
          Everything
          <br />
          else is
          <br />
          black<wbr />
          <span className={styles.amp}>&amp;</span>
          <wbr />
          white
        </h1>

        <div className={styles.deck}>
          <p className={`u-mono ${styles.origin}`}>{active.origin}</p>
          <p ref={name} className={`u-display u-slant ${styles.flavourName}`}>
            {active.name}
          </p>
          <p className={styles.line}>{active.packLine}</p>

          <div className={styles.actions}>
            <button className={`u-mono ${styles.buy}`} type="button">
              Add to bag — ₹{active.price}
            </button>
            <a href="#flavours" className={`u-mono ${styles.ghost}`}>
              All four flavours
            </a>
          </div>
        </div>

        <div ref={packWrap} className={styles.packWrap}>
          {FLAVOURS.map((f, i) => (
            <Image
              key={f.id}
              ref={(el) => {
                packs.current[i] = el;
              }}
              src={f.pack}
              alt={`Makzo's ${f.name} roasted makhana, 55 g pack`}
              width={347}
              height={460}
              priority={i === 1}
              className={styles.pack}
              data-on={i === index || undefined}
            />
          ))}
        </div>
      </div>

      {/* The signature: a strip of four grey thumbnails where exactly one is
          allowed to hold colour. Choosing it repaints the whole section. */}
      <div className={styles.dial} role="tablist" aria-label="Choose a flavour">
        {FLAVOURS.map((f, i) => (
          <button
            key={f.id}
            role="tab"
            type="button"
            aria-selected={i === index}
            className={styles.tab}
            data-on={i === index || undefined}
            style={{ "--flavour": f.accent } as React.CSSProperties}
            onClick={() => setIndex(i)}
          >
            <span className={styles.thumb}>
              <Image src={f.pack} alt="" width={347} height={460} />
            </span>
            <span className={styles.tabText}>
              <span className={`u-mono ${styles.tabName}`}>{f.short}</span>
              <span className={`u-mono ${styles.tabOrigin}`}>{f.origin}</span>
            </span>
            <span className={styles.heat}>
              <HeatMeter level={f.heat} compact />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
