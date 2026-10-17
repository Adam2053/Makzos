import Link from "next/link";
import { STORY_CLIP } from "@/lib/ugc";
import { Film } from "./Film";
import ui from "./ui.module.css";
import styles from "./About.module.css";

/** The brief-approved claims, word for word (guide p.9). Nothing is added to this list without founder review. */
export const CLAIMS = ["No preservatives.", "No artificial colours or flavours.", "No INS-coded additives.", "Made with makhana."];

/** The brand in a paragraph (guide p.3), beside a short film, on the page's one black field. The full story is on /about. */
export function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        {/* A short film where the photo was: it plays while it's on screen, and a tap pauses it. */}
        <figure className={styles.photo}>
          <Film clip={STORY_CLIP} label="the Makzo's story film" />
          {STORY_CLIP.sample && <span className={styles.tag}>Sample video</span>}
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
