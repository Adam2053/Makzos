"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FLAVOURS, byId, productHref } from "@/lib/products";
import { RECIPES } from "@/lib/recipes";
import { PackThumb } from "./Pack";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import styles from "./Recipes.module.css";

/**
 * Things to make with a bag, as a row of recipe cards to swipe through: this flavour's own
 * first, then the rest of the range's, each marked with the bag it uses. Ingredients tick
 * off as you gather them. Then what to have it with.
 */
export function Recipes({ id }: { id: string }) {
  const f = byId(id);
  const { pairings } = RECIPES[id];
  const cards = [id, ...FLAVOURS.map((x) => x.id).filter((x) => x !== id)].flatMap((fid) => RECIPES[fid]?.recipes.map((r) => ({ r, fid })) ?? []);
  const [got, setGot] = useState<Record<string, boolean>>({});
  const rail = useRef<HTMLUListElement>(null);

  /** The arrows move the row by most of what's on screen; scroll-snap settles it on a card. */
  const slide = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section id="recipes" className={styles.section} aria-labelledby="recipes-title" style={{ "--field": f.field } as React.CSSProperties}>
      <div className={ui.shell}>
        <header className={styles.head}>
          <h2 id="recipes-title" className={`${ui.display} ${styles.title}`}>Beyond the bag.</h2>
          <div className={styles.side}>
            <p className={`${ui.lede} ${styles.lede}`}>Quick things to make with a bag of {f.name}, then ideas from the rest of the range.</p>
            <div className={styles.arrows}>
              <button type="button" onClick={() => slide(-1)} aria-label="Earlier recipes">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => slide(1)} aria-label="More recipes">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* The row runs to the screen's edge, so the next recipe is always peeking in. */}
      <div className={styles.bleed}>
        <ul ref={rail} className={styles.rail} tabIndex={0} aria-label="Recipes, scroll sideways for more">
          {cards.map(({ r, fid }) => {
            const ready = r.ingredients.filter((_, i) => got[`${r.id}-${i}`]).length;
            const own = fid === id;
            return (
              <li key={r.id} className={styles.card}>
                <article aria-labelledby={`recipe-${r.id}`}>
                  <div className={styles.meta}>
                    {own
                      ? <span className={styles.own}>With this bag</span>
                      : <Link href={productHref(fid)} className={styles.from}><PackThumb id={fid} size={20} /> With {byId(fid).name}</Link>}
                    <span><Clock /> {r.minutes} min</span>
                    <span><Bowl /> Serves {r.serves}</span>
                  </div>
                  <h3 id={`recipe-${r.id}`} className={`${ui.display} ${styles.cardTitle}`}>{r.title}</h3>
                  <p className={styles.dek}>{r.dek}</p>

                  <h4 className={styles.h4}>You&rsquo;ll need <span>{ready} of {r.ingredients.length}</span></h4>
                  <ul className={styles.ingredients}>
                    {r.ingredients.map((x, i) => {
                      const k = `${r.id}-${i}`;
                      return (
                        <li key={k}>
                          <label className={forms.check}>
                            <input type="checkbox" checked={!!got[k]} onChange={(e) => setGot((g) => ({ ...g, [k]: e.target.checked }))} />
                            <span data-done={got[k] || undefined}>{x}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <h4 className={styles.h4}>Method</h4>
                  <ol className={styles.steps}>
                    {r.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`${ui.shell} ${styles.pairs}`}>
        <div className={styles.pairsHead}>
          <h3 className={styles.pairsTitle}>Good with</h3>
          <Link href="/journal?topic=recipes" className={ui.link}>More recipes in the Journal</Link>
        </div>
        <ul className={styles.pairList}>
          {pairings.map((p) => (
            <li key={p.name}>
              <strong className={ui.display}>{p.name}</strong>
              <span>{p.why}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Clock() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
}
function Bowl() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" /><path d="M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3" /></svg>;
}
