import Image from "next/image";
import styles from "./Banner.module.css";

export function Banner() {
  return (
    <div className={styles.band}>
      {/* A wave keeps the loud block from reading as a plain coloured box. */}
      <svg className={styles.waveTop} viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,60 C240,0 480,0 720,26 C960,52 1200,52 1440,14 L1440,60 Z" />
      </svg>

      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={`u-label ${styles.kicker}`}>The whole recipe</p>
          <h2 className={`u-display u-rough ${styles.title}`}>
            Roast it.
            <br />
            Season it.
            <span className={styles.stop}> Stop.</span>
          </h2>
          <p className={styles.text}>
            No fryer, no palm oil, no third step. Here&apos;s the entire back of
            the bag, per 55 g — nothing hidden behind a percentage.
          </p>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={`u-display ${styles.stepNum}`}>1</span>
              <span>
                <strong className={styles.stepTitle}>Roast</strong>
                Small batches, dry heat, until the seed puffs and crisps.
              </span>
            </li>
            <li className={styles.step}>
              <span className={`u-display ${styles.stepNum}`}>2</span>
              <span>
                <strong className={styles.stepTitle}>Season</strong>
                Whole spice, ground fresh, tumbled on while it&apos;s warm.
              </span>
            </li>
          </ol>
        </div>

        <div className={styles.art}>
          <span className={styles.zero}>
            <span className={`u-display ${styles.zeroNum}`}>0%</span>
            <span className={`u-label ${styles.zeroLabel}`}>Palm oil</span>
          </span>
          <div className={styles.packWrap}>
            <Image
              src="/brand/pack-chettinadu.png"
              alt="Makzo's Chettinadu roasted makhana, 55 g pack"
              width={347}
              height={460}
              className={styles.pack}
            />
          </div>
        </div>
      </div>

      <svg className={styles.waveBottom} viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,0 C240,52 480,52 720,26 C960,0 1200,0 1440,44 L1440,0 Z" />
      </svg>
    </div>
  );
}
