import Image from "next/image";
import { BOX_MRP, BOX_PRICE, FLAVOURS } from "@/lib/flavours";
import { Reveal } from "./Reveal";
import styles from "./BuildBox.module.css";

export function BuildBox() {
  return (
    <section id="box" className={styles.section}>
      <div className="u-shell">
        <Reveal>
          <div className={styles.card}>
            <div className={styles.copy}>
              <p className={`u-label ${styles.kicker}`}>The combo</p>
              <h2 className={`u-display u-rough ${styles.title}`}>
                All four.
                <br />
                <span className={styles.pop}>One box.</span>
              </h2>
              <p className={styles.text}>
                One bag from every place we went. Swap any of them for a second
                favourite at checkout — we won&apos;t be offended.
              </p>

              <div className={styles.buy}>
                <p className={styles.price}>
                  <span className={styles.now}>₹{BOX_PRICE}</span>
                  <s className={styles.was}>₹{BOX_MRP}</s>
                  <span className={`u-label ${styles.save}`}>
                    Save {Math.round((1 - BOX_PRICE / BOX_MRP) * 100)}%
                  </span>
                </p>
                <button type="button" className={`u-label ${styles.cta}`}>
                  Add the box
                </button>
              </div>
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
