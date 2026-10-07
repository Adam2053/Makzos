import Image from "next/image";
import Link from "next/link";
import ui from "./ui.module.css";
import styles from "./About.module.css";

/** The brief-approved claims, word for word (guide p.9). Nothing is added to this list without founder review. */
export const CLAIMS = ["No preservatives.", "No artificial colours or flavours.", "No INS-coded additives.", "Made with makhana."];

/** The brand in a paragraph (guide p.3), on the page's one black field. The full story is on /about. */
export function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <figure className={styles.photo}>
          <Image src="/brand/dishes/rasam.webp" alt="Rasam being ladled into a bowl in a home kitchen; only the rasam is in colour." fill sizes="(max-width: 960px) 100vw, 45vw" />
        </figure>
        <div className={styles.copy}>
          <h2 id="about-title" className={`${ui.display} ${styles.title}`}>Start with the dish. <span>Discover the crunch.</span></h2>
          <p className={ui.lede}>
            Makzo&rsquo;s is roasted makhana, flavoured around dishes people recognise. We bring those flavours into everyday snacking, with ingredients you can understand.
          </p>
          <ul className={styles.claims}>
            {CLAIMS.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <Link href="/about" className={ui.btnLight}>Read our story</Link>
        </div>
      </div>
    </section>
  );
}
