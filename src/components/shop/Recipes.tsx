"use client";

import Link from "next/link";
import { useState } from "react";
import { byId } from "@/lib/products";
import { RECIPES } from "@/lib/recipes";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import styles from "./Recipes.module.css";

/**
 * Two quick things to make with the bag, and what to have it with. Quiet on purpose: white
 * page, one soft card, type doing the work. Ingredients tick off as you gather them.
 */
export function Recipes({ id }: { id: string }) {
  const f = byId(id);
  const { recipes, pairings } = RECIPES[id];
  const [active, setActive] = useState(recipes[0].id);
  const [got, setGot] = useState<Record<string, boolean>>({});
  const r = recipes.find((x) => x.id === active)!;
  const ready = r.ingredients.filter((_, i) => got[`${r.id}-${i}`]).length;

  return (
    <section id="recipes" className={styles.section} aria-labelledby="recipes-title" style={{ "--field": f.field } as React.CSSProperties}>
      <div className={`${ui.shell} ${styles.grid}`}>
        <header className={styles.head}>
          <h2 id="recipes-title" className={`${ui.display} ${styles.title}`}>Beyond the bag.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Two quick things to make with a bag of {f.name}, and what to have it with.</p>

          <ul className={styles.list} role="group" aria-label="Recipes">
            {recipes.map((x) => (
              <li key={x.id}>
                <button type="button" className={styles.pick} aria-pressed={x.id === active} onClick={() => setActive(x.id)}>
                  <strong className={ui.display}>{x.title}</strong>
                  <span>{x.dek}</span>
                </button>
              </li>
            ))}
          </ul>
        </header>

        <article key={r.id} className={styles.card} aria-label={r.title}>
          <div className={styles.meta}>
            <span><Clock /> {r.minutes} min</span>
            <span><Bowl /> Serves {r.serves}</span>
          </div>
          <h3 className={`${ui.display} ${styles.cardTitle}`}>{r.title}</h3>

          <div className={styles.cols}>
            <div>
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
            </div>
            <div>
              <h4 className={styles.h4}>Method</h4>
              <ol className={styles.steps}>
                {r.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </div>
          </div>
        </article>
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
