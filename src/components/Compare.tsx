"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FLAVOURS, NUTRITION } from "@/lib/flavours";
import { EASE, MOTION_OFF, MOTION_OK, POP, gsap, useGSAP } from "@/lib/motion";
import { Heat } from "./Bits";
import styles from "./Compare.module.css";

export function Compare() {
  const [index, setIndex] = useState(0);
  const active = FLAVOURS[index];

  const root = useRef<HTMLElement>(null);
  const packs = useRef<(HTMLImageElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const all = packs.current.filter(Boolean);
      mm.add(MOTION_OK, () => {
        gsap.set(all, { opacity: 0, scale: 0.9 });
        gsap.set(packs.current[index], { opacity: 1, scale: 1 });
      });
      mm.add(MOTION_OFF, () => {
        gsap.set(all, { opacity: 0 });
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
        gsap.fromTo(panel.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: EASE });
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
  ];

  return (
    <section id="compare" className={styles.section} ref={root}>
      <div
        className={`u-shell ${styles.capsule} u-capsule`}
        style={{ "--tile": active.tile } as React.CSSProperties}
      >
        <div className={styles.head}>
          <p className={`u-label ${styles.kicker}`}>The back of the bag</p>
          <h2 className={`u-display ${styles.title}`}>What actually changes</h2>
          <p className={`u-lede ${styles.lede}`}>
            Same seed, same 55 g bag, same two steps. Pick one to see the rest.
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Choose a flavour to compare">
          {FLAVOURS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              id={`cmp-tab-${f.id}`}
              aria-selected={i === index}
              aria-controls="cmp-panel"
              className={styles.tab}
              data-on={i === index || undefined}
              style={{ "--tab": f.tile } as React.CSSProperties}
              onClick={() => setIndex(i)}
            >
              {f.short}
            </button>
          ))}
        </div>

        <div className={styles.board}>
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
            id="cmp-panel"
            role="tabpanel"
            aria-labelledby={`cmp-tab-${active.id}`}
          >
            <p className={`u-label ${styles.origin}`}>{active.origin}</p>
            <h3 className={`u-display ${styles.name}`}>{active.name}</h3>
            <p className={styles.tagline}>{active.packLine}</p>

            <dl className={styles.table}>
              {rows.map((r) => (
                <div key={r.k} className={styles.row}>
                  <dt className={`u-label ${styles.rowKey}`}>{r.k}</dt>
                  <dd className={styles.rowVal}>{r.v ?? <Heat level={active.heat} />}</dd>
                </div>
              ))}
            </dl>

            <ul className={styles.nutri}>
              {NUTRITION.map((n) => (
                <li key={n.label} className={styles.nutriCell}>
                  <span className={`u-display ${styles.nutriValue}`}>{n.value}</span>
                  <span className={`u-label ${styles.nutriLabel}`}>{n.label}</span>
                </li>
              ))}
            </ul>

            <div className={styles.buy}>
              <p className={styles.price}>
                <span className={styles.now}>₹{active.price}</span>
                <s className={styles.was}>₹{active.mrp}</s>
              </p>
              <button type="button" className={`u-pill ${styles.add}`}>
                Add {active.short}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
