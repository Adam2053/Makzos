import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FLAVOURS, byId } from "@/lib/products";
import { LAB_TESTS } from "@/lib/nutrition";
import { CLAIMS } from "@/components/home/About";
import { Community } from "@/components/home/Community";
import { Makhana } from "@/components/home/Makhana";
import { Belief, Roast, StoryHero } from "./Story";
import ui from "@/components/home/ui.module.css";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Our story — Makzo's",
  description: "What Makzo's believes, what the name means, and how our makhana is graded, roasted, seasoned, packed and tested.",
};

/** The name, read the way the guide reads it (D4, logo meaning). */
const NAME = [
  { lead: "MAK", rest: "hana", d: "The hero ingredient, and the base of everything we make." },
  { lead: "Z", rest: "er", lead2: "O", rest2: " guilt", d: "Indulgence with nothing artificial or unnecessary." },
  { lead: "", rest: "your", lead2: "’S", rest2: "", d: "A snack people can proudly call their own." },
];

/** Purpose, vision and mission, shortened from the guide (D4, brand overview). Founders to approve. */
const PILLARS = [
  { t: "Purpose", d: "Unlock what makhana can be: value-added snacks, cookies and beyond, aspirational to enjoy and accessible to all, in the flavours India loves." },
  { t: "Vision", d: "Makhana as familiar as nachos, in every city and every country, with a flavour on the shelf for every state." },
  { t: "Mission", d: "A complete range people choose for taste and trust for what's inside. Never trading taste or quality for a shortcut." },
];

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

      <section className={styles.name} aria-labelledby="name-title">
        <div className={ui.shell}>
          <h2 id="name-title" className={`${ui.display} ${styles.h2}`}>What&rsquo;s in <span>the name.</span></h2>
          <ul className={styles.nameRow}>
            {NAME.map((n, i) => (
              <li key={i} className={styles.nameItem}>
                <p className={`${ui.display} ${styles.word}`} aria-hidden="true">
                  <b>{n.lead}</b>{n.rest}{n.lead2 && <b>{n.lead2}</b>}{n.rest2}
                </p>
                <p>{n.d}</p>
              </li>
            ))}
          </ul>
          <ul className={styles.pillars}>
            {PILLARS.map((p) => (
              <li key={p.t}>
                <Makhana variant="fill" className={styles.pillarSeed} />
                <h3 className={`${ui.label} ${styles.pillarTitle}`}>{p.t}</h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
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
