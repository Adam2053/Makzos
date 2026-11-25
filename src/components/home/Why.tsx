import Image from "next/image";
import Link from "next/link";
import ui from "./ui.module.css";
import styles from "./Why.module.css";

/**
 * Us against the usual packet, as laid out in the comparison design (comparison_v1). No brand
 * is named or shown (guide p.6): the "others" packs are plain, unbranded. The copy is the
 * design's own; any new row needs founder review before it ships.
 */
const ROWS: { key: string; label: string; icon: [number, number]; them: string; us: string }[] = [
  { key: "flavours", label: "Flavours", icon: [160, 190], them: "Flavours you only find in packets", us: "Dish-Inspired Makhana, real cravings, reimagined." },
  { key: "fibre", label: "Fibre", icon: [150, 243], them: "Average Fibre: 6g/100g", us: "High fibre - 13.5g/100\u00a0g" },
  { key: "enhancer", label: "Flavour enhancer", icon: [160, 203], them: "Ask your metabolism", us: "No MSG: No INS 635 (I+G)" },
  { key: "fillers", label: "Fillers", icon: [160, 114], them: "Maltodextrin. Dextrose", us: "No Synthetic Fillers" },
  { key: "impact", label: "Impact", icon: [160, 179], them: "Refined fillers spike you, then drop you", us: "No refined fillers. No spike. No crash." },
];

/** Three of the range fanned out on top of our card, with a few makhana fallen at their feet. */
const FAN = [
  { id: "curry-leaves", alt: "Curry Leaves" },
  { id: "rasam", alt: "Rasam" },
  { id: "chettinadu", alt: "Chettinadu" },
];

export function Why() {
  return (
    <section id="why" className={styles.section} aria-labelledby="why-title">
      <div className={styles.grid}>
        <header className={styles.head}>
          <h2 id="why-title" className={`${ui.display} ${styles.title}`}>
            <span>A whole new snack.</span> <span>Big on flavour.</span> <span>Great on taste.</span>
          </h2>
          <p className={styles.lede}>
            Makzo&rsquo;s is roasted makhana that tastes like a South Indian dish. Chettinad, Rasam, Curry Leaves.
            Roasted in rice bran oil, not fried, with 13.5&nbsp;g of fibre per 100&nbsp;g. The seasoning skips INS&nbsp;635
            and maltodextrin. Spices do the talking.
          </p>
          <Link href="/shop" className={`${ui.btnPaprika} ${styles.cta}`}>Shop all</Link>
        </header>

        {/* For screen readers: the comparison as a plain table. The cards below draw the same thing. */}
        <table className={ui.sr}>
          <caption>Makzo&rsquo;s compared with other packaged snacks</caption>
          <thead><tr><td /><th scope="col">Others</th><th scope="col">Makzo&rsquo;s</th></tr></thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key}><th scope="row">{r.label}</th><td>{r.them}</td><td>{r.us}</td></tr>
            ))}
          </tbody>
        </table>

        {/*
          * Three pieces side by side, sharing one set of row heights so they line up: the grey
          * "others" card, leaning back a touch; the black pill with the row names; our Paprika
          * card on the right. Everything is sized off the block's own width, so it scales as one.
          */}
        <div className={styles.compare} aria-hidden="true">
          <div className={styles.stage}>
            <div className={styles.others}>
              <p className={styles.othersName}>Others</p>
              <ul className={styles.rows}>
                {ROWS.map((r) => <li key={r.key}>{r.them}</li>)}
              </ul>
            </div>
            <Image src="/brand/compare/others-packs.webp" alt="" width={900} height={713} sizes="(max-width: 960px) 40vw, 240px" className={styles.othersPacks} />

            <div className={styles.pill}>
              <span className={styles.vs}>VS</span>
              <ul className={styles.rows}>
                {ROWS.map((r) => (
                  <li key={r.key}>
                    <Image src={`/brand/compare/icon-${r.key}.webp`} alt="" width={r.icon[0]} height={r.icon[1]} className={styles.icon} />
                    <span className={styles.pillLabel}>{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.us}>
              <div className={styles.fan}>
                {FAN.map((p) => (
                  <Image key={p.id} src={`/brand/packs/${p.id}-3d.webp`} alt="" width={960} height={1414} sizes="(max-width: 960px) 20vw, 140px" className={styles.fanPack} />
                ))}
                {[1, 2, 3, 1, 2].map((n, i) => (
                  <Image key={i} src={`/brand/ingredients/makhana-${n}.webp`} alt="" width={360} height={319} sizes="40px" className={styles.seed} />
                ))}
              </div>
              <Image src="/brand/compare/logo-light.webp" alt="" width={720} height={178} className={styles.logo} />
              <ul className={styles.rows}>
                {ROWS.map((r) => (
                  <li key={r.key}>
                    <Image src="/brand/compare/mark.webp" alt="" width={120} height={128} className={styles.mark} />
                    <span>{r.us}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
