"use client";

import Link from "next/link";
import { useRef } from "react";
import { byId } from "@/lib/products";
import { creatorClips } from "@/lib/ugc";
import { Film } from "@/components/home/Film";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import styles from "./Creators.module.css";

/**
 * Creators eating this flavour. You're already on its page, so the clips stand alone: no
 * pack or Add button under each one, just who made it. The last tile asks for the next video.
 */
export function Creators({ id }: { id: string }) {
  const f = byId(id);
  const clips = creatorClips(id);
  const rail = useRef<HTMLUListElement>(null);

  const slide = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section className={styles.section} aria-labelledby="creators-title" style={{ "--field": f.field, "--ink": f.ink } as React.CSSProperties}>
      <div className={`${ui.shell} ${styles.head}`}>
        <h2 id="creators-title" className={`${ui.display} ${styles.title}`}>{f.name}, on camera.</h2>
        <div className={styles.side}>
          <p className={styles.lede}>Creators who opened a bag and hit record. Tap a video to pause it.</p>
          <div className={styles.arrows}>
            <button type="button" onClick={() => slide(-1)} aria-label="Earlier videos">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" onClick={() => slide(1)} aria-label="More videos">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.bleed}>
        <ul ref={rail} className={styles.clips} tabIndex={0} aria-label="Creator videos, scroll sideways for more">
          {clips.map((c) => (
            <li key={c.id} className={styles.clip}>
              <Film clip={c} label={`${f.name} video${c.by ? ` by ${c.by}` : ""}`} />
              {c.sample && <span className={styles.tag}>Sample video</span>}
              {c.by && <span className={styles.by}><span className={styles.avatar} aria-hidden="true">{c.by.charAt(1).toUpperCase()}</span>{c.by}</span>}
            </li>
          ))}
          <li className={styles.ask}>
            <Makhana variant="reverse" className={styles.askSeed} />
            <p className={ui.display}>Your video could go here.</p>
            <span>Film your bag, tag us, and we&rsquo;ll share the best ones here and on Instagram.</span>
            <Link href="/creators" className={ui.btnLight}>Join as a creator</Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
