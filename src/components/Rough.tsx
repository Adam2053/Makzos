import styles from "./Rough.module.css";

/**
 * Roughens the edges of display type so it reads as ink stamped onto a packet
 * rather than clean vector. One filter, defined once, referenced by `.u-rough`.
 * Only used on type above ~2rem — at small sizes the displacement eats it.
 */
export function RoughFilter() {
  return (
    <svg className={styles.defs} aria-hidden="true" focusable="false">
      <filter id="makzo-rough" x="-6%" y="-12%" width="112%" height="128%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.42"
          numOctaves="2"
          seed="4"
          result="grain"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="grain"
          scale="4.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
