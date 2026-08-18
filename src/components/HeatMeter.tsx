import styles from "./HeatMeter.module.css";

/** Heat as a spec readout: five cells, filled to the flavour's level. */
export function HeatMeter({
  level,
  compact = false,
}: {
  level: number;
  compact?: boolean;
}) {
  return (
    <span className={styles.meter} data-compact={compact || undefined}>
      {!compact && <span className="u-mono">Heat</span>}
      <span className={styles.cells} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={styles.cell} data-on={i < level || undefined} />
        ))}
      </span>
      <span className={styles.sr}>Heat {level} out of 5</span>
    </span>
  );
}
