import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * Cut-out ingredients, makhana and pack scenes from makzosmockups/ → /public/brand.
 * Every source is already on transparent (or a clean studio sweep); this only trims the
 * empty canvas, caps the size and writes webp. Unzip "rasam ingredients_png.zip" into
 * makzosmockups/ first.
 */
const SRC = path.resolve("makzosmockups");
const ING = path.join(SRC, "rasam ingredients_png");
const OUT = path.resolve("public/brand");

const jobs = [
  // Flavour ingredients, for the product cards' hover.
  [path.join(ING, "Clean tomato wedge cutout-12.png"), "ingredients/tomato-wedge.webp", 560],
  [path.join(ING, "Three-leaf sprig transparent cutout-10.png"), "ingredients/leaf-sprig.webp", 560],
  [path.join(ING, "Delicate two-leaf sprig cutout-2.png"), "ingredients/leaf-pair.webp", 560],
  [path.join(ING, "Untitled design (4).png"), "ingredients/chilli-fresh.webp", 560],
  [path.join(ING, "Untitled design (5).png"), "ingredients/chilli-fresh-2.webp", 560],
  [path.join(ING, "Untitled design.png"), "ingredients/chilli-dried.webp", 400],
  [path.join(ING, "Untitled design (2).png"), "ingredients/chilli-dried-long.webp", 560],
  [path.join(ING, "makhanas_png's/Golden seasoned roasted makhana-1.png"), "ingredients/makhana-1.webp", 360],
  [path.join(ING, "makhanas_png's/Golden seasoned roasted makhana-2.png"), "ingredients/makhana-2.webp", 360],
  [path.join(ING, "makhanas_png's/Seasoned roasted makhana cutout-3.png"), "ingredients/makhana-3.webp", 360],
  // Pack scenes.
  [path.join(SRC, "rasam_popout_makhana.png"), "scenes/rasam-popout.webp", 720],
  [path.join(SRC, "90degreeopen.png"), "scenes/open-bag.webp", 900],
];

for (const [from, to, width] of jobs) {
  const out = path.join(OUT, to);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const trimmed = await sharp(from).trim({ threshold: 0 }).toBuffer();
  const info = await sharp(trimmed).resize({ width, height: width, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(out);
  const { size } = await fs.stat(out);
  console.log(`✓ ${to}  ${info.width}×${info.height}  ${(size / 1024).toFixed(0)} KB`);
}

// The open bag among its ingredients: a photo on a light sweep, kept whole.
{
  const to = "scenes/rasam-open-scene.webp";
  const info = await sharp(path.join(SRC, "PHOTO-2026-11-14-16-59-35.jpg")).webp({ quality: 82 }).toFile(path.join(OUT, to));
  console.log(`✓ ${to}  ${info.width}×${info.height}`);
}

/*
 * The open pack, bursting: the open-mouthed pack from "Untitled design (3).png" with its
 * ingredients and white backdrop taken away, and the makhana cluster turned -90° so it rises
 * out of the mouth up to the right. The pack is split at its front lip: the silver inside of the
 * mouth goes behind the makhana and the red front over them, so they come up out of the opening.
 *
 * The pack is cut on its own outline. The white is flood-filled in from the border (so whites
 * inside the art stay); then everything outside the pack's edges goes too. Where a tomato, a leaf
 * or the chilli touches the pack, its edge is not measured but drawn straight between the clean
 * edges either side.
 */
async function cutOpenPack() {
  const { data, info } = await sharp(path.join(SRC, "Untitled design (3).png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isWhite = (p) => { const i = p * 4; return data[i] >= 250 && data[i + 1] >= 250 && data[i + 2] >= 250; };
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const p = y * w + x; if (bg[p] || !isWhite(p)) return; bg[p] = 1; stack.push(p); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) { const p = stack.pop(), x = p % w, y = (p / w) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  // The pack's side edges, measured on the rows nothing else touches.
  const lerp = (a, b, t) => a + (b - a) * t;
  const L = new Float32Array(h), R = new Float32Array(h);
  const scan = (y, from, step) => { let x = from; while (bg[y * w + x] && x !== 960) x += step; return x; };
  for (let y = 0; y < h; y++) {
    L[y] = y < 260 ? 752 : y <= 730 ? scan(y, 748, 1) : y < 870 ? lerp(767, 751, (y - 730) / 140) : 751;
    R[y] = y < 395 ? lerp(1172, 1153, Math.max(0, y - 255) / 140) : y <= 835 ? scan(y, 1175, -1) : lerp(1167, 1170, (y - 835) / 55);
  }
  // The rim's top: the leaf and the tomato sit beside its two corners.
  const top = (x) => x < 800 ? 248 + (800 - x) * .16 : x > 1150 ? 254 + (x - 1150) * .17 : 226;
  for (let p = 0; p < w * h; p++) {
    const x = p % w, y = (p / w) | 0, i = p * 4;
    if (bg[p] || y > 891 || y < top(x) || x < L[y] || x > R[y]) { data[i + 3] = 0; bg[p] = 1; }
  }
  // Soften the rim against the white it was cut from.
  for (let p = 0; p < w * h; p++) {
    const i = p * 4; if (bg[p]) continue;
    const x = p % w, y = (p / w) | 0;
    const nearBg = bg[p - 1] || bg[p + 1] || bg[p - w] || bg[p + w];
    if (!nearBg) continue;
    const m = Math.min(data[i], data[i + 1], data[i + 2]);
    const a = Math.min(1, Math.max(.35, (255 - m) / 60));
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - 255 * (1 - a)) / a)));
    data[i + 3] = Math.round(a * 255);
  }
  // The front lip: the top of the red band, column by column.
  const isRed = (x, y) => { const i = (y * w + x) * 4; return data[i] > 110 && data[i + 1] < 70 && data[i + 2] < 70 && data[i] - data[i + 1] > 60; };
  const lip = new Int32Array(w).fill(h);
  for (let x = 752; x <= 1172; x++) { let y = 226; while (y < 340 && !isRed(x, y)) y++; lip[x] = y; }
  // The bounding box of what is left, and the back and front halves cut to it.
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let p = 0; p < w * h; p++) if (data[p * 4 + 3]) { const x = p % w, y = (p / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const half = (keep) => { const d = Buffer.from(data); for (let p = 0; p < w * h; p++) { const x = p % w, y = (p / w) | 0; if (!keep(y >= lip[x])) d[p * 4 + 3] = 0; } return sharp(d, { raw: { width: w, height: h, channels: 4 } }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer(); };
  return { back: await half((front) => !front), front: await half((front) => front), width: x1 - x0 + 1, height: y1 - y0 + 1 };
}
{
  const to = "scenes/rasam-burst.webp";
  const pack = await cutOpenPack();
  const pw = pack.width, ph = pack.height;
  // The cluster, turned -90° (anticlockwise) and scaled so a makhana is about a fifth of the pack's width.
  const k = .5;
  const cl = await sharp(path.join(ING, "makhanas_png's/Matte Pouch and Seasoned Snack Cluster.png")).rotate(-90).toBuffer({ resolveWithObject: true });
  const clw = Math.round(cl.info.width * k), clh = Math.round(cl.info.height * k);
  const cluster = await sharp(cl.data).resize(clw, clh).png().toBuffer();
  // Where the cluster sits, in the pack's own pixels: its lowest makhana dipping into the mouth.
  const cx = 55, cy = -165;
  const left = Math.min(0, cx), topY = Math.min(0, cy);
  const W = Math.max(pw, cx + clw) - left, H = Math.max(ph, cy + clh) - topY;
  const info = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: pack.back, left: -left, top: -topY }, { input: cluster, left: cx - left, top: cy - topY }, { input: pack.front, left: -left, top: -topY }])
    .webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, to));
  console.log(`✓ ${to}  ${info.width}×${info.height}  pack ${pw}×${ph} at ${-left},${-topY}`);
}
