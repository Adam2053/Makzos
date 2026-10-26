import { BOX_MAX, BOX_SIZE, FEATURED, FLAVOURS } from "./products";

/**
 * Ready-made boxes, for people who'd rather not choose. Shown as the homepage's bundles, as the
 * combos under the box builder, and as offers at the bag checkpoint. `ids` is a function so the
 * surprise box can shuffle each time it's packed.
 */
export type Bundle = { id: string; name: string; dek: string; ids: () => string[]; size: number; mystery?: boolean };

export const BUNDLES: Bundle[] = [
  { id: "first", name: "The first four", dek: "Where everyone starts.", ids: () => FEATURED.map((f) => f.id), size: BOX_SIZE },
  { id: "spicy", name: "The spicy side", dek: "Pepper, chilli and a tadka.", ids: () => ["rasam", "chettinadu", "thai-chilli", "curry-leaves"], size: BOX_SIZE },
  { id: "all", name: "One of everything", dek: "The whole range, the best price a bag.", ids: () => FLAVOURS.map((f) => f.id), size: BOX_MAX },
  { id: "surprise", name: "Surprise me", dek: "Four we pick. No peeking.", ids: () => [...FLAVOURS].sort(() => Math.random() - 0.5).slice(0, BOX_SIZE).map((f) => f.id), size: BOX_SIZE, mystery: true },
];
