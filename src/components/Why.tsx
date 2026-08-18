import { PROMISES } from "@/lib/flavours";
import { Puff } from "./Bits";
import { Reveal } from "./Reveal";
import styles from "./Why.module.css";

export function Why() {
  return (
    <section id="why" className={styles.section}>
      <div className={`u-shell ${styles.capsule} u-capsule`}>
        <Reveal className={styles.head}>
          <p className={`u-label ${styles.kicker}`}>Why makhana</p>
          <h2 className={`u-display ${styles.title}`}>Four reasons, no asterisks</h2>
        </Reveal>

        <ul className={styles.grid}>
          {PROMISES.map((p, i) => (
            <Reveal as="li" key={p.t} delay={i * 70} className={styles.item}>
              <span className={styles.icon}>
                <Puff size={38} />
              </span>
              <h3 className={`u-display ${styles.itemTitle}`}>{p.t}</h3>
              <p className={styles.itemText}>{p.d}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
