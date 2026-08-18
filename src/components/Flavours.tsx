import Image from "next/image";
import { FLAVOURS } from "@/lib/flavours";
import { Heat, Stars } from "./Bits";
import { Float } from "./Float";
import { Reveal } from "./Reveal";
import styles from "./Flavours.module.css";

export function Flavours() {
  return (
    <section id="flavours" className={styles.section}>
      <div className="u-shell">
        <Reveal className={styles.head}>
          <p className="u-label">Four bags, zero fillers</p>
          <h2 className={`u-display u-rough ${styles.title}`}>
            Pick your <span className={styles.pop}>puff</span>
          </h2>
        </Reveal>

        <ul className={styles.grid}>
          {FLAVOURS.map((f, i) => (
            <Reveal as="li" key={f.id} delay={i * 80} className={styles.cell}>
              <Float delay={i * 0.32} amount={9} className={styles.floater}>
                <article
                  className={styles.card}
                  style={{ "--tile": f.tile } as React.CSSProperties}
                  data-ink={f.ink}
                >
                  <div className={styles.shot}>
                    {f.badge && (
                      <span className={`u-label ${styles.badge}`}>
                        {f.badge}
                      </span>
                    )}
                    <span className={`u-label ${styles.off}`}>
                      {Math.round((1 - f.price / f.mrp) * 100)}% off
                    </span>
                    <Image
                      src={f.pack}
                      alt={`Makzo's ${f.name} roasted makhana, 55 g pack`}
                      width={347}
                      height={460}
                      className={styles.pack}
                    />
                  </div>

                  <div className={styles.body}>
                    <p className={`u-label ${styles.origin}`}>{f.origin}</p>
                    <h3 className={`u-display ${styles.name}`}>{f.name}</h3>

                    <p className={styles.rating}>
                      <Stars value={f.rating} small />
                      <span>
                        {f.rating} · {f.reviews} reviews
                      </span>
                    </p>

                    <p className={styles.note}>{f.note}</p>

                    <p className={styles.heat}>
                      <Heat level={f.heat} />
                    </p>

                    <div className={styles.buy}>
                      <p className={styles.price}>
                        <span className={styles.now}>₹{f.price}</span>
                        <s className={styles.was}>₹{f.mrp}</s>
                      </p>
                      <button type="button" className={`u-label ${styles.add}`}>
                        Add to bag
                      </button>
                    </div>
                  </div>
                </article>
              </Float>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
