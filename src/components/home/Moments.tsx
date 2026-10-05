import Image from "next/image";
import { byId } from "@/lib/products";
import { AddButton } from "./AddButton";
import ui from "./ui.module.css";
import styles from "./Moments.module.css";

/** The guide's occasions (p.5), each paired with a flavour to try for it. */
const MOMENTS = [
  { title: "The 4 pm break", copy: "Between meetings, with chai, at your desk.", photo: "rasam", pair: "rasam", alt: "A mother and son ladle rasam at the stove." },
  { title: "Friends over", copy: "One bowl in the middle and everyone reaching.", photo: "sweet-tamarind", pair: "sweet-tamarind", alt: "Two schoolboys share tamarind under a tree." },
  { title: "Something to bring", copy: "A small gift for a host who has everything.", photo: "tiramisu", pair: "tiramisu", alt: "A chef dusts cocoa over tiramisu at an evening restaurant." },
];

export function Moments() {
  return (
    <section id="moments" className={styles.section} aria-labelledby="moments-title">
      <div className={ui.shell}>
        <h2 id="moments-title" className={`${ui.display} ${styles.title}`}>Made for the in-between.</h2>
        <ul className={styles.grid}>
          {MOMENTS.map((m) => {
            const f = byId(m.pair);
            return (
              <li key={m.title} className={styles.item}>
                <figure className={styles.arch}>
                  <Image src={byId(m.photo).dish.src} alt={m.alt} fill sizes="(max-width: 900px) 90vw, 30vw" />
                </figure>
                <h3 className={`${ui.display} ${styles.name}`}>{m.title}</h3>
                <p className={styles.copy}>{m.copy} Try <strong>{f.name}</strong>.</p>
                <AddButton id={f.id} label={`Add ${f.name}`} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
