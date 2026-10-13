"use client";

import Link from "next/link";
import { useState } from "react";
import { STORES, type Store } from "@/lib/stores";
import { PageHead, SampleTag } from "@/components/shop/bits";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./locator.module.css";

const CITIES = ["All", "Hyderabad", "Bengaluru"] as const;

/** Search by area or pincode, or narrow by city. The nearest match is simply the first that fits. */
export function Locator() {
  const [city, setCity] = useState<(typeof CITIES)[number]>("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const term = q.trim().toLowerCase();
  const list = STORES.filter((s) => (city === "All" || s.city === city) && (!term || `${s.area} ${s.city} ${s.pincode}`.toLowerCase().includes(term)));
  const maps = (s: Store) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.area}, ${s.city} ${s.pincode}`)}`;

  return (
    <>
      <PageHead title="Find a store." lede="Makzo's on a shelf near you. Hyderabad first, then Bengaluru." crumbs={[{ href: "/", label: "Home" }, { label: "Store locator" }]} />
      <section className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.side}>
          <form className={styles.search} role="search" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="loc-q" className={forms.label}>Area or pincode</label>
            <input id="loc-q" className={forms.input} placeholder="Gachibowli, or 500032" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className={forms.segments} role="group" aria-label="City">
            {CITIES.map((c) => <button key={c} type="button" className={forms.segment} aria-pressed={city === c} onClick={() => setCity(c)}>{c}</button>)}
          </div>
          <p className={styles.count} aria-live="polite">{list.length} {list.length === 1 ? "store" : "stores"} <SampleTag>Sample stores</SampleTag></p>

          {list.length === 0 ? (
            <div className={styles.none}>
              <Makhana variant="outline" className={styles.noneSeed} />
              <p>No stores there yet. Order online and we&rsquo;ll deliver, or tell a store near you to stock us.</p>
              <div className={forms.actions}>
                <Link href="/shop" className={ui.btnPaprika}>Order online</Link>
                <Link href="/contact#stockist" className={ui.link}>Suggest a store</Link>
              </div>
            </div>
          ) : (
            <ul className={styles.list}>
              {list.map((s) => (
                <li key={s.id}>
                  <button type="button" className={styles.store} aria-pressed={active === s.id} onClick={() => setActive(s.id)}>
                    <strong>{s.name}, {s.area}</strong>
                    <span>{s.city} {s.pincode}</span>
                    <span>Open {s.hours}. {s.flavours === 7 ? "All 7 flavours" : `${s.flavours} of 7 flavours`}.</span>
                  </button>
                  {active === s.id && <a href={maps(s)} target="_blank" rel="noreferrer" className={`${ui.link} ${styles.dir}`}>Get directions</a>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* A drawn map, not a real one: pins spread by city so the list has something to point at. */}
        <div className={styles.map} aria-hidden="true">
          <svg viewBox="0 0 400 480" className={styles.mapArt}>
            <path d="M40 120 C 120 60, 260 90, 360 40 M20 300 C 140 260, 240 340, 390 280 M120 0 C 140 160, 90 300, 140 480 M280 0 C 250 140, 320 320, 270 480" />
          </svg>
          {list.map((s, i) => {
            const x = 14 + ((i * 37) % 72);
            const y = (s.city === "Hyderabad" ? 12 : 58) + ((i * 13) % 30);
            return (
              <span key={s.id} className={styles.pin} data-on={active === s.id || undefined} style={{ left: `${x}%`, top: `${y}%` }}>
                <Makhana variant={active === s.id ? "fill" : "ink"} className={styles.pinSeed} />
                {active === s.id && <span className={styles.pinLabel}>{s.area}</span>}
              </span>
            );
          })}
          <span className={styles.cityLabel} style={{ top: "6%" }}>Hyderabad</span>
          <span className={styles.cityLabel} style={{ top: "52%" }}>Bengaluru</span>
        </div>
      </section>
      <section className={`${ui.shell} ${styles.stockist}`} id="stockist-cta">
        <div>
          <h2 className={`${ui.display} ${styles.h2}`}>Run a store?</h2>
          <p className={styles.quiet}>We&rsquo;re looking for shops, cafés and offices to stock Makzo&rsquo;s.</p>
        </div>
        <Link href="/contact#stockist" className={ui.btn}>Become a stockist</Link>
      </section>
    </>
  );
}
