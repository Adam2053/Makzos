import Image from "next/image";
import Link from "next/link";
import ui from "./ui.module.css";
import styles from "./Faq.module.css";

/**
 * The founders' FAQ copy (makzosmockups/FAQs.docx), word for word. Each answer is written to
 * answer a search people actually make (makhana calories, INS 635, maltodextrin, MSG...).
 */
const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is makhana, and why is it a good snack?",
    a: "Makhana is the popped seed of the Euryale ferox water lily. It's also called fox nuts. Makzo's uses only phool makhana, the big 5- and 6-suta pops from the top grades. Most of India's makhana grows in the ponds of Bihar. Plain popped makhana has about 9 g of protein and under 1 g of fat per 100 g, and Makzo's carries 13.5 g of fibre in every 100 g. It's light, turns crunchy when roasted, and takes on whatever flavour you give it. We give it dishes.",
  },
  {
    q: "How is roasted makhana different from ragi chips, jowar puffs and other chips?",
    a: "Ragi chips, jowar puffs and veggie chips usually start as flour or thin slices that are fried, baked or puffed through a machine, then dusted with flavouring. Makzo's is the whole makhana seed, roasted in rice bran oil, not fried. It has 13.5 g of fibre in every 100 g, and the seasoning is made from spices you can name. Nothing artificial. Nothing unnecessary.",
  },
  {
    q: "How many calories are in a pouch of Makzo's?",
    a: "A 50 g pouch of Makzo's roasted makhana has 203.7 kcal, 4.56 g of protein and 6.75 g of fibre. Per 100 g, that's 407.45 kcal, 9.12 g of makhana protein and 13.5 g of fibre. The full makhana nutrition table is on the back of every pack and on each flavour page.",
  },
  {
    q: "What flavours does Makzo's come in, and which should I try first?",
    a: <>Six flavoured makhanas, each named after a dish: Chettinad, Rasam, Curry Leaves, Sweet Tamarind, Sweet Thai Chilli and Mac &amp; Cheese. New to us? Start with Curry Leaves, the one our tasting panel most wanted to buy. Can&rsquo;t decide? <Link href="/build-a-box" className={ui.link}>Build a box</Link> of four to seven pouches and try them all.</>,
  },
  {
    q: "What is INS 635 (flavour enhancer 635)?",
    a: "INS 635 is disodium 5'-ribonucleotides, a flavour enhancer often paired with MSG to make packaged seasoning taste stronger. You'll find it on many chips and instant noodles. Makzo's doesn't use it. Our flavour comes from spices, tamarind and curry leaves.",
  },
  {
    q: "What is maltodextrin, and why is it in snacks?",
    a: "Maltodextrin is a starch powder, usually made from corn, that bulks up seasoning and helps it flow and stick. It digests fast and can raise blood sugar quickly, which some people feel as a slump later. Makzo's seasonings contain no maltodextrin and no dextrose.",
  },
  {
    q: "What is MSG, and where does Makzo's get its savoury taste?",
    a: "MSG (monosodium glutamate, INS 621) is a flavour enhancer that adds a savoury, umami kick. Makzo's gets its savoury taste from the dish itself: tomato, tamarind, cheese, curry leaves and yeast extract. These contain natural glutamates, just like a good rasam does.",
  },
  {
    q: "Is Makzo's vegetarian?",
    a: "Yes, all six flavours are vegetarian. Not all are vegan: Mac & Cheese and Chettinad contain milk. Mac & Cheese also contains groundnut, and Chettinad and Sweet Thai Chilli contain soya. Every pack lists its allergens.",
  },
  {
    q: "Do you make corporate gift hampers?",
    // The doc leaves the contact as "[email or WhatsApp]"; until it's filled in, this points to the contact page.
    a: <>Yes. Pick four to seven pouches in any mix with <Link href="/build-a-box" className={ui.link}>Build-a-Box</Link>, and you&rsquo;ve got a gift that starts conversations. For corporate orders, Diwali hampers or custom boxes, <Link href="/contact" className={ui.link}>write to us</Link> and we&rsquo;ll send you a quote.</>,
  },
  {
    q: "Where can I buy Makzo's, and how much is it?",
    a: "Order on www.makzos.com, with free shipping on orders above ₹500. A 50 g pouch is ₹149. You'll also find us in select stores in Hyderabad, Bengaluru and Chennai.",
  },
];

/** Native disclosure widgets: they open with a tap, Enter or Space, and need no script. */
export function Faq({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <header className={styles.head}>
          <Heading id="faq-title" className={`${ui.display} ${styles.title}`}>Good questions.</Heading>
          <p className={`${ui.lede} ${styles.lede}`}>
            Something else? <Link href="/contact" className={ui.link}>Write to us</Link>
          </p>
          {/* What the questions are about: an open bag, full to the top. */}
          <Image src="/brand/scenes/open-bag.webp" alt="An open bag of Makzo's, full of roasted makhana" width={900} height={691}
            sizes="(max-width: 960px) 60vw, 30vw" className={styles.bag} />
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
