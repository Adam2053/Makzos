import Image from "next/image";
import { BOX_PRICE, FLAVOURS } from "@/lib/flavours";
import { Reveal } from "./Reveal";
import styles from "./BuildBox.module.css";

export function BuildBox() {
  return (
    <section id="box" className={styles.section}>
      <div className={`u-shell ${styles.inner}`}>
        <Reveal className={styles.copy}>
          <p className="u-mono">The box</p>
          <h2 className={`u-display ${styles.title}`}>One of each</h2>
          <p className={`u-lede ${styles.lede}`}>
            Four 55 g bags, one from every place we went. Free delivery over
            ₹499, and you can swap any bag for a second favourite at checkout.
          </p>

          <div className={styles.actions}>
            <button type="button" className={`u-mono ${styles.cta}`}>
              Build my box — ₹{BOX_PRICE}
            </button>
            <span className={`u-mono ${styles.fine}`}>Ships in 2–4 days</span>
          </div>
        </Reveal>

        {/* The one moment all four colours are allowed on screen together. */}
        <Reveal delay={120} className={styles.lineup}>
          {FLAVOURS.map((f, i) => (
            <div
              key={f.id}
              className={styles.slot}
              style={
                {
                  "--flavour": f.accent,
                  "--i": i,
                } as React.CSSProperties
              }
            >
              <Image
                src={f.pack}
                alt={`Makzo's ${f.name}`}
                width={347}
                height={460}
                className={styles.pack}
              />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
