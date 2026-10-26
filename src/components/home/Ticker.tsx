import { BrandMark } from "./BrandMark";
import ui from "./ui.module.css";
import styles from "./Ticker.module.css";

const PHRASES = ["Nothing artificial", "Nothing unnecessary", "Roasted, never fried", "Flavours you already know", "No preservatives", "Made with makhana"];

/**
 * The section breaker under the hero: the pack's tagline ribbon (guide D4, packaging), set on
 * a slant and running sideways for ever, the brand symbol (D4) between the lines. Two identical runs; sliding one full run's width
 * reads as an endless band. Decoration only: the sentence is there once for screen readers.
 */
export function Ticker() {
  const run = (copy: number) => (
    <div className={styles.run} key={copy} aria-hidden="true">
      {PHRASES.map((p) => (
        <span key={p} className={styles.item}>
          <span className={ui.label}>{p}</span>
          <BrandMark className={styles.seed} />
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.band}>
      <div className={styles.ribbon}>
        <div className={styles.track}>{[0, 1].map(run)}</div>
      </div>
      <p className={ui.sr}>Nothing artificial. Nothing unnecessary.</p>
    </div>
  );
}
