import Image from "next/image";
import { FLAVOURS } from "@/lib/flavours";
import { Heat, Stars } from "./Bits";
import { Reveal } from "./Reveal";
import styles from "./Shop.module.css";

export function Shop() {
  return (
    <section id="shop" className={styles.section}>
      <div className={`u-shell ${styles.capsule} u-capsule`}>
        <Reveal className={styles.head}>
          <p className={`u-label ${styles.kicker}`}>Choose yours</p>
          <h2 className={`u-display ${styles.title}`}>
            Four bags, <span className={styles.hot}>one honest seed</span>
          </h2>
        </Reveal>

        <ul className={styles.grid}>
          {FLAVOURS.map((f, i) => (
            <Reveal as="li" key={f.id} delay={i * 70} className={styles.cell}>
              <article
                className={styles.card}
                style={{ "--tile": f.tile } as React.CSSProperties}
              >
                <div className={styles.shot}>
                  {f.badge && <span className={`u-label ${styles.badge}`}>{f.badge}</span>}
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
                    <span>{f.reviews}</span>
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
                    <button type="button" className={`u-pill ${styles.add}`}>
                      Buy now
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
