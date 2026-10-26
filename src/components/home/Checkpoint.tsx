"use client";

import { useEffect, useRef, useState } from "react";
import { BAG_PRICE, BOX_SIZE, FLAVOURS, boxPrice, inr } from "@/lib/products";
import { BUNDLES } from "@/lib/bundles";
import { bagKey, useCart } from "@/lib/cart";
import { FREE_FROM } from "@/lib/pricing";
import { MOTION_OK } from "@/lib/motion";
import { Pack } from "@/components/shop/Pack";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Checkpoint.module.css";

/** How long the checkpoint "checks": long enough to read as a step, short enough not to annoy. */
const CHECK_MS = 1300;

/**
 * The stop between "Go to bag" and the bag: a short loader while it checks the bag, then the
 * offers that apply to it right now. Finishing a box (every four loose bags are priced as one),
 * how far off free delivery is, and one ready-made bundle. "Continue to bag" always goes
 * straight on; nothing here is in the way of paying.
 */
export function Checkpoint({ onClose }: { onClose: () => void }) {
  const { lines, bags, subtotal, addBag, addBox, setQty, setOpen } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  // Mounted only while it's open, so every visit starts with the check.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
    const t = window.setTimeout(() => setChecking(false), window.matchMedia(MOTION_OK).matches ? CHECK_MS : 300);
    return () => { window.clearTimeout(t); if (d.open) d.close(); };
  }, []);

  const toBag = () => { onClose(); setOpen(true); };

  const inBag = (id: string) => lines.find((l) => l.key === bagKey(id))?.qty ?? 0;
  const loose = bags % BOX_SIZE;
  const toBox = loose === 0 ? 0 : BOX_SIZE - loose;
  // What would finish the box: flavours not in the bag yet come first.
  const picks = [...FLAVOURS].sort((a, b) => inBag(a.id) - inBag(b.id)).slice(0, 4);
  const add = (id: string) => { const n = inBag(id); if (n === 0) addBag(id, null, { quiet: true }); else setQty(bagKey(id), n + 1); };
  const bundle = BUNDLES.find((b) => b.id === "all")!;
  const toFree = Math.max(0, FREE_FROM - subtotal);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="checkpoint-title" aria-busy={checking}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {checking ? (
        <div className={styles.loader} role="status">
          <span className={styles.seeds} aria-hidden="true">
            {[0, 1, 2].map((i) => <Makhana key={i} variant={i === 1 ? "ink" : "fill"} className={styles.seed} />)}
          </span>
          <p id="checkpoint-title" className={`${ui.display} ${styles.loading}`}>Checking your bag</p>
          <p className={styles.small}>Looking for offers that fit it.</p>
          <span className={styles.progress} aria-hidden="true"><span /></span>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.head}>
            <p className={`${ui.label} ${styles.eyebrow}`}>Checkpoint</p>
            <h2 id="checkpoint-title" className={`${ui.display} ${styles.title}`}>Before you go&hellip;</h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          {/* 1. Finish the box. */}
          <section className={styles.offer} aria-labelledby="offer-box">
            <h3 id="offer-box" className={styles.offerTitle}>
              {toBox > 0 ? <>Add {toBox} more, pay the box price</> : <>Every four bags priced as a box</>}
            </h3>
            <p className={styles.small}>
              {toBox > 0
                ? `${BOX_SIZE} bags are ${inr(boxPrice(BOX_SIZE))} instead of ${inr(BOX_SIZE * BAG_PRICE)}.`
                : `Your bags are already priced in fours. Another ${BOX_SIZE} saves ${inr(BOX_SIZE * BAG_PRICE - boxPrice(BOX_SIZE))} again.`}
            </p>
            <ul className={styles.picks}>
              {picks.map((f) => (
                <li key={f.id}>
                  <button type="button" className={styles.pick} onClick={() => add(f.id)} aria-label={`Add ${f.name}${inBag(f.id) ? `, ${inBag(f.id)} in your bag` : ""}`}>
                    <Pack id={f.id} sizes="80px" alt="" className={styles.pickPack} />
                    <span className={`${ui.label} ${styles.pickName}`}>{f.name}</span>
                    <span className={styles.plus} aria-hidden="true">{inBag(f.id) || "+"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. Free delivery. */}
          <section className={styles.offer} aria-labelledby="offer-free">
            <h3 id="offer-free" className={styles.offerTitle}>{toFree > 0 ? `${inr(toFree)} away from free delivery` : "Free delivery unlocked"}</h3>
            <span className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.min(100, (subtotal / FREE_FROM) * 100)}%` }} /></span>
          </section>

          {/* 3. One bundle. */}
          <section className={`${styles.offer} ${styles.bundle}`} aria-labelledby="offer-bundle">
            <span className={styles.fan} aria-hidden="true">
              {bundle.ids().slice(0, 5).map((id, i) => <Pack key={id} id={id} sizes="60px" alt="" className={styles.fanPack} tilt={(i - 2) * 9} />)}
            </span>
            <div>
              <h3 id="offer-bundle" className={styles.offerTitle}>{bundle.name}: {bundle.size} bags</h3>
              <p className={styles.small}><strong className={ui.play}>{inr(boxPrice(bundle.size))}</strong> <s>{inr(bundle.size * BAG_PRICE)}</s></p>
            </div>
            <button type="button" className={ui.btnDark} onClick={() => addBox(bundle.ids(), null)}>Add bundle</button>
          </section>

          <button type="button" className={`${ui.btnPaprika} ${styles.go}`} onClick={toBag}>Continue to bag</button>
        </div>
      )}
    </dialog>
  );
}
