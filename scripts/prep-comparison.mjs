import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * Pieces of the comparison section lifted out of the design itself, makzosmockups/comparison_v1.png
 * (16337 px wide), so they match it exactly: the five row icons, the white logo, the bullet
 * mark and the two plain "others" packs. Boxes are given on a 1900 px wide copy of the design.
 *
 * - Icons sit on pure black: each pixel is Paprika over black, so its alpha is how much
 *   Paprika it holds.
 * - The logo and bullet are white and black on the card's orange: each pixel is a grey over
 *   that orange, solved for the grey and how much of it there is.
 * - The packs sit on the white and grey checker and the grey card: the background is grown in
 *   from the edges through the flat checker and card colours and the packs' soft shadow, and
 *   cut away. The page adds its own shadow back.
 */
const SRC = path.resolve("makzosmockups/comparison_v1.png");
const OUT = path.resolve("public/brand/compare");
const K = 16337 / 1900;
const ORANGE = [239, 67, 35];
const PAPRIKA = [239, 67, 35];

await fs.mkdir(OUT, { recursive: true });

/** One box of the design, as raw RGB at full resolution. */
const cut = async ([x, y, w, h]) => {
  const { data, info } = await sharp(SRC, { limitInputPixels: false })
    .extract({ left: Math.round(x * K), top: Math.round(y * K), width: Math.round(w * K), height: Math.round(h * K) })
    .raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, ch: info.channels };
};

const save = async (rgba, w, h, file, width) => {
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 }).resize({ width, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, file));
  console.log("wrote", file);
};

/** Paprika over black. */
const icon = async (box, file) => {
  const { data, w, h, ch } = await cut(box);
  const out = Buffer.alloc(w * h * 4);
  const oo = PAPRIKA[0] ** 2 + PAPRIKA[1] ** 2 + PAPRIKA[2] ** 2;
  for (let i = 0; i < w * h; i++) {
    const p = [data[i * ch], data[i * ch + 1], data[i * ch + 2]];
    const a = Math.min(1, Math.max(0, (p[0] * PAPRIKA[0] + p[1] * PAPRIKA[1] + p[2] * PAPRIKA[2]) / oo));
    out.set([...PAPRIKA, Math.round(a * 255)], i * 4);
  }
  await save(out, w, h, file, 160);
};

/** White and black over the card's orange: p = a·g·(1,1,1) + (1 − a)·O, solved for a and g. */
const onOrange = async (box, file, width) => {
  const { data, w, h, ch } = await cut(box);
  const out = Buffer.alloc(w * h * 4);
  const [Or, Og, Ob] = ORANGE;
  // Least squares for [u, a] in  u·(1,1,1) − a·O = p − O,  where u = a·g.
  const s11 = 3, s12 = -(Or + Og + Ob), s22 = Or * Or + Og * Og + Ob * Ob, det = s11 * s22 - s12 * s12;
  for (let i = 0; i < w * h; i++) {
    const q = [data[i * ch] - Or, data[i * ch + 1] - Og, data[i * ch + 2] - Ob];
    const b1 = q[0] + q[1] + q[2], b2 = -(q[0] * Or + q[1] * Og + q[2] * Ob);
    const u = (s22 * b1 - s12 * b2) / det, a = Math.min(1, Math.max(0, (s11 * b2 - s12 * b1) / det));
    const g = a > 0.02 ? Math.min(255, Math.max(0, u / a)) : 0;
    const v = Math.round(g);
    out.set([v, v, v, Math.round(a < 0.04 ? 0 : a * 255)], i * 4);
  }
  await save(out, w, h, file, width);
};

/** The plain packs: grow the background in from the edges and cut it away. */
const packs = async (box, file, inner = []) => {
  const { data, w, h, ch } = await cut(box);
  const lum = (i) => data[i * ch];
  const neutral = (i) => Math.abs(data[i * ch] - data[i * ch + 1]) <= 4 && Math.abs(data[i * ch + 1] - data[i * ch + 2]) <= 4;
  // Flat background: the checker's white and grey, the card's grey and the packs' shadow on it.
  const flat = (i) => neutral(i) && (lum(i) >= 254 || Math.abs(lum(i) - 238) <= 1 || Math.abs(lum(i) - 154) <= 1);
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  // Seeds are the flat colours on the border; from there the background also creeps through
  // the packs' soft shadow, one barely-different neighbour at a time. A pack's edge is a sharp
  // step, so the creep stops there.
  const from = new Int32Array(w * h).fill(-1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i]) continue;
    const j = from[i];
    const smooth = j >= 0 && neutral(i) && lum(i) <= lum(j) && lum(j) - lum(i) <= 2 && lum(i) >= 90;
    if (!flat(i) && !smooth) continue;
    bg[i] = 1;
    const x = i % w, y = (i / w) | 0;
    for (const n of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
      if (n >= 0 && !bg[n]) { from[n] = i; stack.push(n); }
    }
  }
  // A patch of card closed in by the packs (the shaded grey between them), given on the 1900 px
  // copy: flooded on its own through smoothly changing greys, stopping at the packs' white edges.
  for (const [x, y] of inner) {
    const seed = Math.round((y - box[1]) * K) * w + Math.round((x - box[0]) * K);
    const st = [seed];
    bg[seed] = 1;
    while (st.length) {
      const i = st.pop(), px = i % w, py = (i / w) | 0;
      for (const n of [px > 0 ? i - 1 : -1, px < w - 1 ? i + 1 : -1, py > 0 ? i - w : -1, py < h - 1 ? i + w : -1]) {
        if (n < 0 || bg[n] || !neutral(n) || lum(n) < 95 || lum(n) > 165 || Math.abs(lum(n) - lum(i)) > 3) continue;
        bg[n] = 1;
        st.push(n);
      }
    }
  }
  // The card's top edge: a few antialiased rows with background both above and below.
  for (let y = 6; y < h - 6; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!bg[i] && neutral(i) && bg[i - 6 * w] && bg[i + 6 * w]) bg[i] = 2;
  }
  for (let i = 0; i < w * h; i++) if (bg[i] === 2) bg[i] = 1;
  // The bright rim of the card's corner pokes in from the left edge, short and flat: clear the
  // columns from the left until one holds something taller than it (the first pack's tip).
  for (let x = 0; x < w; x++) {
    let run = 0, best = 0;
    for (let y = 0; y < h; y++) { run = bg[y * w + x] ? 0 : run + 1; best = Math.max(best, run); }
    if (best > 60) break;
    for (let y = 0; y < h; y++) bg[y * w + x] = 1;
  }
  // Hairlines and specks the flood stepped round (the antialiased seam where the checker meets
  // the card): anything mostly surrounded by background goes too.
  for (let pass = 0; pass < 6; pass++) {
    const drop = [];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (bg[i]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += bg[i + dy * w + dx];
      if (n >= 5) drop.push(i);
    }
    for (const i of drop) bg[i] = 1;
  }
  // A soft edge: a pixel next to the background keeps half its weight.
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    let a = bg[i] ? 0 : 255;
    if (!bg[i] && ((x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]))) a = 140;
    out.set([data[i * ch], data[i * ch + 1], data[i * ch + 2], a], i * 4);
  }
  await save(out, w, h, file, 900);
};

await icon([1278, 360, 34, 38], "icon-flavours.webp");
await icon([1282, 458, 28, 37], "icon-fibre.webp");
await icon([1280, 548, 32, 38], "icon-enhancer.webp");
await icon([1272, 655, 50, 38], "icon-fillers.webp");
await icon([1277, 760, 38, 40], "icon-impact.webp");
await onOrange([1400, 245, 225, 65], "logo-light.webp", 720);
await onOrange([1405, 362, 48, 46], "mark.webp", 120);
await packs([975, 105, 235, 185], "others-packs.webp", [[1092, 186]]);
