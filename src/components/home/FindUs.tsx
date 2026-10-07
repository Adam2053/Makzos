import Image from "next/image";
import ui from "./ui.module.css";
import styles from "./FindUs.module.css";

/**
 * Where else Makzo's is sold. The marks are each store's own app icon, taken from its App
 * Store listing (October 2026) and shown whole and unaltered; confirm each store's rules for
 * "available on" use before launch. Instamart's is the blue 2025 identity, not Swiggy orange.
 * `href` is each store's front door for now: point it at the Makzo's listing on that store.
 */
const STORES: { id: string; name: string; kind: string; href: string; field: string; ink: "#000000" | "#ffffff" }[] = [
  { id: "blinkit", name: "Blinkit", kind: "Quick delivery", href: "https://blinkit.com/", field: "#F8CB46", ink: "#000000" },
  { id: "instamart", name: "Instamart", kind: "Quick delivery", href: "https://www.swiggy.com/instamart", field: "#0050FF", ink: "#ffffff" },
  { id: "zepto", name: "Zepto", kind: "Quick delivery", href: "https://www.zeptonow.com/", field: "#3C0A6B", ink: "#ffffff" },
  { id: "amazon", name: "Amazon", kind: "Home delivery", href: "https://www.amazon.in/", field: "#131921", ink: "#ffffff" },
];

export function FindUs() {
  return (
    <section id="find" className={styles.section} aria-labelledby="find-title">
      <div className={ui.shell}>
        <header className={styles.head}>
          <h2 id="find-title" className={`${ui.display} ${styles.title}`}>Find us where you already shop.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>Makzo&rsquo;s is on {STORES.slice(0, -1).map((s) => s.name).join(", ")} and {STORES[STORES.length - 1].name}.</p>
        </header>
        <ul className={styles.stores}>
          {STORES.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noreferrer" className={styles.store} style={{ "--field": s.field, "--ink": s.ink } as React.CSSProperties}>
                <Image src={`/brand/stores/${s.id}.webp`} alt="" width={512} height={512} sizes="112px" className={styles.icon} />
                <span className={`${ui.display} ${styles.name}`}>{s.name}</span>
                <span className={styles.kind}>{s.kind}</span>
                <span className={styles.go}>
                  Order on {s.name}
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
