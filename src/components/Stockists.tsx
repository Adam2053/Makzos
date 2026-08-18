import { STOCKISTS } from "@/lib/flavours";
import { Reveal } from "./Reveal";
import styles from "./Stockists.module.css";

export function Stockists() {
  return (
    <section id="stockists" className={styles.section}>
      <div className={`u-shell ${styles.inner}`}>
        <Reveal className={styles.head}>
          <p className="u-label">Where to buy</p>
          <h2 className={`u-display ${styles.title}`}>Ten minutes away, mostly</h2>
        </Reveal>

        <Reveal delay={100}>
          <ul className={styles.list}>
            {STOCKISTS.map((s) => (
              <li key={s} className={styles.chip}>
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
