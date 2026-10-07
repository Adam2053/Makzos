"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BAG_PRICE, PACK_H, PACK_W, byId, inr } from "@/lib/products";
import { CLIPS, REVIEWS, REVIEW_SLOTS, type Clip } from "@/lib/ugc";
import { useCart } from "@/lib/cart";
import { MOTION_OK } from "@/lib/motion";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Reviews.module.css";

/** The clips are laid out three times over; the reader always sits in the middle run. */
const RUNS = [0, 1, 2];

/**
 * One video tile. It plays by itself, muted and looping, while at least half of it is on
 * screen, and stops when it leaves, so only the few clips being looked at are ever streaming.
 * A tap pauses it, and it then stays paused until tapped again. People who've asked for
 * reduced motion get the still and the play button instead.
 */
function Film({ clip, label, echo }: { clip: Clip; label: string; echo: boolean }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const held = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v || !window.matchMedia(MOTION_OK).matches) return;
    const io = new IntersectionObserver((entries) => {
      // Several changes can arrive at once (off screen, then back, when the row loops): only the last is true now.
      if (entries[entries.length - 1].isIntersecting && !held.current) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = video.current!;
    held.current = !v.paused;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <button type="button" className={styles.film} onClick={toggle} tabIndex={echo ? -1 : undefined}
      aria-label={`${playing ? "Pause" : "Play"} ${label}`} aria-pressed={playing}>
      <video ref={video} src={clip.src} poster={clip.poster} muted loop playsInline preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <span className={styles.play} data-on={playing || undefined} aria-hidden="true">
        <svg viewBox="0 0 24 24">{playing ? <path d="M8 6v12M16 6v12" /> : <path d="M9 6.5v11l9-5.5Z" />}</svg>
      </span>
    </button>
  );
}

/**
 * People eating it, with the pack they're eating one tap away, then what buyers wrote.
 * Until real clips and reviews are supplied (see lib/ugc.ts) the slots say so on their face.
 */
export function Reviews() {
  const { addBag } = useCart();
  const rail = useRef<HTMLUListElement>(null);

  /*
   * The loop: once scrolling settles, clips that have gone off one end are lifted to the
   * other, and the scroll position is moved by exactly their width in the same breath. What's
   * on screen is never touched, so playing videos keep playing and there is never an end to
   * reach. The row is reordered by hand, not through React, because React would move the
   * visible tiles to do the same job and their videos would stop.
   */
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    // Measured in fractions of a pixel: a rounded width would land the move a hair off, and the snap would then nudge it.
    const pitch = () => (el.children.length > 1 ? el.children[1].getBoundingClientRect().left - el.children[0].getBoundingClientRect().left : 0);
    const settle = () => {
      const step = pitch();
      if (!step) return;
      // How many clips the reader is past the start of the middle run; that many change ends.
      // Read once, before the row changes: the browser shifts a snapped row by itself when its clips move.
      const from = el.scrollLeft;
      const k = Math.round((from - CLIPS.length * step) / step);
      if (k === 0) return;
      for (let i = 0; i < Math.abs(k); i++) {
        if (k > 0) el.append(el.firstElementChild!);
        else el.prepend(el.lastElementChild!);
      }
      el.scrollLeft = from - k * step;
    };
    el.scrollLeft = CLIPS.length * pitch();
    // Wait for the browser to say the scroll is over, so the move never lands mid-glide.
    if ("onscrollend" in window) {
      el.addEventListener("scrollend", settle);
      return () => el.removeEventListener("scrollend", settle);
    }
    let timer = 0;
    const onScroll = () => { window.clearTimeout(timer); timer = window.setTimeout(settle, 160); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(timer); el.removeEventListener("scroll", onScroll); };
  }, []);

  /** The arrows move the carousel by most of what's on screen; scroll-snap settles it on a clip. */
  const slide = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
      <div className={ui.shell}>
        <header className={styles.head}>
          <h2 id="reviews-title" className={`${ui.display} ${styles.title}`}>Seen at snack break.</h2>
          <div className={styles.side}>
            <p className={`${ui.lede} ${styles.lede}`}>Watch it get eaten, then add the same pack to your bag.</p>
            <div className={styles.arrows}>
              <button type="button" onClick={() => slide(-1)} aria-label="Earlier videos">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => slide(1)} aria-label="More videos">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* The carousel runs to the screen's edge, so the next clip is always peeking in. */}
      <div className={styles.bleed}>
        <ul ref={rail} className={styles.clips} tabIndex={0} aria-label="Videos, scroll sideways; the row loops">
          {RUNS.flatMap((r) => CLIPS.map((c) => {
            const f = byId(c.flavour);
            // Only the middle run is announced and tabbed to; the other two are its echoes.
            const echo = r !== 1;
            return (
              <li key={`${r}-${c.id}`} className={styles.clip} aria-hidden={echo || undefined}>
                <div className={styles.frame}>
                  {c.src ? (
                    <Film clip={c} label={`${f.name} video${c.by ? ` by ${c.by}` : ""}`} echo={echo} />
                  ) : (
                    /* Loaded and decoded up front in every run: a lazy image would pop in after the loop's jump. */
                    <Image src={c.poster} alt="" fill sizes="(max-width: 700px) 62vw, 320px" loading="eager" decoding="sync"
                      style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
                  )}
                  {(c.sample || !c.src) && <span className={styles.tag}>{c.src ? "Sample video" : "Video to come"}</span>}
                  {c.by && <span className={styles.by}>{c.by}</span>}
                </div>
                {/* The product link: the pack in the video, and a way to add it. */}
                <div className={styles.product} style={{ "--field": f.field } as React.CSSProperties}>
                  <span className={styles.thumb}><Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="44px" loading="eager" decoding="sync" /></span>
                  <span className={styles.what}><strong>{f.name}</strong><span>{inr(BAG_PRICE)}</span></span>
                  <button type="button" className={styles.add} aria-label={`Add ${f.name} to bag`} tabIndex={echo ? -1 : undefined}
                    onClick={(e) => addBag(f.id, e.currentTarget.parentElement?.querySelector("img"))}>+</button>
                </div>
              </li>
            );
          }))}
        </ul>
      </div>

      <div className={ui.shell}>
        <ul className={styles.reviews} tabIndex={0} aria-label="Reviews">
          {REVIEWS.length > 0
            ? REVIEWS.map((r) => (
              <li key={r.id} className={styles.review}>
                <div className={styles.top}>
                  <span className={styles.stars} role="img" aria-label={`${r.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} viewBox="0 0 24 24" aria-hidden="true" data-on={i < r.rating || undefined}><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8L12 2.5Z" /></svg>
                    ))}
                  </span>
                  {r.sample && <span className={styles.sample}>Sample review</span>}
                </div>
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <p className={styles.who} style={{ "--field": byId(r.flavour).field } as React.CSSProperties}>
                  <span className={styles.thumb}><Image src={byId(r.flavour).pack} alt="" width={PACK_W} height={PACK_H} sizes="44px" /></span>
                  <span><strong>{r.name}</strong>{r.city && `, ${r.city}`}<span>Bought {byId(r.flavour).name}</span></span>
                </p>
              </li>
            ))
            : Array.from({ length: REVIEW_SLOTS }, (_, i) => (
              <li key={i} className={`${styles.review} ${styles.blank}`}>
                <Makhana variant="outline" className={styles.blankSeed} />
                <p>A customer&rsquo;s review goes here, in their words, once the first orders are out.</p>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
