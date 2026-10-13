import Image from "next/image";
import { byId } from "@/lib/products";
import ui from "@/components/home/ui.module.css";
import { Heat } from "./marks";
import styles from "./ProductStory.module.css";

/** The dish behind the bag, and what you taste in the order you taste it. */
export function ProductStory({ id }: { id: string }) {
  const f = byId(id);
  return (
    <section className={styles.section} aria-labelledby="story-title" style={{ "--field": f.field } as React.CSSProperties}>
      <div className={`${ui.shell} ${styles.grid}`}>
        <figure className={styles.photo}>
          <Image src={f.dish.src} alt={`The ${f.name} pack photo: ${f.inspired.toLowerCase()}`} fill sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
          <figcaption>On the pack, only the dish is in colour.</figcaption>
        </figure>
        <div className={styles.copy}>
          <h2 id="story-title" className={`${ui.display} ${styles.title}`}>{f.inspired.replace("Inspired by ", "Built around ").replace(/\.$/, ".")}</h2>
          <p className={styles.story}>{f.story}</p>
          <div className={styles.tasting}>
            <h3 className={styles.h3}>How it tastes, in order</h3>
            {/* A real sequence: first, then, last. */}
            <ol className={styles.notes}>
              {f.notes.map((n, i) => <li key={n}><span className={styles.when}>{["First", "Then", "Last"][i]}</span><strong className={ui.display}>{n}</strong></li>)}
            </ol>
            <Heat level={f.heat} />
          </div>
        </div>
      </div>
    </section>
  );
}
