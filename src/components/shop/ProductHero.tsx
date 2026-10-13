"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BAG_PRICE, BOX_SIZE, MULTI_PRICE, MULTI_SIZE, SUB_EVERY, SUB_OFF, WEIGHT, boxPrice, byId, inr, type Every } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { COUPONS, FREE_FROM, serviceFor } from "@/lib/pricing";
import { HEADLINE } from "@/lib/nutrition";
import { ratingFor } from "@/lib/ugc";
import { useStore } from "@/lib/store";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import { Crumbs, SampleTag, Stars } from "./bits";
import { Pack, PackThumb } from "./Pack";
import { Heat, VegMark } from "./marks";
import { Makhana } from "@/components/home/Makhana";
import styles from "./ProductHero.module.css";

type View = "pack" | "studio" | "dish" | "facts";

/** Where the seeds fall around the pack, as percentages of the stage: kept clear of its middle. */
const SPILL = [
  { x: 7, y: 9, w: 11, r: -18 }, { x: 78, y: 15, w: 8, r: 24 }, { x: 4, y: 52, w: 7, r: 40 },
  { x: 84, y: 48, w: 11, r: -32 }, { x: 12, y: 70, w: 9, r: 12 }, { x: 76, y: 68, w: 7, r: -8 },
  { x: 36, y: 4, w: 5, r: 60 }, { x: 91, y: 31, w: 5, r: -50 },
];
type Format = "bag" | "multi" | "box";

const HIGHLIGHTS = [
  { title: "Roasted, not fried", text: "The crunch comes from the roaster." },
  { title: "No preservatives", text: "Nothing added to make it last." },
  { title: "No artificial colours or flavours", text: "The colour is the seasoning's own." },
  { title: "No INS-coded additives", text: "No row of numbers on the back." },
];

/**
 * The top of a flavour's page, built to sell without shouting. Left: the pack, on its own
 * colour (the one place flavour colour is used, per the requirements form), with three more
 * views. Right: what it is, then how to buy it, ordered by what people ask: which size, once
 * or regularly, how many, will it reach me.
 */
export function ProductHero({ id }: { id: string }) {
  const f = byId(id);
  const router = useRouter();
  const { addBag, addBox, setOpen, subtotal } = useCart();
  const { saved, toggleSaved } = useStore();
  const [view, setView] = useState<View>("pack");
  const [format, setFormat] = useState<Format>("bag");
  const [every, setEvery] = useState<Every | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinResult, setPinResult] = useState<ReturnType<typeof serviceFor> | null>(null);
  const [copied, setCopied] = useState(false);
  const [docked, setDocked] = useState(false);
  const buy = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rating = ratingFor(id);
  const isSaved = saved.includes(id);

  const base = format === "bag" ? BAG_PRICE : format === "multi" ? MULTI_PRICE : boxPrice(BOX_SIZE);
  const unit = every ? Math.round(base * (1 - SUB_OFF / 100)) : base;
  const total = unit * qty;
  const toFree = Math.max(0, FREE_FROM - subtotal);

  // Phones: once the buy buttons scroll away, a bar with the price and Add stays at the bottom.
  useEffect(() => {
    const el = buy.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDocked(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = (quiet = false) => {
    const from = quiet ? null : stage.current?.querySelector("img");
    if (format === "box") for (let i = 0; i < qty; i++) addBox(Array(BOX_SIZE).fill(id), i === 0 ? from : null, undefined, every ?? undefined);
    else addBag(id, from, { size: format === "multi" ? MULTI_SIZE : 1, every: every ?? undefined, qty, quiet });
    const what = format === "bag" ? `${qty} ${qty === 1 ? "bag" : "bags"}` : format === "multi" ? `${qty} × pack of ${MULTI_SIZE}` : `${qty} × box of ${BOX_SIZE}`;
    setAdded(`${what} of ${f.name} added${every ? `, delivered every ${every} weeks` : ""}.`);
  };

  const buyNow = () => { add(true); router.push("/checkout"); };

  const FORMATS: { id: Format; label: string; note: string; price: number; save?: number }[] = [
    { id: "bag", label: "1 bag", note: WEIGHT, price: BAG_PRICE },
    { id: "multi", label: `Pack of ${MULTI_SIZE}`, note: `${inr(Math.round(MULTI_PRICE / MULTI_SIZE))} a bag`, price: MULTI_PRICE, save: MULTI_SIZE * BAG_PRICE - MULTI_PRICE },
    { id: "box", label: `Box of ${BOX_SIZE}`, note: `${inr(boxPrice(BOX_SIZE) / BOX_SIZE)} a bag`, price: boxPrice(BOX_SIZE), save: BOX_SIZE * BAG_PRICE - boxPrice(BOX_SIZE) },
  ];

  const VIEWS: { id: View; label: string }[] = [
    { id: "pack", label: "The pack" },
    { id: "studio", label: "Close up" },
    { id: "dish", label: "The dish" },
    { id: "facts", label: "At a glance" },
  ];

  return (
    <section className={styles.section} aria-labelledby="product-title" style={{ "--field": f.field, "--ink": f.ink } as React.CSSProperties}>
      <div className={`${ui.shell} ${styles.crumbs}`}>
        <Crumbs items={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: f.name }]} />
      </div>
      <div className={`${ui.shell} ${styles.grid}`}>
        {/* ---------- Gallery ---------- */}
        <div className={styles.gallery}>
          <div className={styles.thumbs} role="group" aria-label="Pictures">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={styles.thumb} data-v={v.id} aria-pressed={view === v.id} onClick={() => setView(v.id)} aria-label={v.label}>
                {v.id === "pack" && <PackThumb id={id} size={30} />}
                {v.id === "studio" && <Image src={f.pack} alt="" fill sizes="80px" className={styles.thumbCrop} />}
                {v.id === "dish" && <Image src={f.dish.src} alt="" fill sizes="80px" style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />}
                {v.id === "facts" && <span className={styles.thumbFacts}>250<small>kcal</small></span>}
              </button>
            ))}
          </div>

          <div ref={stage} className={styles.stage} data-view={view}>
            {view === "pack" && (
              <>
                {/* Seeds spilled around the pack, faint, in the flavour's colour: the stage's only drawing. */}
                <span className={styles.spill} aria-hidden="true">
                  {SPILL.map((s, i) => (
                    <Makhana key={i} variant="tint" className={styles.spillSeed} style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, rotate: `${s.r}deg` }} />
                  ))}
                </span>
                <Pack id={id} sizes="(max-width: 900px) 56vw, 24vw" className={styles.bigPack} preload tilt={-3} />
                <span className={styles.floor} aria-hidden="true" />
                <p className={styles.line}>&ldquo;{f.line}&rdquo;</p>
              </>
            )}
            {view === "studio" && (
              <Image src={f.pack} alt={`The front of the ${f.name} pack, close up`} fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.studio} />
            )}
            {view === "dish" && (
              <>
                <Image src={f.dish.src} alt={`${f.inspired} The photo printed on the pack.`} fill sizes="(max-width: 900px) 100vw, 50vw"
                  className={styles.dish} style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
                <p className={`${styles.line} ${styles.lineOnPhoto}`}>{f.inspired}</p>
              </>
            )}
            {view === "facts" && (
              <div className={styles.facts}>
                <p className={ui.display}>Per {WEIGHT} pack</p>
                <dl>
                  {HEADLINE.map((h) => <div key={h.label}><dt>{h.label}</dt><dd className={ui.display}>{h.value}</dd></div>)}
                </dl>
                <a href="#specs" className={styles.factsLink}>Full nutrition and ingredients</a>
              </div>
            )}
            <button type="button" className={styles.save} aria-pressed={isSaved} onClick={() => toggleSaved(id)} aria-label={isSaved ? `Remove ${f.name} from saved` : `Save ${f.name} for later`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" /></svg>
            </button>
          </div>
        </div>

        {/* ---------- Buying ---------- */}
        <div className={styles.info}>
          <p className={styles.kicker}><VegMark /> Vegetarian <span aria-hidden="true" className={styles.sep} /> Roasted makhana <span aria-hidden="true" className={styles.sep} /> {WEIGHT}</p>
          <h1 id="product-title" className={`${ui.display} ${styles.title}`}>{f.name}</h1>
          <p className={styles.inspired}>{f.inspired}</p>

          <div className={styles.meta}>
            <a href="#reviews" className={styles.rating}>
              <Stars value={rating.average} />
              <span><strong>{rating.average}</strong> from {rating.count} reviews</span>
            </a>
            {rating.sample && <SampleTag />}
          </div>

          <div className={styles.notes}>
            <ul aria-label="What you taste">{f.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            <Heat level={f.heat} />
          </div>

          {/* Size */}
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Choose a size</legend>
            <div className={styles.formats}>
              {FORMATS.map((x) => (
                <label key={x.id} className={styles.format}>
                  <input type="radio" name="format" checked={format === x.id} onChange={() => setFormat(x.id)} />
                  <span className={styles.formatName}>{x.label}</span>
                  <span className={styles.formatPrice}>{inr(x.price)}</span>
                  <span className={styles.formatNote}>{x.note}</span>
                  {x.save ? <span className={styles.formatSave}>Save {inr(x.save)}</span> : null}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Once or regularly */}
          <fieldset className={styles.group}>
            <legend className={styles.legend}>How often</legend>
            <div className={forms.choices}>
              <label className={forms.choice}>
                <input type="radio" name="often" checked={!every} onChange={() => setEvery(null)} />
                <span className={forms.choiceBody}><strong>Just this once</strong></span>
                <span className={forms.choiceSide}>{inr(base)}</span>
              </label>
              <label className={forms.choice}>
                <input type="radio" name="often" checked={!!every} onChange={() => setEvery(SUB_EVERY[1])} />
                <span className={forms.choiceBody}>
                  <strong>Subscribe and save {SUB_OFF}%</strong>
                  <span>Delivered on a schedule. Skip, swap or cancel any time.</span>
                </span>
                <span className={forms.choiceSide}>{inr(Math.round(base * (1 - SUB_OFF / 100)))}</span>
              </label>
            </div>
            {every && (
              <div className={`${forms.segments} ${styles.every}`} role="group" aria-label="Deliver every">
                {SUB_EVERY.map((w) => (
                  <button key={w} type="button" className={forms.segment} aria-pressed={every === w} onClick={() => setEvery(w)}>Every {w} weeks</button>
                ))}
              </div>
            )}
          </fieldset>

          <div ref={buy} className={styles.buy}>
            <span className={styles.stepper} role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty === 1} aria-label="One fewer">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(24, q + 1))} aria-label="One more">+</button>
            </span>
            <button type="button" className={`${ui.btnPaprika} ${styles.add}`} onClick={() => add()}>Add to bag, {inr(total)}</button>
            <button type="button" className={`${ui.btnLine} ${styles.now}`} onClick={buyNow}>Buy now</button>
          </div>
          <p className={styles.added} role="status">
            {added && <>{added} <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setOpen(true)}>View bag</button></>}
          </p>

          <div className={styles.perks}>
            <p>
              <Truck />
              <span>{toFree > 0 ? <>Add <strong>{inr(toFree)}</strong> more for free delivery.</> : <>Your bag gets <strong>free delivery</strong>.</>}</span>
            </p>
            <p>
              <Tag />
              <span><strong>{COUPONS[0].label}</strong> with code {COUPONS[0].code}</span>
              <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => { navigator.clipboard?.writeText(COUPONS[0].code).catch(() => {}); setCopied(true); }}>
                {copied ? "Copied" : "Copy code"}
              </button>
            </p>
          </div>

          <form className={styles.pin} onSubmit={(e) => { e.preventDefault(); setPinResult(serviceFor(pin.trim())); }}>
            <label htmlFor="pin" className={forms.label}>Check delivery</label>
            <div className={forms.inline}>
              <input id="pin" className={forms.input} inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="Pincode"
                value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinResult(null); }}
                aria-invalid={pinResult && !pinResult.ok ? true : undefined} aria-describedby="pin-result" />
              <button type="submit" className={ui.btnLine}>Check</button>
            </div>
            <p id="pin-result" className={pinResult?.ok ? styles.pinOk : forms.hint} aria-live="polite">
              {pinResult ? pinResult.message : "Enter your pincode to see when it arrives. Cash on delivery available."}
            </p>
          </form>

          <ul className={styles.highlights}>
            {HIGHLIGHTS.map((h) => <li key={h.title}><strong>{h.title}</strong><span>{h.text}</span></li>)}
          </ul>

          <p className={styles.jump}>
            <a href="#specs" className={ui.link}>Nutrition and ingredients</a>
            <a href="#recipes" className={ui.link}>Recipes</a>
            <Link href="/build-a-box" className={ui.link}>Mix it in a box</Link>
          </p>
        </div>
      </div>

      {/* The phone bar: the pack, what's chosen, Add. */}
      <div className={styles.dock} data-on={docked || undefined} aria-hidden={!docked}>
        <PackThumb id={id} size={30} />
        <span className={styles.dockText}><strong>{f.name}</strong><span>{FORMATS.find((x) => x.id === format)!.label}{every ? `, every ${every} weeks` : ""}</span></span>
        <button type="button" className={ui.btnPaprika} onClick={() => add()} tabIndex={docked ? undefined : -1}>Add, {inr(total)}</button>
      </div>
    </section>
  );
}

function Truck() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></svg>;
}
function Tag() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.5V4.5h8l9 9-8 8-9-9Z" /><circle cx="8" cy="9" r="1.4" /></svg>;
}
