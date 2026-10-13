"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { BAG_PRICE, BOX_MAX, BOX_SIZE, FEATURED, FLAVOURS, PACK_H, PACK_W, SUB_EVERY, SUB_OFF, boxPrice, byId, inr, type Every } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { PackThumb } from "@/components/shop/Pack";
import ui from "./ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./BuildBox.module.css";

/** Starting points for people who'd rather not choose from scratch. */
const PRESETS: { label: string; ids: () => string[] }[] = [
  { label: "The first four", ids: () => FEATURED.map((f) => f.id) },
  { label: "The spicy side", ids: () => ["rasam", "chettinadu", "thai-chilli", "curry-leaves"] },
  { label: "One of everything", ids: () => FLAVOURS.map((f) => f.id) },
  { label: "Surprise me", ids: () => [...FLAVOURS].sort(() => Math.random() - 0.5).slice(0, BOX_SIZE).map((f) => f.id) },
];

const NOTE_MAX = 120;

/**
 * The box: 4 to 7 bags, any mix, doubles welcome (requirements form). Tap a flavour to fill
 * the next slot, tap a filled slot to empty it. The price ladder shows what each extra bag
 * saves. On its own page (`full`) the box can also be a subscription or a gift with a note.
 */
export function BuildBox({ full = false, as: Heading = "h2" }: { full?: boolean; as?: "h1" | "h2" }) {
  const [picks, setPicks] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [every, setEvery] = useState<Every | null>(null);
  const [gift, setGift] = useState(false);
  const [note, setNote] = useState("");
  const { addBox, setOpen } = useCart();
  const tray = useRef<HTMLOListElement>(null);

  const n = picks.length;
  const ready = n >= BOX_SIZE;
  const price = ready ? boxPrice(n) : 0;
  const unit = every ? Math.round(price * (1 - SUB_OFF / 100)) : price;
  const count = (id: string) => picks.filter((p) => p === id).length;

  const pick = (id: string) => { if (n < BOX_MAX) { setPicks((p) => [...p, id]); setAdded(false); } };
  const drop = (i: number) => setPicks((p) => p.filter((_, j) => j !== i));
  const add = () => {
    addBox(picks, tray.current?.querySelector("img"), gift && note.trim() ? note.trim() : undefined, every ?? undefined);
    setPicks([]);
    setNote("");
    setAdded(true);
  };

  const status = added && n === 0 ? "In your bag. Build another?"
    : n < BOX_SIZE ? `Pick ${BOX_SIZE - n} more.`
    : n < BOX_MAX ? `Box of ${n}. One more saves ${inr(boxPrice(n) + BAG_PRICE - boxPrice(n + 1))}.`
    : `Box of ${BOX_MAX}. That's the most a box holds.`;

  return (
    <section id="box" className={styles.section} aria-labelledby="box-title" data-full={full || undefined}>
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <Heading id="box-title" className={`${ui.display} ${styles.title}`}>Build a box of {BOX_SIZE} to {BOX_MAX}.</Heading>
          <p className={`${ui.lede} ${styles.lede}`}>Any mix, doubles welcome. The more bags in the box, the less each one costs.</p>

          {/* The price ladder: every size, its price and what it saves, the current one marked. */}
          <ol className={styles.ladder} aria-label="Box prices">
            {Array.from({ length: BOX_MAX - BOX_SIZE + 1 }, (_, i) => BOX_SIZE + i).map((s) => (
              <li key={s} aria-current={n === s ? "true" : undefined}>
                <strong>{s} bags</strong>
                <span className={ui.display}>{inr(boxPrice(s))}</span>
                <small>Save {inr(s * BAG_PRICE - boxPrice(s))}</small>
              </li>
            ))}
          </ol>

          <div className={styles.presets} role="group" aria-label="Start from a ready-made box">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className={styles.preset} onClick={() => { setPicks(p.ids()); setAdded(false); }}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className={styles.builder}>
          <ol ref={tray} className={styles.tray} aria-label="Your box">
            {Array.from({ length: BOX_MAX }, (_, i) => {
              const f = picks[i] ? byId(picks[i]) : null;
              return (
                <li key={i} className={styles.slot} data-full={f ? true : undefined} data-extra={i >= BOX_SIZE || undefined}>
                  {f ? (
                    <button type="button" className={styles.remove} onClick={() => drop(i)} aria-label={`Remove ${f.name} from slot ${i + 1}`}>
                      <Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="(max-width: 700px) 14vw, 90px" />
                      <span aria-hidden="true">×</span>
                    </button>
                  ) : (
                    <span className={styles.empty}><span className={ui.sr}>Slot </span>{i + 1}<span className={ui.sr}>, empty{i >= BOX_SIZE ? ", optional" : ""}</span></span>
                  )}
                </li>
              );
            })}
          </ol>
          <p className={styles.trayNote}>Slots 1 to {BOX_SIZE} make a box. {BOX_SIZE + 1} to {BOX_MAX} are optional, and each one lowers the price per bag.</p>

          <ul className={styles.picker} aria-label="Flavours">
            {FLAVOURS.map((f) => (
              <li key={f.id}>
                <button type="button" className={styles.chip} disabled={n >= BOX_MAX} onClick={() => pick(f.id)} aria-label={`Add ${f.name} to your box`}>
                  <PackThumb id={f.id} size={26} />
                  {f.name}
                  {count(f.id) > 0 && <span className={styles.chipCount} aria-label={`, ${count(f.id)} in box`}>{count(f.id)}</span>}
                </button>
              </li>
            ))}
          </ul>

          {full && (
            <div className={styles.options}>
              <fieldset className={styles.option}>
                <legend className={forms.label}>How often</legend>
                <div className={forms.segments}>
                  <button type="button" className={forms.segment} aria-pressed={!every} onClick={() => setEvery(null)}>Just this once</button>
                  {SUB_EVERY.map((w) => (
                    <button key={w} type="button" className={forms.segment} aria-pressed={every === w} onClick={() => setEvery(w)}>Every {w} weeks, {SUB_OFF}% off</button>
                  ))}
                </div>
              </fieldset>
              <div className={styles.option}>
                <label className={forms.check}>
                  <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
                  It&rsquo;s a gift: add a note on the sleeve, no prices inside
                </label>
                {gift && (
                  <div className={forms.field}>
                    <label className={ui.sr} htmlFor="gift-note">Gift note</label>
                    <textarea id="gift-note" className={forms.input} rows={3} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Happy birthday. Save me the Tiramisu." />
                    <p className={forms.hint}>{NOTE_MAX - note.length} characters left</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.foot}>
            <p className={styles.status} aria-live="polite">{status}</p>
            <div className={styles.footRight}>
              {ready && (
                <span className={styles.sum}>
                  {every && <s>{inr(price)}</s>} <strong className={ui.display}>{inr(unit)}</strong>
                  <small>{inr(Math.round(unit / n))} a bag</small>
                </span>
              )}
              <button type="button" className={ui.btnPaprika} disabled={!ready} onClick={add}>
                {ready ? `Add box of ${n}` : `Add box, from ${inr(boxPrice(BOX_SIZE))}`}
              </button>
            </div>
          </div>
          {added && n === 0 && <p className={styles.added} role="status"><button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setOpen(true)}>View bag</button></p>}
          {!full && <p className={styles.more}>Want it every few weeks, or as a gift? <Link href="/build-a-box" className={ui.link}>More box options</Link></p>}
        </div>
      </div>
    </section>
  );
}
