import { REVIEWS } from "@/lib/flavours";
import { Stars } from "./Bits";
import { Reveal } from "./Reveal";
import styles from "./Reviews.module.css";

export function Reviews() {
  return (
    <section id="reviews" className={styles.section}>
      <div className={`u-shell ${styles.capsule} u-capsule`}>
        <Reveal className={styles.head}>
          <p className={`u-label ${styles.kicker}`}>What others say</p>
          <h2 className={`u-display ${styles.title}`}>959 people, mouth full</h2>
        </Reveal>

        {/* Offset pills alternating left and right, the way the campaign stacks
            its testimonials — a conversation rather than a grid. */}
        <ul className={styles.list}>
          {REVIEWS.map((r, i) => (
            <Reveal as="li" key={r.name} delay={i * 60} className={styles.row} >
              <figure className={styles.pill} data-side={i % 2 ? "right" : "left"}>
                <span className={styles.avatar} aria-hidden="true">
                  {r.name.charAt(0)}
                </span>
                <div className={styles.content}>
                  <div className={styles.top}>
                    <strong className={`u-display ${styles.name}`}>{r.name}</strong>
                    <Stars value={r.stars} small />
                  </div>
                  <blockquote className={styles.quote}>{r.text}</blockquote>
                  <figcaption className={`u-label ${styles.city}`}>{r.city}</figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
