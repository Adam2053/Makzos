import Image from "next/image";
import styles from "./Bits.module.css";

/** Star rating, rounded to the nearest half. */
export function Stars({ value, small = false }: { value: number; small?: boolean }) {
  const full = Math.round(value * 2) / 2;
  return (
    <span className={styles.stars} data-small={small || undefined}>
      <span aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={styles.star} data-fill={i + 1 <= full ? "full" : i + 0.5 === full ? "half" : "none"}>
            ★
          </span>
        ))}
      </span>
      <span className={styles.sr}>{value} out of 5</span>
    </span>
  );
}

/** Heat as chillies, because this is not a spec-sheet kind of page. */
export function Heat({ level }: { level: number }) {
  if (level === 0) {
    return <span className={`u-label ${styles.heatNone}`}>No heat</span>;
  }
  return (
    <span className={styles.heat}>
      <span aria-hidden="true">{"🌶".repeat(level)}</span>
      <span className={styles.sr}>Heat {level} out of 5</span>
    </span>
  );
}

/** The bitten puff from the wordmark, reused as the brand's punctuation. */
export function Puff({
  size = 40,
  light = false,
  className,
}: {
  size?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={light ? "/brand/puff-light.png" : "/brand/puff.png"}
      alt=""
      width={226}
      height={296}
      className={className}
      style={{ width: size, height: "auto" }}
      aria-hidden="true"
    />
  );
}
