"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { BAG_PRICE, BOX_MAX, BOX_SIZE, FLAVOURS, PACK_H, PACK_W, SUB_EVERY, SUB_OFF, boxPrice, byId, inr, type Every } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { BUNDLES as COMBOS } from "@/lib/bundles";
import { MOTION_OK, gsap } from "@/lib/motion";
import { Pack } from "@/components/shop/Pack";
import { Makhana, makhanaImage } from "./Makhana";
import { BoxFront } from "./BoxFront";
import ui from "./ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./BuildBox.module.css";

const NOTE_MAX = 120;

/**
 * The box: 4 to 7 bags, any mix, doubles welcome (requirements form). It reads top to bottom:
 * the flavours, then a Makzo's box standing open with its lid propped up behind it. Tap a
 * flavour and its pack drops into the next slot; tap a pack in the box to take it out. Pack
 * it, and the packs settle, the lid flips shut, a sticker goes on and the closed box flies
 * into the bag; a fresh empty box slides in. Ready-made combos close the section.
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
    const el = stage.current;
    if (!el || !window.matchMedia(MOTION_OK).matches) { addBox(ids, null, giftNote, sub); finish(); return; }

    const q = gsap.utils.selector(el);
    const box = q(`.${styles.box}`)[0] as HTMLElement;
    const packs = q(`.${styles.pack}`);
    const lid = q(`.${styles.lid}`)[0] as HTMLElement;
    const cq = el.clientWidth / 100; // one container unit, in px: the lid's moves are measured in them
    const parts = [box, lid, ...packs, ...q(`.${styles.slots}, .${styles.sticker}`)];
    setPacking(true);
    gsap.timeline()
      // The deck settles down into the box, front card first.
      .to([...packs].reverse(), { yPercent: 38, autoAlpha: 0, duration: 0.32, stagger: 0.04, ease: "power2.in" })
      .set(q(`.${styles.slots}`), { autoAlpha: 0 })
      // The lid lifts off its prop and comes down square onto the box.
      .fromTo(lid, { y: -29 * cq, z: -52 * cq, rotationX: -60 }, { y: -12 * cq, z: -6 * cq, rotationX: -8, duration: 0.45, ease: "power2.inOut" }, "-=0.15")
      .to(lid, { y: 0, z: 0, rotationX: 0, duration: 0.3, ease: "power3.in" })
      .to(box, { y: 7, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" })
      // The seal goes on.
      .fromTo(q(`.${styles.sticker}`), { scale: 2.2, autoAlpha: 0, rotation: -40 }, { scale: 1, autoAlpha: 1, rotation: -10, duration: 0.38, ease: "back.out(2.2)", immediateRender: false })
      .to({}, { duration: 0.35 })
      // Into the bag: the cart flies a copy of the closed box to the bag button.
      .call(() => { addBox(ids, box, giftNote, sub); gsap.set(box, { autoAlpha: 0 }); })
      .to({}, { duration: 0.75 })
      // A fresh, open box slides in.
      .call(() => { gsap.set(parts, { clearProps: "all" }); finish(); })
      .fromTo(box, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", clearProps: "all", immediateRender: false });
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
          {/*
            * The Makzo's box in 3D, printed like the packaging (guide D4): Paprika board with the
            * wordmark, the slanted tagline ribbon and the checkerboard edge; black inside, lined with
            * the checkerboard tissue; the lid in the makhana gift-wrap repeat, propped open behind it. The packs stand in it one behind another like a deck of
            * cards, the first one picked at the back. Packing lays them down, swings the lid
            * shut, stamps it, and the closed box flies into the bag.
            */}
          <div ref={stage} className={styles.stage} style={{ "--seed": makhanaImage("ink", 70) } as React.CSSProperties}>
            <div className={styles.box}>
              <span className={styles.ground} aria-hidden="true" />
              <div className={styles.cube}>
                <span className={styles.floor} aria-hidden="true" />
                {(["wBack", "wLeft", "wRight"] as const).map((w) => (
                  <span key={w} className={`${styles.wall} ${styles[w]}`} aria-hidden="true">
                    {/* The sides carry the brand pattern and the tagline, like the pack's back panel. */}
                    <span className={styles.out}>{w !== "wBack" && <span className={`${ui.label} ${styles.sideLine}`}>Nothing artificial. Nothing unnecessary.</span>}</span>
                    <span className={styles.in} />
                  </span>
                ))}
                <ol className={styles.slots} aria-label={`Your box, ${n} of ${BOX_MAX}`}>
                  {picks.map((id, i) => {
                    const f = byId(id);
                    // Back to front, like cards in a deck: the first pick stands at the back.
                    return (
                      <li key={i} className={styles.slot} style={{ "--z": `${-19 + i * 6.2}cqw` } as React.CSSProperties}>
                        <button type="button" className={styles.pack} onClick={() => drop(i)} aria-label={`Take ${f.name} out of the box`}>
                          <Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="160px" />
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <span className={`${styles.wall} ${styles.wFront}`} aria-hidden="true">
                  <span className={styles.out}>
                    {/* Printed like the packs: Paprika, the wordmark in white, the tagline on a slanted ribbon. */}
                    <BoxFront className={styles.print} label={n > 0 ? `Box of ${n}` : "Your box"}>
                      <span className={styles.sticker}>
                        <Makhana variant="fill" className={styles.stickerSeed} />
                        <strong>Packed</strong>
                      </span>
                    </BoxFront>
                  </span>
                  <span className={styles.in} />
                </span>
                {/* The lid: a shallow black box of its own, propped open behind until packing. */}
                <span className={styles.lid} aria-hidden="true">
                  <span className={`${styles.lidFace} ${styles.lidTop}`}>
                    <span className={styles.out}>
                      <span className={styles.lidBadge}>
                        <Image src="/brand/logo-light.png" alt="" width={1200} height={296} className={styles.lidLogo} />
                      </span>
                    </span>
                    <span className={styles.in} />
                  </span>
                  {(["lidFront", "lidBack", "lidLeft", "lidRight"] as const).map((r) => (
                    <span key={r} className={`${styles.lidFace} ${styles.rim} ${styles[r]}`}><span className={styles.out} /><span className={styles.in} /></span>
                  ))}
                </span>
              </div>
            </div>
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
                      <textarea id="gift-note" className={forms.input} rows={3} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Happy birthday. Save me the Tiramisu." />
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
