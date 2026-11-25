import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FLAVOURS, byId } from "@/lib/products";
import { LAB_TESTS } from "@/lib/nutrition";
import { CLAIMS } from "@/components/home/About";
import { Community } from "@/components/home/Community";
import { Belief, Roast, StoryHero } from "./Story";
import { Conveyor } from "./Conveyor";
import { NameBuild } from "./NameBuild";
import ui from "@/components/home/ui.module.css";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Our story — Makzo's",
  description: "What Makzo's believes, what the name means, and how our makhana is graded, roasted, seasoned, packed and tested.",
};

/**
 * Our story and how we roast, merged into one flow (review notes): what we believe, what the
 * name means, the process from the pond to the pouch, the promise, the dishes. It says what the
 * brand guide says and no more: no invented history, heritage or places (p.7, p.26).
 */
export default function AboutPage() {
  const band = byId("chettinadu");
  return (
    <>
      <StoryHero />
      <Belief />
      <Conveyor />

      <section className={styles.name} aria-labelledby="name-title">
        <NameBuild />
      </section>

      <Roast />

      <section className={styles.band} aria-labelledby="band-title">
        <figure className={styles.bandPhoto}>
          <Image src={band.dish.src} alt="" fill sizes="100vw" style={{ objectPosition: `${band.dish.spot[0] * 100}% ${band.dish.spot[1] * 100}%` }} />
        </figure>
        <div className={`${ui.shell} ${styles.bandCopy}`}>
          <h2 id="band-title" className={`${ui.display} ${styles.bandTitle}`}>Nothing artificial. Nothing unnecessary.</h2>
          <ul className={styles.claims}>{CLAIMS.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>

      <section className={`${ui.shell} ${styles.lab}`} aria-labelledby="lab-title">
        <div>
          <h2 id="lab-title" className={`${ui.display} ${styles.h2}`}>Tested, <span>and published.</span></h2>
          <p className={`${ui.lede} ${styles.quiet}`}>Every batch is tested by an independent lab. Each flavour&rsquo;s report goes on its page, in full, for anyone to read.</p>
        </div>
        <ul className={styles.tests}>{LAB_TESTS.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className={styles.dishes} aria-labelledby="dishes-title">
        <div className={ui.shell}>
          <h2 id="dishes-title" className={`${ui.display} ${styles.h2}`}>The dishes <span>behind the bags.</span></h2>
          <ul className={styles.dishGrid}>
            {FLAVOURS.map((f) => (
              <li key={f.id} className={styles.dish}>
                <Link href={`/products/${f.slug}`}>
                  <span className={styles.dishPhoto}>
                    <Image src={f.dish.src} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
                  </span>
                  <strong className={ui.label}>{f.name}</strong>
                  <span>{f.inspired}</span>
                </Link>
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
