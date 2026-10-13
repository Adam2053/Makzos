"use client";

import Link from "next/link";
import { useState } from "react";
import { FLAVOURS, byId, productHref } from "@/lib/products";
import { REVIEWS, ratingFor } from "@/lib/ugc";
import { PageHead, SampleTag, Stars } from "@/components/shop/bits";
import { PackThumb } from "@/components/shop/Pack";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./reviews.module.css";

/** Every review, filterable by flavour and stars, with each flavour's score along the top. */
export function ReviewsView() {
  const [flavour, setFlavour] = useState<string | null>(null);
  const [min, setMin] = useState(0);
  const list = REVIEWS.filter((r) => (!flavour || r.flavour === flavour) && r.rating >= min);
  const total = FLAVOURS.reduce((n, f) => n + ratingFor(f.id).count, 0);
  const avg = Math.round((FLAVOURS.reduce((n, f) => n + ratingFor(f.id).average * ratingFor(f.id).count, 0) / total) * 10) / 10;

  return (
    <>
      <PageHead title="Reviews." crumbs={[{ href: "/", label: "Home" }, { label: "Reviews" }]}>
        <p className={styles.overall}><Stars value={avg} size={24} /> <strong>{avg}</strong> from {total} reviews <SampleTag>Sample numbers</SampleTag></p>
      </PageHead>

      <section className={`${ui.shell} ${styles.scores}`} aria-label="By flavour">
        <ul>
          {FLAVOURS.map((f) => {
            const r = ratingFor(f.id);
            return (
              <li key={f.id}>
                <button type="button" className={styles.score} aria-pressed={flavour === f.id} onClick={() => setFlavour((x) => (x === f.id ? null : f.id))}>
                  <PackThumb id={f.id} size={34} />
                  <span><strong>{f.name}</strong><span><Stars value={r.average} size={13} /> {r.average}</span></span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${ui.shell} ${styles.body}`} aria-label="Reviews">
        <div className={styles.bar}>
          <div className={forms.segments} role="group" aria-label="Stars">
            {[0, 5, 4].map((m) => <button key={m} type="button" className={forms.segment} aria-pressed={min === m} onClick={() => setMin(m)}>{m === 0 ? "All stars" : m === 5 ? "5 stars" : "4 and up"}</button>)}
          </div>
          {flavour && <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setFlavour(null)}>Show every flavour</button>}
        </div>
        {list.length === 0 ? (
          <p className={styles.none}>No reviews match yet. {flavour && <Link href={`${productHref(flavour)}#reviews`} className={ui.link}>Be the first to review {byId(flavour).name}</Link>}</p>
        ) : (
          <ul className={styles.list}>
            {list.map((r) => (
              <li key={r.id} className={styles.card}>
                <div className={styles.top}><Stars value={r.rating} />{r.sample && <SampleTag>Sample review</SampleTag>}</div>
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <p className={styles.who}>
                  <PackThumb id={r.flavour} size={26} />
                  <span><strong>{r.name}</strong>{r.city && `, ${r.city}`}<span>Bought <Link href={productHref(r.flavour)} className={ui.link}>{byId(r.flavour).name}</Link></span></span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
