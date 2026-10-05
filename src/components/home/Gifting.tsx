import Image from "next/image";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Gifting.module.css";

/** For the Host: buying for family, guests, offices and events (guide p.4–5). No bulk prices or service promises. */
export function Gifting() {
  return (
    <section id="gifting" className={styles.section} aria-labelledby="gifting-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <figure className={styles.photo}>
          <Image src="/brand/dishes/sweet-tamarind.webp" alt="Two schoolboys share tamarind under a tamarind tree." fill sizes="(max-width: 900px) 92vw, 46vw" />
          <Makhana variant="fill" className={styles.seed} />
        </figure>
        <div className={styles.copy}>
          <h2 id="gifting-title" className={`${ui.display} ${styles.title}`}>A flavour for every person at the table.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Ordering for an office, a party or a gift? Tell us the date and how many people, and we&rsquo;ll confirm which flavours we can send.
          </p>
          <a href="mailto:hello@makzos.com?subject=Group%20order" className={ui.btn}>Ask about a group order</a>
        </div>
      </div>
    </section>
  );
}
