import { REVIEWS } from "@/lib/flavours";
import { Stars } from "./Bits";
import { Reveal } from "./Reveal";
import styles from "./Reviews.module.css";

export function Reviews() {
  return (
    <section id="reviews" className={styles.section}>
      <div className="u-shell">
        <Reveal className={styles.head}>
          <p className="u-label">Reviews</p>
          <h2 className={`u-display u-rough ${styles.title}`}>
            What the <span className={styles.pop}>crunching</span> crowd says
          </h2>
        </Reveal>

        <ul className={styles.grid}>
          {REVIEWS.map((r, i) => (
            <Reveal as="li" key={r.name} delay={i * 70} className={styles.cell}>
              <figure className={styles.card} style={{ "--tilt": `${(i % 2 ? 1 : -1) * 0.9}deg` } as React.CSSProperties}>
                <Stars value={r.stars} />
                <blockquote className={styles.quote}>{r.text}</blockquote>
                <figcaption className={styles.who}>
                  <span className={styles.avatar} aria-hidden="true">
                    {r.name.charAt(0)}
                  </span>
                  <span>
                    <strong className={styles.name}>{r.name}</strong>
                    <span className={styles.city}>{r.city}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
