import { NUTRITION } from "@/lib/flavours";
import { Reveal } from "./Reveal";
import styles from "./Honest.module.css";

const CLAIMS = [
  "Roasted, not fried",
  "No palm oil",
  "Gluten free",
  "Plant protein",
];

/* The process really is a sequence, and the point is how short it is. */
const STEPS = [
  { n: "01", t: "Roast", d: "Small batches, dry heat, until the seed puffs and crisps." },
  { n: "02", t: "Season", d: "Whole spice, ground fresh, tumbled on warm." },
];

export function Honest() {
  return (
    <section id="makhana" className={styles.section}>
      <div className={`u-shell ${styles.inner}`}>
        <Reveal className={styles.lead}>
          <p className="u-mono">Nothing unnecessary</p>
          <h2 className={`u-display ${styles.title}`}>
            Roasted.
            <br />
            Never fried.
          </h2>
          <p className={`u-lede ${styles.lede}`}>
            Makhana is the puffed seed of the lotus, grown in the ponds of
            Bihar and harvested by hand. We roast it, season it, and stop.
          </p>

          <ol className={styles.steps}>
            {STEPS.map((s) => (
              <li key={s.n} className={styles.step}>
                <span className={`u-mono ${styles.stepNum}`}>{s.n}</span>
                <span>
                  <strong className={styles.stepTitle}>{s.t}</strong>
                  <span className={styles.stepText}>{s.d}</span>
                </span>
              </li>
            ))}
            <li className={`${styles.step} ${styles.stepNone}`}>
              <span className={`u-mono ${styles.stepNum}`}>03</span>
              <span className={styles.stepText}>There is no third step.</span>
            </li>
          </ol>
        </Reveal>

        <Reveal delay={140} className={styles.panel}>
          <div className={styles.panelHead}>
            <p className="u-mono">Per 55 g bag</p>
            <p className={`u-mono ${styles.panelNote}`}>As printed on pack</p>
          </div>

          <dl className={styles.table}>
            {NUTRITION.map((row) => (
              <div key={row.label} className={styles.row}>
                <dt className={styles.rowLabel}>{row.label}</dt>
                <dd className={styles.rowValue}>
                  <span className={styles.figure}>{row.value}</span>
                  <span className={`u-mono ${styles.rowSub}`}>{row.sub}</span>
                </dd>
              </div>
            ))}
          </dl>

          <ul className={styles.claims}>
            {CLAIMS.map((c) => (
              <li key={c} className={`u-mono ${styles.claim}`}>
                {c}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
