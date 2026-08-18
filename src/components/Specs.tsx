"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FLAVOURS, NUTRITION } from "@/lib/flavours";
import { EASE, MOTION_OFF, MOTION_OK, POP, gsap, useGSAP } from "@/lib/motion";
import { Heat, Stars } from "./Bits";
import styles from "./Specs.module.css";

export function Specs() {
  const [index, setIndex] = useState(0);
  const active = FLAVOURS[index];

  const root = useRef<HTMLElement>(null);
  const packs = useRef<(HTMLImageElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(packs.current.filter(Boolean), { opacity: 0, scale: 0.9, rotate: -4 });
        gsap.set(packs.current[index], { opacity: 1, scale: 1 });
      });
      mm.add(MOTION_OFF, () => {
        gsap.set(packs.current.filter(Boolean), { opacity: 0 });
        gsap.set(packs.current[index], { opacity: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

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
            scale: i === index ? 1 : 0.9,
            duration: 0.45,
            ease: i === index ? POP : EASE,
          });
        });
        gsap.fromTo(
          panel.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, ease: EASE },
        );
      });

      mm.add(MOTION_OFF, () => {
        packs.current.forEach((el, i) => el && gsap.set(el, { opacity: i === index ? 1 : 0 }));
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [index] },
  );

  const rows = [
    { k: "Net weight", v: "55 g" },
    { k: "Heat", v: null },
    { k: "Roast", v: active.roast },
    { k: "Ingredients", v: active.ingredients },
    { k: "Allergens", v: active.allergens },
    { k: "Shelf life", v: "6 months unopened" },
  ];

  return (
    <section id="specs" className={styles.section} ref={root}>
      <div className="u-shell">
        <div className={styles.head}>
          <p className="u-label">The back of the bag</p>
          <h2 className={`u-display u-rough ${styles.title}`}>
            Compare the <span className={styles.pop}>four</span>
          </h2>
          <p className={`u-lede ${styles.lede}`}>
            Same seed, same 55 g bag, same two steps. Tap a flavour to see
            exactly what changes.
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Choose a flavour to compare">
          {FLAVOURS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              id={`spec-tab-${f.id}`}
              aria-selected={i === index}
              aria-controls="spec-panel"
              className={styles.tab}
              data-on={i === index || undefined}
              style={{ "--tile": f.tile } as React.CSSProperties}
              onClick={() => setIndex(i)}
            >
              <span className={styles.swatch} aria-hidden="true" />
              {f.short}
            </button>
          ))}
        </div>

        <div
          className={styles.board}
          style={{ "--tile": active.tile } as React.CSSProperties}
        >
          <div className={styles.shot}>
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
                className={styles.pack}
              />
            ))}
          </div>

          <div
            className={styles.panel}
            ref={panel}
            id="spec-panel"
            role="tabpanel"
            aria-labelledby={`spec-tab-${active.id}`}
          >
            <p className={`u-label ${styles.origin}`}>{active.origin}</p>
            <h3 className={`u-display ${styles.name}`}>{active.name}</h3>
            <p className={styles.tagline}>{active.packLine}</p>

            <p className={styles.rating}>
              <Stars value={active.rating} small />
              <span>
                {active.rating} · {active.reviews} reviews
              </span>
            </p>

            <dl className={styles.table}>
              {rows.map((r) => (
                <div key={r.k} className={styles.row}>
                  <dt className={`u-label ${styles.rowKey}`}>{r.k}</dt>
                  <dd className={styles.rowVal}>
                    {r.v ?? <Heat level={active.heat} />}
                  </dd>
                </div>
              ))}
            </dl>

            <div className={styles.nutri}>
              <p className={`u-label ${styles.nutriHead}`}>Per 55 g bag · as printed</p>
              <ul className={styles.nutriGrid}>
                {NUTRITION.map((n) => (
                  <li key={n.label} className={styles.nutriCell}>
                    <span className={`u-display ${styles.nutriValue}`}>{n.value}</span>
                    <span className={`u-label ${styles.nutriLabel}`}>{n.label}</span>
                    <span className={styles.nutriSub}>{n.sub}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.buy}>
              <p className={styles.price}>
                <span className={styles.now}>₹{active.price}</span>
                <s className={styles.was}>₹{active.mrp}</s>
              </p>
              <button type="button" className={`u-label ${styles.add}`}>
                Add {active.short} to bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
