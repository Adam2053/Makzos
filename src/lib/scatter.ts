/**
 * Lays out the things hidden in the dark: a handful of states plus a few makhanas, split
 * evenly above and below the wordmark and spread across the full width. Seeded, so server
 * and client render the same room, and coloured so nearby names never share a pack colour.
 *
 * Positions are % of the hidden layer, which overhangs the viewport by 4% on each side.
 */
const NAMES = [
  "Kerala", "Punjab", "Assam", "Goa", "Tamil Nadu", "Maharashtra", "Rajasthan", "West Bengal",
  "Sikkim", "Gujarat", "Odisha", "Karnataka", "Telangana", "Himachal Pradesh", "Meghalaya", "Nagaland",
];
const PUFFS = 0;

/**
 * Deep shades of the room's own orange, so the names read as one tone pressed into the
 * wall. Shades still differ enough that the nearest-neighbour pass below can keep
 * touching names apart.
 */
const PACK_COLOURS = [
  "#3a130b",
  "#44170d",
  "#4e1a0f",
  "#581e11",
  "#632213",
  "#6e2615",
];

/** Change this to reshuffle the whole room. */
const SEED = 20;

/** Leftmost and rightmost slot. Items anchor by how far across they sit, so nothing runs off either edge. */
const X_MIN = 5;
const X_MAX = 95;

/**
 * Landscape: each band is a row of evenly spaced slots, each dropped onto one of four
 * lines. A slot never shares a line with the two before it, so side-by-side names can't
 * collide, yet the pattern never settles into a staircase. Sized for 16:9, where the
 * wordmark takes the most height.
 */
const WIDE_LINES = { top: [10.5, 15, 19.5, 24], bottom: [70, 74.5, 79, 83.5] };
/** Portrait: rows alternate two items (one each side) and one (near the middle). */
const TALL_ROWS = { top: [7, 12.3, 17.6, 22.9, 28.2, 33.5, 38.8], bottom: [57, 61.3, 65.6, 69.9, 74.2, 78.5, 82.8] };

type Band = keyof typeof WIDE_LINES;

export type Hidden = {
  key: string;
  /** Null for a makhana. */
  name: string | null;
  /** [x %, y %, horizontal anchor %] in each layout. */
  wide: [number, number, number];
  tall: [number, number, number];
  rot: number;
  /** Font size (or makhana width) in units the CSS scales down on small screens. */
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

function build(seed: number): Hidden[] {
  const rand = mulberry32(seed);
  const between = (lo: number, hi: number) => lo + rand() * (hi - lo);
  const shuffle = <T,>(list: T[]) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const clampX = (x: number) => Math.min(X_MAX, Math.max(X_MIN, x));
  const at = (x: number, y: number): [number, number, number] => {
    const cx = clampX(x);
    return [cx, y, -((cx - X_MIN) / (X_MAX - X_MIN)) * 100];
  };

  const wideSlots = (band: Band, order: (string | null)[]) => {
    const lines = WIDE_LINES[band];
    const picked: number[] = [];
    return order.map((name, k) => {
      let free = lines.map((_, i) => i).filter((i) => !picked.slice(-2).includes(i));
      // A makhana is taller than the gap between lines, so it and its neighbour skip one.
      const prev = picked[k - 1];
      if (k > 0 && (name === null || order[k - 1] === null)) {
        const far = free.filter((i) => Math.abs(i - prev) >= 2);
        free = far.length ? far : [free.reduce((a, b) => (Math.abs(b - prev) > Math.abs(a - prev) ? b : a))];
      }
      const line = free[Math.floor(rand() * free.length)];
      picked.push(line);
      const x = X_MIN + (k * (X_MAX - X_MIN)) / (order.length - 1);
      return at(x + between(-2.5, 2.5), lines[line] + between(-0.8, 0.8));
    });
  };

  const tallSlots = (band: Band, count: number) => {
    const slots: [number, number, number][] = [];
    TALL_ROWS[band].forEach((y, row) => {
      const pair = row % 2 === 0;
      const xs = pair ? [between(6, 30), between(70, 94)] : [between(36, 64)];
      for (const x of xs) if (slots.length < count) slots.push(at(x, y + between(-0.8, 0.8)));
    });
    return slots;
  };

  // Half the names and half the makhanas above the wordmark, the rest below.
  const names = shuffle(NAMES);
  const bands: [Band, (string | null)[]][] = [
    ["top", [...names.slice(0, NAMES.length / 2), ...Array<null>(PUFFS / 2).fill(null)]],
    ["bottom", [...names.slice(NAMES.length / 2), ...Array<null>(PUFFS / 2).fill(null)]],
  ];

  const items: Hidden[] = [];
  for (const [band, members] of bands) {
    const wideOrder = shuffle(members);
    const wide = wideSlots(band, wideOrder);
    const tall = tallSlots(band, members.length);
    const tallOrder = shuffle(members.map((_, i) => i));
    wideOrder.forEach((name, i) => {
      items.push({
        key: name ?? `puff-${band}-${i}`,
        name,
        wide: wide[i],
        tall: tall[tallOrder[i]],
        rot: name ? between(-12, 12) : between(-30, 30),
        size: name ? Math.max(1.1, Math.min(between(1.3, 2.3), 18 / name.length)) : between(2.4, 3.4),
      });
    });
  }

  // Colouring by real distance on a typical laptop and phone. Backtracking tries each
  // colour in a random order; if it can't keep every nearby pair apart within a small
  // budget of tries, the radius shrinks and it starts again.
  const states = items.filter((it) => it.name);
  const gap = (a: Hidden, b: Hidden, r: number) =>
    Math.hypot((a.wide[0] - b.wide[0]) * 15.5, (a.wide[1] - b.wide[1]) * 9.7) < 360 * r ||
    Math.hypot((a.tall[0] - b.tall[0]) * 4.2, (a.tall[1] - b.tall[1]) * 9.1) < 140 * r;
  const orders = states.map(() => shuffle(PACK_COLOURS));
  let budget = 0;
  const paint = (k: number, r: number): boolean => {
    if (k === states.length) return true;
    if (--budget < 0) return false;
    for (const color of orders[k]) {
      if (states.slice(0, k).some((o) => o.color === color && gap(states[k], o, r))) continue;
      states[k].color = color;
      if (paint(k + 1, r)) return true;
    }
    states[k].color = undefined;
    return false;
  };
  for (let r = 1; ; r *= 0.85) {
    budget = 2000;
    if (paint(0, r)) break;
  }
  return items;
}

export const HIDDEN = build(SEED);
