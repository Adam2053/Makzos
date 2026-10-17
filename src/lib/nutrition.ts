/**
 * What's in a bag. Two sources, kept apart so nobody mistakes one for the other:
 *
 * - `printed`: the front-of-pack panel on the final artwork ("makzos Final Images 2.pdf"),
 *   per 55 g pack. It is the same on all seven packs today.
 * - `pending`: the rest of the panel (protein, carbohydrate, fibre, sodium). These are
 *   SAMPLE values, derived only so the table has its full shape. Replace every one with the
 *   lab-tested panel, per flavour, before launch; the page marks them until then.
 *
 * Per-100 g figures are calculated from the per-pack ones, so they change together.
 */
import { GRAMS } from "./products";

export type NutrientRow = { label: string; perPack: number; unit: "kcal" | "kJ" | "g" | "mg"; sub?: boolean; pending?: boolean };

const PRINTED: NutrientRow[] = [
  { label: "Energy", perPack: 250, unit: "kcal" },
  { label: "Energy", perPack: 1046, unit: "kJ" },
  { label: "Fat", perPack: 15, unit: "g" },
  { label: "of which saturates", perPack: 6, unit: "g", sub: true },
  { label: "Sugars", perPack: 5, unit: "g" },
  { label: "Salt", perPack: 0.2, unit: "g" },
];

const PENDING: NutrientRow[] = [
  { label: "Carbohydrate", perPack: 24, unit: "g", pending: true },
  { label: "Dietary fibre", perPack: 3.8, unit: "g", pending: true },
  { label: "Protein", perPack: 5.1, unit: "g", pending: true },
];

/** In the order a label reads: energy, fat, carbohydrate and sugars, fibre, protein, salt. */
export function nutritionFor(id: string): NutrientRow[] {
  void id; // One panel for the range until each flavour's lab report is in.
  const [kcal, kj, fat, sat, sugar, salt] = PRINTED;
  const [carb, fibre, protein] = PENDING;
  return [kcal, kj, fat, sat, carb, { ...sugar, sub: true, label: "of which sugars" }, fibre, protein, salt];
}

export const per100 = (n: number) => Math.round((n * 100) / GRAMS * 10) / 10;

export const fmtNutrient = (n: number, unit: NutrientRow["unit"]) => `${Number.isInteger(n) ? n : n.toFixed(1)} ${unit}`;

/** The four headline figures from the pack front, for the quick strip at the top of the page. */
export const HEADLINE = [
  { label: "Energy", value: "250 kcal" },
  { label: "Fat", value: "15 g" },
  { label: "Sugars", value: "5 g" },
  { label: "Salt", value: "0.2 g" },
];

/** What a lab report will cover. The report itself is to come; the page says so. */
export const LAB_TESTS = [
  "Nutrition panel, per flavour",
  "Pesticide residue",
  "Heavy metals",
  "Microbial safety",
  "Allergen declaration",
];

/**
 * Reference intakes for an average adult on 2000 kcal a day, the basis most Indian and EU
 * labels use for "% RI". Shown next to each figure so a number has something to be read against.
 */
const RI: Record<string, number> = {
  "Energy kcal": 2000, "Energy kJ": 8400, Fat: 70, "of which saturates": 20, Carbohydrate: 260,
  "of which sugars": 90, "Dietary fibre": 30, Protein: 50, Salt: 6,
};

export const riFor = (r: NutrientRow) => RI[r.label === "Energy" ? `Energy ${r.unit}` : r.label];

export type NutrientGroup = { key: string; main: NutrientRow; parts: NutrientRow[]; note: string };

/**
 * The panel as parts you can open: each headline figure, with what it's made of inside.
 * Sodium isn't printed; it's worked out from salt (1 g salt is 400 mg sodium).
 */
export function nutritionGroups(id: string): NutrientGroup[] {
  const [kcal, kj, fat, sat, carb, sugar, fibre, protein, salt] = nutritionFor(id);
  return [
    { key: "energy", main: kcal, parts: [kj], note: "The same energy in kilojoules, the metric unit some labels use." },
    { key: "fat", main: fat, parts: [sat], note: "Saturates are counted inside the fat total, not on top of it." },
    { key: "carb", main: carb, parts: [sugar, fibre], note: "Sugars and fibre are counted inside the carbohydrate total." },
    { key: "protein", main: protein, parts: [], note: "For the makhana as sold, seasoning included." },
    { key: "salt", main: salt, parts: [{ label: "Sodium", perPack: Math.round(salt.perPack * 400), unit: "mg", sub: true }], note: "Sodium is worked out from salt: salt ÷ 2.5." },
  ];
}
