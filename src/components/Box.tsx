import Image from "next/image";
import { BOX_MRP, BOX_PRICE, FLAVOURS, STOCKISTS } from "@/lib/flavours";
import { Reveal } from "./Reveal";
import styles from "./Box.module.css";

export function Box() {
  return (
    <section id="box" className={styles.section}>
      <Reveal className={`u-shell ${styles.capsule} u-capsule`}>
        <div className={styles.copy}>
          <p className={`u-label ${styles.kicker}`}>The combo</p>
          <h2 className={`u-display ${styles.title}`}>
            All four.
            <br />
            <span className={styles.hot}>One box.</span>
          </h2>
          <p className={styles.text}>
            One bag from every place we went. Swap any of them for a second
            favourite at checkout.
          </p>

          <div className={styles.buy}>
            <p className={styles.price}>
              <span className={styles.now}>₹{BOX_PRICE}</span>
              <s className={styles.was}>₹{BOX_MRP}</s>
              <span className={`u-label ${styles.save}`}>
                Save {Math.round((1 - BOX_PRICE / BOX_MRP) * 100)}%
              </span>
            </p>
            <button type="button" className={`u-pill ${styles.cta}`}>
              Add the box
            </button>
          </div>

          <p className={`u-label ${styles.also}`}>Also on</p>
          <ul className={styles.stockists}>
            {STOCKISTS.map((s) => (
              <li key={s} className={styles.chip}>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.lineup}>
          {FLAVOURS.map((f, i) => (
            <div key={f.id} className={styles.slot} style={{ "--i": i } as React.CSSProperties}>
              <Image
                src={f.pack}
                alt={`Makzo's ${f.name}`}
                width={347}
                height={460}
                className={styles.pack}
              />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
