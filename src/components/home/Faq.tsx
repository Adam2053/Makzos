import Link from "next/link";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FLAVOURS, WEIGHT, inr } from "@/lib/products";
import ui from "./ui.module.css";
import styles from "./Faq.module.css";

/**
 * Answers use only what the brand guide clears: the approved claims and the allergen note
 * (p.9), the launch order (p.5). Weight and prices come from lib/products, so they change
 * in one place. Vegetarian, vegan, gluten and nutrition questions stay out until cleared.
 */
const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is makhana?",
    a: "The puffed seed of a water lily, also called fox nut. We roast it, then flavour it around a dish.",
  },
  {
    q: "Which flavours are there?",
    a: `${FLAVOURS.length}: ${FLAVOURS.map((f) => f.name).join(", ")}. Each one is built around a dish you already know.`,
  },
  {
    q: "What's in a bag?",
    a: "Roasted makhana and its seasoning. No preservatives, no artificial colours or flavours, and no INS-coded additives. The full ingredient list is printed on every pack.",
  },
  {
    q: "What about allergens?",
    a: "Milk, groundnut and soya are present across the range. Check the allergen statement on the pack of the flavour you're buying.",
  },
  {
    q: "How big is a bag, and what does it cost?",
    a: `Each bag is ${WEIGHT} and costs ${inr(BAG_PRICE)}. Any ${BOX_SIZE} bags are priced as a box, ${inr(BOX_PRICE)}.`,
  },
  {
    q: "Can I choose what goes in my box?",
    a: <>Yes. Pick any {BOX_SIZE}, doubles included. <Link href="/#box" className={ui.link}>Build a box</Link></>,
  },
  {
    q: "Where do you deliver?",
    a: <>Hyderabad first, then Bengaluru. <Link href="/#community" className={ui.link}>Join the list</Link> and we&rsquo;ll email you when your city opens.</>,
  },
];

/** Native disclosure widgets: they open with a tap, Enter or Space, and need no script. */
export function Faq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <header className={styles.head}>
          <h2 id="faq-title" className={`${ui.display} ${styles.title}`}>Good questions.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>
            Something else? <a href="mailto:hello@makzos.com" className={ui.link}>Write to us</a>
          </p>
        </header>
        <div className={styles.list}>
          {QUESTIONS.map((x) => (
            <details key={x.q} className={styles.item} name="faq">
              <summary>
                <span>{x.q}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </summary>
              <p>{x.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
