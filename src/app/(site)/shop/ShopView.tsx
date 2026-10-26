"use client";

import { useState } from "react";
import { FLAVOURS, TASTES, type Taste } from "@/lib/products";
import { Products } from "@/components/home/Products";
import styles from "./shop.module.css";

const SORTS = [
  { id: "range", label: "Our order" },
  { id: "az", label: "A to Z" },
] as const;

/**
 * Filter by taste (any of the picked tastes matches) and sort, on one compact line above the
 * grid: taste chips on the left, the count and the sort on the right. On a phone the chips
 * scroll sideways rather than wrapping. Empty filters show everything.
 */
export function ShopView() {
  const [tastes, setTastes] = useState<Taste[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("range");

  let list = FLAVOURS.filter((f) => !tastes.length || f.taste.some((t) => tastes.includes(t)));
  if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const toggle = (t: Taste) => setTastes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));

  return (
    <Products layout="grid" title="Every flavour." quietHead ids={list.map((f) => f.id)}>
      <div className={styles.bar}>
        <div className={styles.chips} role="group" aria-label="Filter by taste">
          <button type="button" className={styles.chip} aria-pressed={tastes.length === 0} onClick={() => setTastes([])}>All</button>
          {TASTES.map((t) => (
            <button key={t.id} type="button" className={styles.chip} aria-pressed={tastes.includes(t.id)} onClick={() => toggle(t.id)}>
              {t.label} <span className={styles.n}>{FLAVOURS.filter((f) => f.taste.includes(t.id)).length}</span>
            </button>
          ))}
        </div>
        <p className={styles.count} aria-live="polite">{list.length === FLAVOURS.length ? `${list.length} flavours` : `${list.length} of ${FLAVOURS.length}`}</p>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
    </Products>
  );
}
