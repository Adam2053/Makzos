import type { Ingredient } from "@/components/home/Ingredients";

/**
 * What peeks out from behind the pack when a product card opens: the flavour's ingredient
 * on one side (a photo cut-out where we have one, the drawn ingredient where we don't) and a
 * roasted makhana on the other. Kept small and close: a hint, not a scatter.
 * Illustrative only: not an ingredient list.
 *
 * Each piece carries its own spot, because a long chilli and a single seed need different
 * room. x and y are the piece's centre, offset from the pack's centre, and w its width, all
 * in cqw (hundredths of the card's width) so every card size lands them the same; r is its
 * angle. Photos come from scripts/prep-ingredients.mjs.
 */
type Photo = { kind: "photo"; src: string; width: number; height: number };
type Art = { kind: "art"; art: Ingredient };
export type Piece = (Photo | Art) & { x: number; y: number; w: number; r: number };

const photo = (name: string, width: number, height: number): Photo =>
  ({ kind: "photo", src: `/brand/ingredients/${name}.webp`, width, height });
const art = (a: Ingredient): Art => ({ kind: "art", art: a });

const tomatoWedge = photo("tomato-wedge", 560, 373);
const leafSprig = photo("leaf-sprig", 560, 500);
const chilliFresh2 = photo("chilli-fresh-2", 560, 254);
const chilliDriedLong = photo("chilli-dried-long", 560, 168);
const makhana = photo("makhana-2", 360, 319);

/*
 * Two spots, both in front of the pack and overlapping its edge a little: the ingredient on
 * its lower left side, the makhana on its top right corner.
 * The pack, open, is about 61cqw wide and 90cqw tall (sides near ±30, corners near ±45).
 */
const left = { x: -29, y: 22 };
const corner = { x: 31, y: -37 };
const seed: Piece = { ...makhana, ...corner, w: 25, r: 12 };

/** One ingredient and one roasted makhana per flavour. */
export const PIECES: Record<string, [Piece, Piece]> = {
  rasam: [{ ...tomatoWedge, ...left, w: 34, r: -12 }, seed],
  "curry-leaves": [{ ...leafSprig, ...left, w: 33, r: -14 }, seed],
  "thai-chilli": [{ ...chilliFresh2, ...left, w: 36, r: -50 }, seed],
  chettinadu: [{ ...chilliDriedLong, ...left, w: 36, r: -50 }, seed],
  // No photos of these yet: the drawn ingredient.
  "sweet-tamarind": [{ ...art("tamarind"), ...left, w: 31, r: -16 }, seed],
  "mac-cheese": [{ ...art("cheese"), ...left, w: 30, r: -10 }, seed],
  tiramisu: [{ ...art("coffee"), ...left, w: 25, r: -18 }, seed],
};

export const pieces = (id: string): Piece[] => PIECES[id] ?? [seed];
