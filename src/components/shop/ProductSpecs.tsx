"use client";

import { useState } from "react";
import { GRAMS, WEIGHT, byId } from "@/lib/products";
import { HEADLINE, LAB_TESTS, type NutrientRow, fmtNutrient, nutritionFor, nutritionGroups, per100, riFor } from "@/lib/nutrition";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import { SampleTag } from "./bits";
import { VegMark } from "./marks";
import styles from "./ProductSpecs.module.css";

/**
 * Everything on the back of the pack, laid out to be read: the nutrition panel (per pack or
 * per 100 g), ingredients and allergens, the product's specification and its lab report.
 * Figures not yet confirmed by the lab are marked on the page, not hidden.
 */
export function ProductSpecs({ id }: { id: string }) {
  const f = byId(id);
  const [basis, setBasis] = useState<"pack" | "100">("pack");
  const [notify, setNotify] = useState<"idle" | "form" | "done">("idle");
  const [email, setEmail] = useState("");
  const rows = nutritionFor(id);
  const groups = nutritionGroups(id);
  const anyPending = rows.some((r) => r.pending);
  const amount = (r: NutrientRow) => (basis === "pack" ? r.perPack : per100(r.perPack));
  /** Share of an adult's daily reference intake, or nothing where there isn't one (sodium). */
  const ri = (r: NutrientRow) => { const of = riFor(r); return of ? Math.round((amount(r) / of) * 100) : null; };
  const star = (r: NutrientRow) => r.pending && <span className={styles.star} aria-label=", pending lab report">*</span>;

  const SPEC: [string, React.ReactNode][] = [
    ["Product", `${f.name} roasted makhana (fox nut)`],
    ["Net weight", WEIGHT],
    ["Diet", <span key="veg" className={styles.vegRow}><VegMark /> Vegetarian</span>],
    ["How it's made", "Roasted, then seasoned. Never fried."],
    ["Pack", "Centre-sealed pouch"],
    ["Shelf life", "Printed on the pack, with the best-before date"],
    ["Storage", "Cool, dry place. Once open, fold the top and finish it soon."],
    ["Country of origin", "India"],
    ["Marketed by", "Solivra Innovations Private Limited"],
    ["FSSAI licence", "To be added"],
  ];

  return (
    <section id="specs" className={styles.section} aria-labelledby="specs-title">
      <div className={`${ui.shell} ${styles.layout}`}>
        <header className={styles.head}>
          <h2 id="specs-title" className={`${ui.display} ${styles.title}`}>What&rsquo;s in the bag.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Read the back of the pack before you buy it. Here it is, at a size you can read.</p>
        </header>

        {/* The back of the pack in four parts, one under the other. All start shut; each opens on a tap. */}
        <div className={styles.stack}>
          {/* ---------- Nutrition ---------- */}
          <Fold id="nutri-title" title="Nutrition" hint={`${HEADLINE[0].value} a pack`}>
            <div className={forms.segments} role="group" aria-label="Show values">
              <button type="button" className={forms.segment} aria-pressed={basis === "pack"} onClick={() => setBasis("pack")}>Per {WEIGHT} pack</button>
              <button type="button" className={forms.segment} aria-pressed={basis === "100"} onClick={() => setBasis("100")}>Per 100 g</button>
            </div>
            {/*
              * The panel, one part per row. Each opens to show what it's made of, so the
              * headline figures stay scannable and the detail is one tap away.
              */}
            <div className={styles.panel}>
              <p className={styles.panelHead} aria-hidden="true">
                <span>Typical values</span>
                <span>{basis === "pack" ? `Per pack (${GRAMS} g)` : "Per 100 g"}</span>
                <span>% RI</span>
              </p>
              {groups.map((g) => {
                const pct = ri(g.main);
                return (
                  <details key={g.key} className={styles.part}>
                    <summary>
                      <span className={styles.partName}>{g.main.label}{star(g.main)}</span>
                      <span className={styles.partVal}>{fmtNutrient(amount(g.main), g.main.unit)}</span>
                      <span className={styles.partRi}>{pct !== null && <><span className={ui.sr}>, </span>{pct}%<span className={ui.sr}> of reference intake</span></>}</span>
                      <svg className={styles.chev} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                      {pct !== null && <span className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.min(100, pct)}%` }} /></span>}
                    </summary>
                    <div className={styles.partBody}>
                      {g.parts.length > 0 && (
                        <table className={styles.subTable}>
                          <caption className={ui.sr}>{g.main.label}, in detail</caption>
                          <tbody>
                            {g.parts.map((r) => {
                              const p = ri(r);
                              return (
                                <tr key={`${r.label}-${r.unit}`}>
                                  <th scope="row">{r.label}{star(r)}</th>
                                  <td>{fmtNutrient(amount(r), r.unit)}</td>
                                  <td>{p !== null ? `${p}%` : "–"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                      <p className={styles.partNote}>{g.note}</p>
                    </div>
                  </details>
                );
              })}
            </div>
            <p className={styles.foot}>
              Energy, fat, saturates, sugars and salt are as printed on the pack. % RI is the share of an average adult&rsquo;s daily reference intake (2000 kcal).
              {anyPending && <> <span className={styles.star}>*</span> Awaiting the lab report; shown for layout. <SampleTag>Pending</SampleTag></>}
            </p>
          </Fold>

          {/* ---------- Ingredients and allergens ---------- */}
          <Fold id="ingr-title" title="Ingredients" hint="Allergens: milk, groundnut, soya">
            <p className={styles.body}>Roasted makhana (fox nut) and the {f.name} seasoning. Nothing artificial, and nothing we wouldn&rsquo;t explain.</p>
            <p className={styles.small}>The full ingredient list, in order of weight, is printed on the back of every pack.</p>
            <h4 className={styles.h4}>Allergens</h4>
            <ul className={styles.allergens}>
              {["Milk", "Groundnut", "Soya"].map((a) => <li key={a}>{a}</li>)}
            </ul>
            <p className={styles.small}>Present across the range. Check the allergen statement on this pack before you buy.</p>
            <h4 className={styles.h4}>Free from</h4>
            <ul className={styles.free}>
              {["Preservatives", "Artificial colours", "Artificial flavours", "INS-coded additives"].map((a) => <li key={a}>{a}</li>)}
            </ul>
          </Fold>

          {/* ---------- Specification ---------- */}
          <Fold id="spec-title" title="Specification" hint={`${WEIGHT}, vegetarian, made in India`}>
            <dl className={styles.spec}>
              {SPEC.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </Fold>

          {/* ---------- Lab report ---------- */}
          <Fold id="lab-title" title="Lab report" hint="Coming with the first batch" dark>
            <p className={styles.body}>Every batch goes to an independent lab. The report for {f.name} will be published here, in full.</p>
            <ul className={styles.tests}>{LAB_TESTS.map((t) => <li key={t}>{t}</li>)}</ul>
            {notify === "done" ? (
              <p className={styles.done} role="status">We&rsquo;ll email {email} when it&rsquo;s up.</p>
            ) : notify === "form" ? (
              <form className={forms.inline} onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) setNotify("done"); }}>
                <label htmlFor="lab-email" className={ui.sr}>Email</label>
                <input id="lab-email" className={forms.input} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                <button type="submit" className={ui.btnLight}>Notify me</button>
              </form>
            ) : (
              <div className={styles.labActions}>
                <button type="button" className={ui.btnLight} disabled aria-describedby="lab-soon">Download report (PDF)</button>
                <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setNotify("form")}>Email me when it&rsquo;s out</button>
              </div>
            )}
            <p id="lab-soon" className={styles.soon}>Coming with the first batch.</p>
          </Fold>
        </div>
      </div>
    </section>
  );
}

/**
 * One part of the panel, folded: the title and a one-line summary show while it's shut, so the
 * stack reads like a contents page. Native <details>, so it opens from the keyboard and with find-in-page.
 */
function Fold({ id, title, hint, open, dark, children }: { id: string; title: string; hint: string; open?: boolean; dark?: boolean; children: React.ReactNode }) {
  return (
    <details className={styles.card} data-dark={dark || undefined} open={open}>
      <summary className={styles.cardHead}>
        <h3 id={id} className={`${ui.display} ${styles.h3}`}>{title}</h3>
        <span className={styles.hint}>{hint}</span>
        <span className={styles.toggle} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg></span>
      </summary>
      <div className={styles.cardBody}>{children}</div>
    </details>
  );
}
