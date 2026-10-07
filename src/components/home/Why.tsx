import Image from "next/image";
import Link from "next/link";
import { PACK_H, PACK_W, byId } from "@/lib/products";
import ui from "./ui.module.css";
import styles from "./Why.module.css";

/**
 * Us against the usual bag of chips, the snack the Switcher is leaving (guide p.4). No brand is
 * named or shown (p.6). Our column uses only the brief-approved claims (p.9); the other column
 * is deliberately hedged. Any new row needs founder review before it ships.
 */
const ROWS: { label: string; us: string; them: string }[] = [
  { label: "The flavour", us: "Built around a dish you can name.", them: "Usually named after a seasoning." },
  { label: "The crunch", us: "Roasted makhana.", them: "Usually fried." },
  { label: "Preservatives", us: "None.", them: "Often on the label." },
  { label: "Colours and flavours", us: "Nothing artificial.", them: "Often added." },
  { label: "Additives", us: "No INS-coded additives.", them: "Often a row of INS numbers." },
  { label: "The ingredient list", us: "Nothing we wouldn't explain.", them: "Worth a second read." },
];

/** The pack standing on our column: a launch flavour (guide p.37). */
const PACK = byId("rasam");

export function Why() {
  return (
    <section id="why" className={styles.section} aria-labelledby="why-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <header className={styles.head}>
          <h2 id="why-title" className={`${ui.display} ${styles.title}`}>Familiar dishes. <span>A different crunch.</span></h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Every pack tastes like a dish you recognise and contains nothing we wouldn&rsquo;t explain. Here&rsquo;s how that compares.
          </p>
          <Link href="/shop" className={`${ui.btnPaprika} ${styles.cta}`}>Shop all</Link>
        </header>

        <table className={styles.table}>
          <caption className={ui.sr}>Makzo&rsquo;s compared with a typical bag of chips</caption>
          <thead>
            <tr>
              <td />
              <th scope="col" className={styles.us}>
                <Image src={PACK.pack} alt="" width={PACK_W} height={PACK_H} sizes="120px" className={styles.pack} />
                <Image src="/brand/logo-dark.png" alt="Makzo's" width={1200} height={296} className={styles.logo} />
              </th>
              <th scope="col" className={styles.them}>
                <span className={styles.vs} aria-hidden="true">vs</span>
                {/* A plain, unbranded bag: the guide rules out showing anyone else's pack (p.6). */}
                <svg viewBox="0 0 96 128" aria-hidden="true" className={styles.bag}>
                  <path d="M10 14h76l-5 10 7 80-7 10H15l-7-10 7-80-5-10Z" />
                  <path d="M14 24h68M14 104h68" />
                  <circle cx="48" cy="64" r="15" />
                </svg>
                <span className={`${ui.display} ${styles.others}`}>Others</span>
                <span className={styles.othersSub}>The usual bag of chips</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className={styles.us}>
                  <span className={styles.cell}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.mark}><circle cx="12" cy="12" r="12" /><path d="M6.8 12.4l3.4 3.4 7-7.2" /></svg>
                    <span>{r.us}</span>
                  </span>
                </td>
                <td className={styles.them}>
                  <span className={styles.cell}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.cross}><circle cx="12" cy="12" r="12" /><path d="M8 8l8 8M16 8l-8 8" /></svg>
                    <span>{r.them}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
