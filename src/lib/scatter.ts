import { FLAVOURS } from "@/lib/flavours";

/**
 * Lays out the things hidden in the dark: a handful of states plus a few makhana doodles,
 * dropped into a jittered grid that keeps clear of the wordmark and leaves gaps between. Seeded, so server and client
 * render the same room, and coloured so no two neighbours share a pack accent.
 */
const NAMES = [
  "Kerala", "Punjab", "Assam", "Goa", "Tamil Nadu", "Maharashtra", "Rajasthan", "West Bengal",
  "Sikkim", "Gujarat", "Odisha", "Karnataka", "Telangana", "Himachal Pradesh", "Meghalaya", "Nagaland",
];
const PUFFS = 6;
/** The grids have 36 cells; whatever the names and doodles don't fill stays dark. */
const CELLS = 36;

/**
 * A layout is grid centres in % of the hidden layer: columns across, rows above and below
 * the name. Edge columns are anchored by their outer end instead, so long names never
 * run off the screen.
 */
type Grid = { xs: number[]; ys: number[]; jx: number; jy: number; stagger: number };
// Bands are sized for 16:9, where the name takes the most height: 3–25% and 68–88% of the screen.
const WIDE: Grid = { xs: [5, 23, 41, 59, 77, 95], ys: [10.5, 16.8, 23, 70.5, 76, 81.5], jx: 4, jy: 0.5, stagger: 1.8 };
const TALL: Grid = {
  xs: [5, 50, 95],
  ys: [7, 13, 19, 25, 31, 37, 56, 61, 66, 71, 76, 81],
  jx: 5,
  jy: 0.6,
  stagger: 1.4,
};

/** Change this to reshuffle the whole room. */
const SEED = 20;

export type Hidden = {
  key: string;
  /** Null for a makhana doodle. */
  name: string | null;
  /** [x %, y %, horizontal anchor %] in each layout. */
  wide: [number, number, number];
  tall: [number, number, number];
  rot: number;
  /** Font size (or doodle width) in units the CSS scales down on small screens. */
  size: number;
  color?: string;
};

function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Item i's cell in the wide grid; the tall grid folds each wide row into two, so neighbours mostly stay neighbours. */
const wideCell = (i: number) => ({ c: i % 6, r: Math.floor(i / 6) });
const tallCell = (i: number) => {
  const { c, r } = wideCell(i);
  return { c: c % 3, r: r * 2 + (c >= 3 ? 1 : 0) };
};
/** Within `reach` steps, counting across empty cells, so names with a gap between still read as neighbours. */
const near = (a: { c: number; r: number }, b: { c: number; r: number }, reach: number) =>
  Math.abs(a.c - b.c) + Math.abs(a.r - b.r) <= reach;
const touching = (i: number, j: number, reach: number) =>
  near(wideCell(i), wideCell(j), reach) || near(tallCell(i), tallCell(j), reach);

function build(seed: number) {
  const rand = mulberry32(seed);
  const between = (lo: number, hi: number) => lo + rand() * (hi - lo);
  const place = (g: Grid, { c, r }: { c: number; r: number }): [number, number, number] => {
    // Alternate columns sit a little high or low, so side-by-side names never share a line.
    const y = g.ys[r] + (c % 2 ? g.stagger : -g.stagger) + between(-g.jy, g.jy);
    if (c === 0) return [g.xs[c] + between(0, g.jx / 2), y, 0];
    if (c === g.xs.length - 1) return [g.xs[c] - between(0, g.jx / 2), y, -100];
    return [g.xs[c] + between(-g.jx, g.jx), y, -50];
  };

  // undefined marks an empty cell.
  const pool: (string | null | undefined)[] = [
    ...NAMES,
    ...Array<null>(PUFFS).fill(null),
    ...Array<undefined>(CELLS - NAMES.length - PUFFS).fill(undefined),
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const items = pool.map((name, i) => ({
    key: name ?? `puff-${i}`,
    name: name ?? null,
    empty: name === undefined,
    color: undefined as string | undefined,
    wide: place(WIDE, wideCell(i)),
    tall: place(TALL, tallCell(i)),
    rot: name ? between(-14, 14) : between(-35, 35),
    size: name ? Math.max(1.1, Math.min(between(1.3, 2.6), 20 / name.length)) : between(3.4, 6),
  }));

  // Backtracking colouring: each state tries the accents in a random order and backs up
  // whenever it has boxed a later state in, so no neighbours in either layout match. Some
  // shuffles can't keep names two cells apart distinct; those settle for adjacent ones.
  const accents = FLAVOURS.map((f) => f.accent);
  const states = items.map((it, i) => (it.name ? i : -1)).filter((i) => i >= 0);
  const orders = states.map(() => [...accents].sort(() => rand() - 0.5));
  const paint = (k: number, reach: number): boolean => {
    if (k === states.length) return true;
    const i = states[k];
    for (const color of orders[k]) {
      if (states.slice(0, k).some((j) => items[j].color === color && touching(i, j, reach))) continue;
      items[i].color = color;
      if (paint(k + 1, reach)) return true;
    }
    items[i].color = undefined;
    return false;
  };
  if (!paint(0, 2)) paint(0, 1);
  return items.filter((it) => !it.empty);
}

export const HIDDEN = build(SEED);
