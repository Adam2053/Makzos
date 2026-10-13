"use client";

import { useState } from "react";
import { GRAMS, WEIGHT, byId } from "@/lib/products";
import { LAB_TESTS, fmtNutrient, nutritionFor, per100 } from "@/lib/nutrition";
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
  const anyPending = rows.some((r) => r.pending);

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
      <div className={ui.shell}>
        <header className={styles.head}>
          <h2 id="specs-title" className={`${ui.display} ${styles.title}`}>What&rsquo;s in the bag.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Read the back of the pack before you buy it. Here it is, at a size you can read.</p>
        </header>

        <div className={styles.grid}>
          {/* ---------- Nutrition ---------- */}
          <article className={`${styles.card} ${styles.nutrition}`} aria-labelledby="nutri-title">
            <div className={styles.cardHead}>
              <h3 id="nutri-title" className={`${ui.display} ${styles.h3}`}>Nutrition</h3>
              <div className={forms.segments} role="group" aria-label="Show values">
                <button type="button" className={forms.segment} aria-pressed={basis === "pack"} onClick={() => setBasis("pack")}>Per {WEIGHT} pack</button>
                <button type="button" className={forms.segment} aria-pressed={basis === "100"} onClick={() => setBasis("100")}>Per 100 g</button>
              </div>
            </div>
            <table className={styles.table}>
              <caption className={ui.sr}>Nutrition per {basis === "pack" ? `${WEIGHT} pack` : "100 g"}</caption>
              <thead><tr><th scope="col">Typical values</th><th scope="col">{basis === "pack" ? `Per pack (${GRAMS} g)` : "Per 100 g"}</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.label}-${r.unit}`} data-sub={r.sub || undefined}>
                    <th scope="row">{r.label}{r.pending && <span className={styles.star} aria-label=", pending lab report">*</span>}</th>
                    <td>{fmtNutrient(basis === "pack" ? r.perPack : per100(r.perPack), r.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.foot}>
              Energy, fat, saturates, sugars and salt are as printed on the pack.
              {anyPending && <> <span className={styles.star}>*</span> Awaiting the lab report; shown for layout. <SampleTag>Pending</SampleTag></>}
            </p>
          </article>

          {/* ---------- Ingredients and allergens ---------- */}
          <article className={styles.card} aria-labelledby="ingr-title">
            <h3 id="ingr-title" className={`${ui.display} ${styles.h3}`}>Ingredients</h3>
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
          </article>

          {/* ---------- Specification ---------- */}
          <article className={styles.card} aria-labelledby="spec-title">
            <h3 id="spec-title" className={`${ui.display} ${styles.h3}`}>Specification</h3>
            <dl className={styles.spec}>
              {SPEC.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </article>

          {/* ---------- Lab report ---------- */}
          <article className={`${styles.card} ${styles.lab}`} aria-labelledby="lab-title">
            <h3 id="lab-title" className={`${ui.display} ${styles.h3}`}>Lab report</h3>
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
          </article>
        </div>
      </div>
    </section>
  );
}
