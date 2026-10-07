"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FEATURED, FLAVOURS, PACK_H, PACK_W, byId, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ui from "./ui.module.css";
import styles from "./BuildBox.module.css";

/** Starting points for people who'd rather not choose four from scratch. */
const PRESETS: { label: string; ids: () => string[] }[] = [
  { label: "The first four", ids: () => FEATURED.map((f) => f.id) },
  { label: "The spicy side", ids: () => ["rasam", "chettinadu", "thai-chilli", "curry-leaves"] },
  { label: "Surprise me", ids: () => [...FLAVOURS].sort(() => Math.random() - 0.5).slice(0, BOX_SIZE).map((f) => f.id) },
];

/**
 * The combo: four slots, any flavours, doubles allowed. Tap a flavour to fill the next slot,
 * tap a filled slot to empty it. The button counts down what's left to pick.
 */
export function BuildBox() {
  const [picks, setPicks] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const { addBox } = useCart();
  const tray = useRef<HTMLOListElement>(null);

  const left = BOX_SIZE - picks.length;
  const saving = BOX_SIZE * BAG_PRICE - BOX_PRICE;

  const pick = (id: string) => { if (left > 0) { setPicks((p) => [...p, id]); setAdded(false); } };
  const drop = (i: number) => setPicks((p) => p.filter((_, j) => j !== i));
  const add = () => {
    addBox(picks, tray.current?.querySelector("img"));
    setPicks([]);
    setAdded(true);
  };

  return (
    <section id="box" className={styles.section} aria-labelledby="box-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <h2 id="box-title" className={`${ui.display} ${styles.title}`}>Build a box of four.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Any four bags, doubles welcome, {inr(BOX_PRICE)}.{saving > 0 && ` That's ${inr(saving)} less than buying them one by one.`}
          </p>
          <div className={styles.presets} role="group" aria-label="Start from a ready-made box">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className={styles.preset} onClick={() => { setPicks(p.ids()); setAdded(false); }}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className={styles.builder}>
          <ol ref={tray} className={styles.tray} aria-label="Your box">
            {Array.from({ length: BOX_SIZE }, (_, i) => {
              const f = picks[i] ? byId(picks[i]) : null;
              return (
                <li key={i} className={styles.slot} data-full={f ? true : undefined} style={f ? ({ "--field": f.field } as React.CSSProperties) : undefined}>
                  {f ? (
                    <button type="button" className={styles.remove} onClick={() => drop(i)} aria-label={`Remove ${f.name} from slot ${i + 1}`}>
                      <Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="(max-width: 700px) 22vw, 150px" />
                      <span aria-hidden="true">×</span>
                    </button>
                  ) : (
                    <span className={styles.empty}><span className={ui.sr}>Slot </span>{i + 1}<span className={ui.sr}>, empty</span></span>
                  )}
                </li>
              );
            })}
          </ol>

          <ul className={styles.picker} aria-label="Flavours">
            {FLAVOURS.map((f) => (
              <li key={f.id}>
                <button type="button" className={styles.chip} disabled={left === 0} onClick={() => pick(f.id)}
                  style={{ "--field": f.field } as React.CSSProperties} aria-label={`Add ${f.name} to your box`}>
                  <span className={styles.face}><Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="40px" /></span>
                  {f.name}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.foot}>
            <p className={styles.status} aria-live="polite">
              {added && picks.length === 0 ? "In your bag. Build another?" : left === 0 ? "That's a box." : `Pick ${left} more.`}
            </p>
            <button type="button" className={ui.btnPaprika} disabled={left > 0} onClick={add}>
              Add box, {inr(BOX_PRICE)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
