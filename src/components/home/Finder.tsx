"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FEATURED, PACK_H, PACK_W, byId, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Finder.module.css";

/** Each taste points at the flavour that leads it, and one to try next. */
const TASTES: { id: string; label: string; picks: [lead: string, next: string] }[] = [
  { id: "spicy", label: "Something spicy", picks: ["thai-chilli", "chettinadu"] },
  { id: "tangy", label: "Tangy and sour", picks: ["sweet-tamarind", "rasam"] },
  { id: "cheesy", label: "Cheesy and comforting", picks: ["mac-cheese", "rasam"] },
  { id: "sweet", label: "A little sweet", picks: ["tiramisu", "sweet-tamarind"] },
  { id: "herby", label: "Herby and savoury", picks: ["curry-leaves", "chettinadu"] },
];

const WHO = [
  { id: "me", label: "Just me" },
  { id: "share", label: "For sharing" },
] as const;

type Taste = (typeof TASTES)[number];

/**
 * Two questions to a recommendation. It's a real sequence, so the steps are numbered,
 * and every answer is one tap. The result always ends on something to add to the bag.
 */
export function Finder() {
  const [taste, setTaste] = useState<Taste | null>(null);
  const [who, setWho] = useState<"me" | "share" | null>(null);
  const { addBag, addBox } = useCart();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const step = !taste ? 1 : !who ? 2 : 3;

  // Each step lands with its options dealt in one after another.
  useGSAP(
    () => {
      if (!window.matchMedia(MOTION_OK).matches || !stage.current) return;
      gsap.fromTo(stage.current.querySelectorAll("[data-deal]"), { autoAlpha: 0, y: 24, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06, ease: EASE });
    },
    { scope: root, dependencies: [step] },
  );

  const lead = taste ? byId(taste.picks[0]) : null;
  const next = taste ? byId(taste.picks[1]) : null;
  // For sharing: the two matches, filled out with the lead flavours not already in.
  const box = taste ? [...taste.picks, ...FEATURED.map((f) => f.id).filter((id) => !taste.picks.includes(id))].slice(0, BOX_SIZE) : [];
  const reset = () => { setTaste(null); setWho(null); };

  return (
    <section id="finder" ref={root} className={styles.section} aria-labelledby="finder-title">
      <div className={`${ui.shell} ${styles.inner}`}>
        <Makhana variant="outline" className={styles.mark} />
        <h2 id="finder-title" className={`${ui.display} ${styles.title}`}>Find your flavour in two taps.</h2>

        <ol className={styles.steps} aria-label="Progress">
          {["Taste", "Who for", "Your pick"].map((s, i) => (
            <li key={s} className={styles.stepDot} data-on={i + 1 <= step || undefined} aria-current={i + 1 === step ? "step" : undefined}>
              <span>{i + 1}</span>{s}
            </li>
          ))}
        </ol>

        <div ref={stage} className={styles.stage} aria-live="polite">
          {step === 1 && (
            <>
              <p className={styles.question} data-deal>What are you in the mood for?</p>
              <div className={styles.options}>
                {TASTES.map((t) => (
                  <button key={t.id} type="button" className={styles.option} data-deal onClick={() => setTaste(t)}>
                    <span className={styles.optionPacks} aria-hidden="true">
                      {t.picks.map((id) => <Image key={id} src={byId(id).pack} alt="" width={PACK_W} height={PACK_H} sizes="48px" />)}
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
              <div className={styles.options}>
                {WHO.map((w) => (
                  <button key={w.id} type="button" className={`${styles.option} ${styles.optionWide}`} data-deal onClick={() => setWho(w.id)}>
                    <Makhana variant={w.id === "me" ? "fill" : "outline"} className={styles.optionSeed} />
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
                <>
                  <div className={styles.resultPack} data-deal>
                    <Image src={lead.pack} alt={`${lead.name} pack`} width={PACK_W} height={PACK_H} sizes="240px" />
                  </div>
                  <div className={styles.resultText} data-deal>
                    <p className={styles.resultKicker}>Start with</p>
                    <p className={`${ui.display} ${styles.resultName}`}>{lead.name}</p>
                    <p className={styles.resultLine}>{lead.inspired} Then try {next.name}.</p>
                    <div className={styles.resultCtas}>
                      <button type="button" className={ui.btn} onClick={(e) => addBag(lead.id, e.currentTarget.closest(`.${styles.result}`)?.querySelector("img"))}>
                        Add {lead.name}, {inr(BAG_PRICE)}
                      </button>
                      <button type="button" className={ui.btnLine} onClick={() => { addBag(lead.id); addBag(next.id); }}>
                        Add both, {inr(BAG_PRICE * 2)}
                      </button>
                    </div>
                    <button type="button" className={`${ui.link} ${styles.back}`} onClick={reset}>Start again</button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.resultFan} data-deal>
                    {box.map((id, i) => (
                      <Image key={id} src={byId(id).pack} alt={byId(id).name} width={PACK_W} height={PACK_H} sizes="140px" style={{ "--i": i } as React.CSSProperties} />
                    ))}
                  </div>
                  <div className={styles.resultText} data-deal>
                    <p className={styles.resultKicker}>A box of {BOX_SIZE} for the table</p>
                    <p className={`${ui.display} ${styles.resultName}`}>{box.map((id) => byId(id).name).join(", ")}</p>
                    <p className={styles.resultLine}>Led by {lead.name}, with a flavour for everyone else.</p>
                    <div className={styles.resultCtas}>
                      <button type="button" className={ui.btn} onClick={(e) => addBox(box, e.currentTarget.closest(`.${styles.result}`)?.querySelector(`.${styles.resultFan}`) as HTMLElement)}>
                        Add this box, {inr(BOX_PRICE)}
                      </button>
                    </div>
                    <button type="button" className={`${ui.link} ${styles.back}`} onClick={reset}>Start again</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
