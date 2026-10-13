import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { byId } from "@/lib/products";
import { LAB_TESTS } from "@/lib/nutrition";
import { CLAIMS } from "@/components/home/About";
import { Makhana } from "@/components/home/Makhana";
import { PageHead, SampleTag } from "@/components/shop/bits";
import { Pack } from "@/components/shop/Pack";
import ui from "@/components/home/ui.module.css";
import styles from "./roast.module.css";

export const metadata: Metadata = {
  title: "How we roast — Makzo's",
  description: "From the pond to the pouch: how Makzo's makhana is graded, roasted, seasoned, packed and tested.",
};

/**
 * Sitemap: Brand story. The process, step by step, as a real sequence. Each step says only
 * what is true of roasted makhana in general; the specifics (where, which machines, which
 * lab) are the founders' to add, and the page marks where they go.
 */
const STEPS = [
  { t: "Gathered", d: "Makhana is the seed of a water lily. It's gathered from pond beds by hand, then dried and popped.", detail: "Where ours comes from, and who grows it." },
  { t: "Graded", d: "The puffed seeds are sorted by size, so every piece in a bag roasts and seasons the same way.", detail: null },
  { t: "Roasted", d: "Dry heat, not oil. Roasted until crisp all the way through: that's where the crunch comes from.", detail: "Roast time and temperature." },
  { t: "Seasoned", d: "Each flavour is built around its dish, and tossed on in small batches so it coats every piece.", detail: null },
  { t: "Packed", d: "Into a sealed pouch, straight away, so the crunch you open is the crunch we roasted.", detail: null },
  { t: "Tested", d: "Every batch goes to an independent lab before it ships. The reports go on each flavour's page.", detail: "The lab's name and accreditation." },
];

export default function HowWeRoast() {
  const f = byId("chettinadu");
  return (
    <>
      <PageHead title="How we roast." lede="From the pond to the pouch, in six steps. Nothing fried, nothing added that we wouldn't explain." crumbs={[{ href: "/", label: "Home" }, { label: "How we roast" }]} />

      <section className={`${ui.shell} ${styles.steps}`} aria-label="The process">
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.t} className={styles.step}>
              <span className={`${ui.display} ${styles.num}`} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div className={styles.stepText}>
                <h2 className={`${ui.display} ${styles.stepTitle}`}>{s.t}</h2>
                <p>{s.d}</p>
                {s.detail && <p className={styles.todo}><SampleTag>To add</SampleTag> {s.detail}</p>}
              </div>
              <div className={styles.art} aria-hidden="true">
                {i === 4 ? <Pack id="rasam" sizes="120px" alt="" className={styles.artPack} tilt={-6} />
                  : <Makhana variant={i % 2 ? "outline" : "fill"} className={styles.seed} style={{ rotate: `${i * 23 - 30}deg` }} />}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.band} aria-labelledby="band-title">
        <figure className={styles.bandPhoto}>
          <Image src={f.dish.src} alt="" fill sizes="100vw" style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
        </figure>
        <div className={`${ui.shell} ${styles.bandCopy}`}>
          <h2 id="band-title" className={`${ui.display} ${styles.bandTitle}`}>Nothing artificial. Nothing unnecessary.</h2>
          <ul className={styles.claims}>{CLAIMS.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>

      <section className={`${ui.shell} ${styles.lab}`} aria-labelledby="lab-title">
        <div>
          <h2 id="lab-title" className={`${ui.display} ${styles.h2}`}>Tested, and published.</h2>
          <p className={`${ui.lede} ${styles.quiet}`}>Every batch is tested by an independent lab. Each flavour&rsquo;s report goes on its page, in full, for anyone to read.</p>
          <Link href="/shop" className={ui.btnPaprika}>See the flavours</Link>
        </div>
        <ul className={styles.tests}>{LAB_TESTS.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
    </>
  );
}
