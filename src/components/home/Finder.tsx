"use client";

import { useRef, useState } from "react";
import { BAG_PRICE, BOX_SIZE, FEATURED, boxPrice, byId, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useAvailable } from "@/lib/catalog";
import { EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { Pack, PackThumb } from "@/components/shop/Pack";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Finder.module.css";

/** Each taste points at the flavour that leads it, and one to try next. */
const TASTES: { id: string; label: string; picks: [lead: string, next: string] }[] = [
  { id: "spicy", label: "Something spicy", picks: ["thai-chilli", "chettinadu"] },
  { id: "tangy", label: "Tangy and sour", picks: ["sweet-tamarind", "rasam"] },
  { id: "cheesy", label: "Cheesy and comforting", picks: ["mac-cheese", "rasam"] },
  { id: "sweet", label: "A little sweet", picks: [/* "tiramisu" */ "sweet-tamarind", "mac-cheese"] },
  { id: "herby", label: "Herby and savoury", picks: ["curry-leaves", "chettinadu"] },
];

const WHO = [
  { id: "me", label: "Just me" },
  { id: "share", label: "For sharing" },
] as const;

type Taste = (typeof TASTES)[number];

/**
 * Two questions to a recommendation, brought over from version 2 into the white page as a short
 * Paprika band: the title and progress on the left, the question on the right (stacked on a
 * phone). It's a real sequence, so the steps are numbered, every answer is one tap, and the
 * result always ends on something to add to the bag.
 */
export function Finder() {
  const [taste, setTaste] = useState<Taste | null>(null);
  const [who, setWho] = useState<"me" | "share" | null>(null);
  const { addBag, addBox } = useCart();
  const available = useAvailable();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shot = useRef<HTMLDivElement>(null);
  const step = !taste ? 1 : !who ? 2 : 3;

  // Each step lands with its options dealt in one after another.
  useGSAP(
    () => {
      if (!window.matchMedia(MOTION_OK).matches || !stage.current) return;
      gsap.fromTo(stage.current.querySelectorAll("[data-deal]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.04, ease: EASE });
    },
    { scope: root, dependencies: [step] },
  );

  const lead = taste ? byId(taste.picks[0]) : null;
  const next = taste ? byId(taste.picks[1]) : null;
  // For sharing: the two matches, filled out with the lead flavours not already in.
  const box = taste ? [...taste.picks, ...FEATURED.map((f) => f.id).filter((id) => !taste.picks.includes(id))].slice(0, BOX_SIZE) : [];
  const leadOk = lead ? available(lead.id) : false;
  const bothOk = leadOk && next ? available(next.id) : false;
  const boxOk = box.every((id) => available(id));
  const reset = () => { setTaste(null); setWho(null); };

  return (
    <section id="finder" ref={root} className={styles.section} aria-labelledby="finder-title">
      <div className={`${ui.shell} ${styles.room}`}>
        <header className={styles.head}>
          <h2 id="finder-title" className={`${ui.display} ${styles.title}`}>Find your flavour in two taps.</h2>
          <ol className={styles.steps} aria-label="Progress">
            {["Taste", "Who for", "Your pick"].map((s, i) => (
              <li key={s} className={styles.stepDot} data-on={i + 1 <= step || undefined} aria-current={i + 1 === step ? "step" : undefined}>
                <span>{i + 1}</span>{s}
              </li>
            ))}
          </ol>
        </header>

        <div ref={stage} className={styles.stage} aria-live="polite">
          {step === 1 && (
            <>
              <p className={styles.question} data-deal>What are you in the mood for?</p>
              <div className={styles.options}>
                {TASTES.map((t) => (
                  <button key={t.id} type="button" className={styles.option} data-deal onClick={() => setTaste(t)}>
                    <span className={styles.optionPacks} aria-hidden="true">
                      {t.picks.map((id) => <PackThumb key={id} id={id} size={26} />)}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className={styles.question} data-deal>Who&rsquo;s it for?</p>
              <div className={`${styles.options} ${styles.optionsTwo}`}>
                {WHO.map((w) => (
                  <button key={w.id} type="button" className={styles.option} data-deal onClick={() => setWho(w.id)}>
                    <Makhana variant={w.id === "me" ? "fill" : "ink"} className={styles.optionSeed} />
                    {w.label}
                  </button>
                ))}
              </div>
              <button type="button" className={`${ui.link} ${styles.back}`} data-deal onClick={reset}>Change the taste</button>
            </>
          )}

          {step === 3 && lead && next && (
            <div className={styles.result}>
              {who === "me" ? (
                // The match up front, the one to try next tucked behind it: the pair "Add with" buys.
                <div ref={shot} className={styles.resultPair} data-deal>
                  <span className={styles.pairNext}><Pack id={next.id} sizes="(max-width: 760px) 80px, 120px" alt={`${next.name}, to try next`} /></span>
                  <span className={styles.pairLead}><Pack id={lead.id} sizes="(max-width: 760px) 100px, 150px" /></span>
                </div>
              ) : (
                <div ref={shot} className={styles.resultFan} data-deal>
                  {box.map((id, i) => (
                    <span key={id} className={styles.fanSlot} style={{ "--i": i } as React.CSSProperties}>
                      <Pack id={id} sizes="80px" alt={byId(id).name} />
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.resultText} data-deal>
                {who === "me" ? (
                  <>
                    <p className={styles.resultKicker}>Start with</p>
                    <p className={`${ui.label} ${styles.resultName}`}>{lead.name}</p>
                    <p className={styles.resultLine}>{lead.inspired} Then try {next.name}.</p>
                  </>
                ) : (
                  <>
                    <p className={styles.resultKicker}>A box of {BOX_SIZE} for the table</p>
                    <p className={`${ui.label} ${styles.resultName} ${styles.resultNames}`}>{box.map((id) => byId(id).name).join(", ")}</p>
                  </>
                )}
                <div className={styles.resultCtas}>
                  {who === "me" ? (
                    <>
                      <button type="button" className={styles.cta} disabled={!leadOk} onClick={() => addBag(lead.id, shot.current)}>
                        {leadOk ? <>Add {lead.name}, <span className={ui.play}>{inr(BAG_PRICE)}</span></> : `${lead.name} is sold out`}
                      </button>
                      {bothOk && (
                        <button type="button" className={styles.ctaLine} onClick={() => { addBag(lead.id, shot.current); addBag(next.id, null, { quiet: true }); }}>
                          Add with {next.name}, <span className={ui.play}>{inr(BAG_PRICE * 2)}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button type="button" className={styles.cta} disabled={!boxOk} onClick={() => addBox(box, shot.current)}>
                      {boxOk ? <>Add this box, <span className={ui.play}>{inr(boxPrice(BOX_SIZE))}</span></> : "One of these is sold out"}
                    </button>
                  )}
                </div>
                <button type="button" className={`${ui.link} ${styles.back}`} onClick={reset}>Start again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
