import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FLAVOURS } from "@/lib/products";
import { CLAIMS } from "@/components/home/About";
import { Community } from "@/components/home/Community";
import ui from "@/components/home/ui.module.css";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Our story — Makzo's",
  description: "Makzo's is roasted makhana, flavoured around dishes people recognise, with ingredients you can understand.",
};

/**
 * The story page says what the brand guide says (p.3, p.25) and no more: the guide rules out
 * invented history, heritage and places (p.7, p.26). Founders' own words can be added here.
 */
export default function AboutPage() {
  return (
    <>
      <section className={styles.intro} aria-labelledby="story-title">
        <div className={ui.shell}>
          <h1 id="story-title" className={`${ui.display} ${styles.title}`}>Familiar dishes. <span>A different crunch.</span></h1>
          <p className={`${ui.lede} ${styles.lede}`}>
            Makzo&rsquo;s is roasted makhana, flavoured around dishes people recognise. Every pack tastes like one of them and contains nothing we wouldn&rsquo;t explain.
          </p>
        </div>
      </section>

      <section className={styles.points} aria-label="What we stand for">
        <div className={`${ui.shell} ${styles.pointGrid}`}>
          <article>
            <h2 className={`${ui.display} ${styles.h}`}>The idea</h2>
            <p>Start with a dish you already know, then put its flavour on roasted makhana. Rasam, tamarind chutney, mac and cheese, tiramisu: the name on the pack is the dish in the bag.</p>
          </article>
          <article>
            <h2 className={`${ui.display} ${styles.h}`}>The promise</h2>
            <ul className={styles.claims}>{CLAIMS.map((c) => <li key={c}>{c}</li>)}</ul>
          </article>
          <article>
            <h2 className={`${ui.display} ${styles.h}`}>The pack</h2>
            <p>Each pack shows a moment around its dish in black and white. Only the food is in colour, because the food is the point.</p>
          </article>
        </div>
      </section>

      <section className={styles.dishes} aria-labelledby="dishes-title">
        <div className={ui.shell}>
          <h2 id="dishes-title" className={`${ui.display} ${styles.h2}`}>The dishes behind the bags.</h2>
          <ul className={styles.dishGrid}>
            {FLAVOURS.map((f) => (
              <li key={f.id} className={styles.dish}>
                <figure>
                  <div className={styles.dishPhoto}>
                    <Image src={f.dish.src} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
                  </div>
                  <figcaption>
                    <strong className={ui.display}>{f.name}</strong>
                    <span>{f.inspired}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <Link href="/shop" className={ui.btnPaprika}>Shop all flavours</Link>
        </div>
      </section>

      <Community />
    </>
  );
}
