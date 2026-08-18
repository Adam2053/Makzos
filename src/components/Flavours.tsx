import Image from "next/image";
import { FLAVOURS } from "@/lib/flavours";
import { HeatMeter } from "./HeatMeter";
import { Reveal } from "./Reveal";
import styles from "./Flavours.module.css";

export function Flavours() {
  return (
    <section id="flavours" className={styles.section}>
      <div className="u-shell">
        <Reveal className={styles.head}>
          <p className="u-mono">Four flavours</p>
          <h2 className={`u-display ${styles.title}`}>
            One honest seed,
            <br />
            four places it&apos;s been
          </h2>
          <p className={`u-lede ${styles.lede}`}>
            Every bag is the same puffed lotus seed. What changes is where the
            seasoning came from — so that&apos;s what we put on the front.
          </p>
        </Reveal>

        <ul className={styles.grid}>
          {FLAVOURS.map((f, i) => (
            <Reveal
              as="li"
              key={f.id}
              delay={i * 90}
              className={styles.cardWrap}
            >
              <article
                className={styles.card}
                style={
                  {
                    "--accent": f.accent,
                    "--deep": f.deep,
                  } as React.CSSProperties
                }
              >
                <div className={styles.shot}>
                  <Image
                    src={f.pack}
                    alt={`Makzo's ${f.name} roasted makhana, 55 g pack`}
                    width={347}
                    height={460}
                    className={styles.packImg}
                  />
                </div>

                <p className={`u-mono ${styles.origin}`}>{f.origin}</p>
                <h3 className={`u-display u-slant ${styles.name}`}>{f.name}</h3>
                <p className={styles.note}>{f.note}</p>

                <div className={styles.foot}>
                  <HeatMeter level={f.heat} />
                  <button type="button" className={`u-mono ${styles.add}`}>
                    Add — ₹{f.price}
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
