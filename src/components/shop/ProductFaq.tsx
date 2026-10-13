import Link from "next/link";
import { BOX_MAX, BOX_SIZE, WEIGHT, byId } from "@/lib/products";
import ui from "@/components/home/ui.module.css";
import styles from "./ProductFaq.module.css";

const HEAT = ["Mild. No heat at all.", "Gentle warmth, not spicy.", "Properly spicy, but friendly.", "Hot. It builds as you eat."];

/** The questions people ask about one flavour, answered with what's on the pack. */
export function ProductFaq({ id }: { id: string }) {
  const f = byId(id);
  const Q: { q: string; a: React.ReactNode }[] = [
    { q: `How spicy is ${f.name}?`, a: HEAT[f.heat] },
    { q: "Is it vegetarian?", a: "Yes. Every Makzo's pack carries the green vegetarian mark." },
    { q: "Is it fried?", a: "No. The makhana is roasted, then seasoned." },
    { q: "What allergens does it contain?", a: "Milk, groundnut and soya are present across the range. The pack has the full allergen statement." },
    { q: `How much is in a bag?`, a: `${WEIGHT}. Enough for one person, or two if you're generous.` },
    { q: "Can I mix it with other flavours?", a: <>Yes. A box takes {BOX_SIZE} to {BOX_MAX} bags in any mix, and the more you add, the less each costs. <Link href="/build-a-box" className={ui.link}>Build a box</Link></> },
  ];
  return (
    <section className={styles.section} aria-labelledby="pfaq-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div>
          <h2 id="pfaq-title" className={`${ui.display} ${styles.title}`}>About {f.name}.</h2>
          <p className={styles.more}>More answers in <Link href="/faq" className={ui.link}>Help</Link></p>
        </div>
        <div className={styles.list}>
          {Q.map((x) => (
            <details key={x.q} className={styles.item} name="pfaq">
              <summary>{x.q}</summary>
              <p>{x.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
