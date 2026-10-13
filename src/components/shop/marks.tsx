import styles from "./marks.module.css";

/** The vegetarian mark as printed on the pack: a green dot in a green square. */
export function VegMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className={styles.veg} role="img" aria-label="Vegetarian">
      <rect x="1" y="1" width="14" height="14" rx="1.5" />
      <circle cx="8" cy="8" r="3.6" />
    </svg>
  );
}

const HEAT = ["Mild", "A little warm", "Spicy", "Hot"];

/** How hot, from mild to hot: three chillies, filled as far as the flavour goes. */
export function Heat({ level }: { level: 0 | 1 | 2 | 3 }) {
  return (
    <span className={styles.heat} role="img" aria-label={`Heat: ${HEAT[level]}`}>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 24 24" aria-hidden="true" data-on={n <= level || undefined}>
          <path d="M14.5 4.5c.3-1.4 1.5-2 2.5-1.8M15 5.5c4 .5 5.4 4.6 3.4 9.3-2.3 5.4-8 7.5-12.9 6.4 4.8-1.6 6.3-5.4 6.4-9.6.1-3.6 1-6.4 3.1-6.1Z" />
        </svg>
      ))}
      <span>{HEAT[level]}</span>
    </span>
  );
}
