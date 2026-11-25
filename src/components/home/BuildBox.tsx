"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BAG_PRICE, BOX_MAX, BOX_SIZE, FLAVOURS, SUB_EVERY, SUB_OFF, boxPrice, byId, inr, type Every } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { BUNDLES as COMBOS } from "@/lib/bundles";
import { MOTION_OK } from "@/lib/motion";
import { Pack } from "@/components/shop/Pack";
import { BoxScene, type BoxSceneHandle } from "./BoxScene";
import ui from "./ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./BuildBox.module.css";

const NOTE_MAX = 120;

/**
 * The box: 4 to 7 bags, any mix, doubles welcome (requirements form). It reads top to bottom:
 * the flavours, then a Makzo's mailer box standing open, its lid hinged back. Tap a
 * flavour and its pack drops into the next slot; tap a pack in the box to take it out. Pack
 * it, and the packs lie down, the lid swings shut, a seal goes on and the closed box flies
 * into the bag; a fresh empty box slides in. The box is a three.js scene (BoxScene). Ready-made combos close the section.
 * On its own page (`full`) the box can also be a subscription or a gift with a note.
 */
export function BuildBox({ full = false, as: Heading = "h2" }: { full?: boolean; as?: "h1" | "h2" }) {
  const [picks, setPicks] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [packing, setPacking] = useState(false);
  const [every, setEvery] = useState<Every | null>(null);
  const [gift, setGift] = useState(false);
  const [note, setNote] = useState("");
  const { addBox, setOpen } = useCart();
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<BoxSceneHandle>(null);

  const n = picks.length;
  const ready = n >= BOX_SIZE;
  const price = ready ? boxPrice(n) : 0;
  const unit = every ? Math.round(price * (1 - SUB_OFF / 100)) : price;
  const count = (id: string) => picks.filter((p) => p === id).length;

  const pick = (id: string) => { if (n < BOX_MAX && !packing) { setPicks((p) => [...p, id]); setAdded(false); } };
  const drop = (i: number) => { if (!packing) setPicks((p) => p.filter((_, j) => j !== i)); };
  const dropOne = (id: string) => { if (!packing) setPicks((p) => { const i = p.lastIndexOf(id); return i < 0 ? p : p.filter((_, j) => j !== i); }); };

  /** Close the box and send it to the bag. `ids` is passed in when a combo packs itself. */
  const pack = (ids: string[] = picks) => {
    if (ids.length < BOX_SIZE || packing) return;
    const giftNote = gift && note.trim() ? note.trim() : undefined;
    const sub = every ?? undefined;
    const finish = () => { setPicks([]); setNote(""); setAdded(true); setPacking(false); };
    if (!scene.current || !window.matchMedia(MOTION_OK).matches) { addBox(ids, null, giftNote, sub); finish(); return; }
    setPacking(true);
    // The scene lays the packs down, shuts the lid, seals it, and hands over a picture of the box to fly.
    scene.current.pack((shot) => addBox(ids, shot, giftNote, sub), finish);
  };

  /** A combo fills the box; "Pack and add" then closes it once the packs have landed. */
  const takeCombo = (ids: string[], andPack: boolean) => {
    if (packing) return;
    setPicks(ids);
    setAdded(false);
    stage.current?.scrollIntoView({ block: "center", behavior: window.matchMedia(MOTION_OK).matches ? "smooth" : "auto" });
    if (andPack) window.setTimeout(() => pack(ids), 900);
  };

  const status = packing ? "Packing your box…"
    : added && n === 0 ? "Packed and in your bag."
    : n < BOX_SIZE ? `Pick ${BOX_SIZE - n} more.`
    : n < BOX_MAX ? `Box of ${n}. One more saves ${inr(boxPrice(n) + BAG_PRICE - boxPrice(n + 1))}.`
    : `Box of ${BOX_MAX}. Full.`;

  return (
    <section id="box" className={styles.section} aria-labelledby="box-title" data-full={full || undefined}>
      <div className={`${ui.shell} ${styles.inner}`}>
        <header className={styles.head}>
          <Heading id="box-title" className={`${ui.display} ${styles.title}`}>Build a box of {BOX_SIZE} to {BOX_MAX}.</Heading>
          <p className={`${ui.lede} ${styles.lede}`}>Pick your flavours and watch them go in. Doubles welcome; the fuller the box, the less each bag costs.</p>
        </header>

        {/* ---------- 2. The box, and what it costs ---------- */}
        <div className={styles.packing}>
          {/* The Makzo's mailer box, in three.js: see BoxScene. */}
          <div ref={stage} className={styles.stage}>
            <BoxScene ref={scene} picks={picks} onDrop={drop} locked={packing} label={n > 0 ? `Box of ${n}` : "Your box"} />
            {/* The same packs as buttons, for keyboards and screen readers. */}
            <ol className={ui.sr} aria-label={`Your box, ${n} of ${BOX_MAX}`}>
              {picks.map((id, i) => (
                <li key={i}><button type="button" onClick={() => drop(i)} disabled={packing}>Take {byId(id).name} out of the box</button></li>
              ))}
            </ol>
          </div>

          <div className={styles.controls}>
            {/* ---------- The flavours: beside the box, so every tap is seen landing ---------- */}
            <ul className={styles.flavours} aria-label="Flavours: tap one to put it in the box">
              {FLAVOURS.map((f) => {
                const c = count(f.id);
                return (
                  <li key={f.id} className={styles.flavourItem} data-in={c > 0 || undefined}>
                    <button type="button" className={styles.flavour} disabled={n >= BOX_MAX || packing} onClick={() => pick(f.id)}
                      aria-label={`Add ${f.name} to your box${c ? `, ${c} in it` : ""}`}>
                      <Pack id={f.id} sizes="120px" className={styles.flavourPack} alt="" />
                      <span className={styles.flavourName}>{f.name}</span>
                      <span className={styles.plus} aria-hidden="true">{c > 0 ? c : "+"}</span>
                    </button>
                    {/* Once it's in, it can come out again: the last one of this flavour leaves the box. */}
                    {c > 0 && (
                      <button type="button" className={styles.minus} disabled={packing} onClick={() => dropOne(f.id)} aria-label={`Take one ${f.name} out of your box`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

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
                      <textarea id="gift-note" className={forms.input} rows={3} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Happy birthday. Save me the Rasam." />
                      <p className={forms.hint}>{NOTE_MAX - note.length} characters left</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className={styles.status} aria-live="polite">{status}</p>
            <div className={styles.foot}>
              {ready && (
                <span className={styles.sum}>
                  {every && <s>{inr(price)}</s>} <strong className={ui.display}>{inr(unit)}</strong>
                  <small>{inr(Math.round(unit / n))} a bag</small>
                </span>
              )}
              <button type="button" className={`${ui.btnPaprika} ${styles.packBtn}`} disabled={!ready || packing} onClick={() => pack()}>
                {ready ? `Pack it and add to bag` : `Pick ${BOX_SIZE - n} more to pack`}
              </button>
            </div>
            {added && n === 0 && !packing && (
              <p className={styles.added}><button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setOpen(true)}>View bag</button> or build another.</p>
            )}
            {!full && <p className={styles.more}>Want it every few weeks, or as a gift? <Link href="/build-a-box" className={ui.link}>More box options</Link></p>}
          </div>
        </div>

        {/* ---------- 3. Combos: ready-made boxes ---------- */}
        <div className={styles.combosHead}>
          <h3 className={`${ui.display} ${styles.combosTitle}`}>Or pack a combo.</h3>
          <p className={styles.combosLede}>Boxes we&rsquo;ve already worked out. One tap packs it.</p>
        </div>
        <ul className={styles.combos}>
          {COMBOS.map((c) => (
            <li key={c.id} className={styles.combo}>
              <div className={styles.fan} aria-hidden="true">
                {c.mystery
                  ? Array.from({ length: 4 }, (_, i) => <span key={i} className={styles.mystery} style={{ rotate: `${(i - 1.5) * 9}deg` }}>?</span>)
                  : [...new Set(c.ids())].slice(0, 4).map((id, i, a) => (
                    <Pack key={id} id={id} sizes="90px" alt="" className={styles.fanPack} tilt={(i - (a.length - 1) / 2) * 9} />
                  ))}
              </div>
              <h4 className={`${ui.display} ${styles.comboName}`}>{c.name}</h4>
              <p className={styles.comboDek}>{c.dek}</p>
              <p className={styles.comboPrice}>
                <strong className={ui.display}>{inr(boxPrice(c.size))}</strong>
                <s>{inr(c.size * BAG_PRICE)}</s>
                <span>{c.size} bags</span>
              </p>
              <div className={styles.comboActions}>
                <button type="button" className={ui.btnDark} disabled={packing} onClick={() => takeCombo(c.ids(), true)}>Pack and add</button>
                <button type="button" className={`${ui.link} ${forms.textBtn}`} disabled={packing} onClick={() => takeCombo(c.ids(), false)}>Edit in the box</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
