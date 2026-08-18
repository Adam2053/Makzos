import { FLAVOURS } from "@/lib/flavours";
import { Reveal } from "./Reveal";
import styles from "./Sources.module.css";

const SHOTS = FLAVOURS.filter((f) => f.scene);

export function Sources() {
  return (
    <section id="sources" className={styles.section}>
      <div className="u-shell">
        <Reveal className={styles.head}>
          <p className="u-mono">Sources</p>
          <h2 className={`u-display ${styles.title}`}>
            We didn&apos;t invent
            <br />
            these flavours
          </h2>
          <p className={`u-lede ${styles.lede}`}>
            We went and found the people who did, and we photographed them the
            way we taste their work — everything quiet except the one thing that
            matters.
          </p>
        </Reveal>
      </div>

      <div className={`u-shell ${styles.strip}`}>
        {SHOTS.map((f, i) => (
          <Reveal
            key={f.id}
            delay={i * 120}
            className={styles.item}
            as="figure"
          >
            <div
              className={styles.frame}
              style={{ "--flavour": f.accent } as React.CSSProperties}
            >
              <picture>
                <source srcSet={`${f.scene}.webp`} type="image/webp" />
                <img
                  src={`${f.scene}.jpg`}
                  alt={f.sceneCaption ?? ""}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <figcaption className={styles.caption}>
              <span className={`u-mono ${styles.capOrigin}`}>{f.origin}</span>
              <span className={styles.capText}>{f.sceneCaption}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
