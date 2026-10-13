"use client";

import { useState } from "react";
import { byId } from "@/lib/products";
import { ratingFor } from "@/lib/ugc";
import { useStore } from "@/lib/store";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import { STAR, SampleTag, Spinner, Stars } from "./bits";
import styles from "./ProductReviews.module.css";

type Draft = { rating: number; title: string; body: string; name: string };

/**
 * What buyers said about this flavour, with the summary beside it and a way to add yours.
 * Writing one is UI only: it validates, "sends", and says it'll appear once it's checked.
 */
export function ProductReviews({ id }: { id: string }) {
  const f = byId(id);
  const { user } = useStore();
  const r = ratingFor(id);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState<Draft>({ rating: 0, title: "", body: "", name: "" });
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.rating) next.rating = "Pick a star rating.";
    if (draft.body.trim().length < 12) next.body = "Tell us a little more, at least a sentence.";
    if (!user && !draft.name.trim()) next.name = "Add the name to show with your review.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    window.setTimeout(() => setState("sent"), 900);
  };

  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <aside className={styles.summary}>
          <h2 id="reviews-title" className={`${ui.display} ${styles.title}`}>What people say.</h2>
          <div className={styles.score}>
            <span className={ui.display}>{r.average}</span>
            <div>
              <Stars value={r.average} size={22} />
              <p>{r.count} reviews of {f.name}</p>
            </div>
          </div>
          {r.sample && <SampleTag>Sample numbers</SampleTag>}
          <ul className={styles.bars} aria-label="Reviews by stars">
            {r.bars.map((b, i) => (
              <li key={i}>
                <span>{5 - i} star</span>
                <span className={styles.bar}><span style={{ width: `${b * 100}%` }} /></span>
                <span>{Math.round(b * r.count)}</span>
              </li>
            ))}
          </ul>
          {!writing && <button type="button" className={ui.btnLine} onClick={() => setWriting(true)}>Write a review</button>}
        </aside>

        <div className={styles.main}>
          {writing && (
            <div className={styles.write}>
              {state === "sent" ? (
                <div className={styles.thanks} role="status">
                  <Makhana variant="fill" className={styles.thanksSeed} />
                  <p className={ui.display}>Thanks for the review.</p>
                  <span>We read every one before it goes up, usually within two days.</span>
                  <button type="button" className={ui.link} onClick={() => { setWriting(false); setState("idle"); setDraft({ rating: 0, title: "", body: "", name: "" }); }}>Done</button>
                </div>
              ) : (
                <form className={forms.form} onSubmit={submit} noValidate>
                  <h3 className={`${ui.display} ${styles.writeTitle}`}>Your review of {f.name}</h3>
                  <fieldset className={styles.rate} aria-describedby={errors.rating ? "e-rating" : undefined}>
                    <legend className={forms.label}>Your rating</legend>
                    <div onMouseLeave={() => setHover(0)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} onMouseEnter={() => setHover(n)} data-on={(hover || draft.rating) >= n || undefined}>
                          <input type="radio" name="rating" value={n} checked={draft.rating === n} onChange={() => setDraft((d) => ({ ...d, rating: n }))} />
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} /></svg>
                          <span className={ui.sr}>{n} {n === 1 ? "star" : "stars"}</span>
                        </label>
                      ))}
                    </div>
                    {errors.rating && <p id="e-rating" className={forms.error}>{errors.rating}</p>}
                  </fieldset>
                  <div className={forms.field}>
                    <label className={forms.label} htmlFor="rv-title">Headline <small>(optional)</small></label>
                    <input id="rv-title" className={forms.input} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Sum it up" />
                  </div>
                  <div className={forms.field}>
                    <label className={forms.label} htmlFor="rv-body">Your review</label>
                    <textarea id="rv-body" className={forms.input} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                      aria-invalid={errors.body ? true : undefined} aria-describedby={errors.body ? "e-body" : undefined} placeholder="How did it taste? When did you eat it?" />
                    {errors.body && <p id="e-body" className={forms.error}>{errors.body}</p>}
                  </div>
                  {user ? (
                    <p className={forms.hint}>Posting as {user.name}.</p>
                  ) : (
                    <div className={forms.field}>
                      <label className={forms.label} htmlFor="rv-name">Name to show</label>
                      <input id="rv-name" className={forms.input} autoComplete="given-name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "e-name" : undefined} />
                      {errors.name && <p id="e-name" className={forms.error}>{errors.name}</p>}
                    </div>
                  )}
                  <div className={styles.writeActions}>
                    <button type="submit" className={ui.btn} disabled={state === "sending"}>
                      {state === "sending" ? <><Spinner /> Sending</> : "Post review"}
                    </button>
                    <button type="button" className={ui.link} onClick={() => setWriting(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Customer photos: empty frames until real, permissioned photos come in with reviews. */}
          <div className={styles.photos}>
            <p className={styles.photosHead}><strong>Customer photos</strong> <SampleTag>Coming with reviews</SampleTag></p>
            <ul aria-label="Customer photos">
              {Array.from({ length: 5 }, (_, i) => <li key={i} className={styles.photoSlot}><Makhana variant="outline" className={styles.photoSeed} /></li>)}
            </ul>
          </div>

          <ul className={styles.list}>
            {r.reviews.length ? r.reviews.map((x) => (
              <li key={x.id} className={styles.review}>
                <div className={styles.top}>
                  <Stars value={x.rating} />
                  {x.sample && <SampleTag>Sample review</SampleTag>}
                </div>
                <blockquote>&ldquo;{x.quote}&rdquo;</blockquote>
                <p className={styles.who}><strong>{x.name}</strong>{x.city && `, ${x.city}`}</p>
              </li>
            )) : (
              <li className={styles.empty}>
                <Makhana variant="outline" className={styles.emptySeed} />
                <p>No reviews of {f.name} yet. Had a bag? Be the first to say what you thought.</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
