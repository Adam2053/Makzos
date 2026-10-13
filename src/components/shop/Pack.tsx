import Image from "next/image";
import { PACK_H, PACK_W, WEIGHT, byId } from "@/lib/products";
import styles from "./Pack.module.css";

/**
 * The pack as an object, not a flat card: the front artwork with a pillow sheen, crimped seals
 * top and bottom, and a soft shadow under it. No backdrop of its own; it stands on whatever
 * surface it's placed on. Flavour colour comes from the artwork alone.
 */
export function Pack({ id, sizes, className, alt, preload, tilt = 0 }: {
  id: string; sizes: string; className?: string; alt?: string; preload?: boolean; tilt?: number;
}) {
  const f = byId(id);
  return (
    <span className={`${styles.pack} ${className ?? ""}`} style={tilt ? { rotate: `${tilt}deg` } : undefined}>
      <Image src={f.pack} alt={alt ?? `Makzo's ${f.name}, ${WEIGHT} pack`} width={PACK_W} height={PACK_H} sizes={sizes} preload={preload} />
    </span>
  );
}

/** A small, whole pack for lists: the bag, checkout, orders, pickers. Never cropped to a circle. */
export function PackThumb({ id, size = 48, className }: { id: string; size?: number; className?: string }) {
  return (
    <span className={`${styles.thumb} ${className ?? ""}`} style={{ "--w": `${size}px` } as React.CSSProperties} aria-hidden="true">
      <Image src={byId(id).pack} alt="" width={PACK_W} height={PACK_H} sizes={`${size * 2}px`} />
    </span>
  );
}
