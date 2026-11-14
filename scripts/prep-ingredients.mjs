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
 * The open bag among its ingredients (PHOTO-2026-11-14-16-59-35.jpg) comes on a flat #f7f7f7
 * sweep. Knock it out: flood-fill the backdrop in from the border (so light tones inside the
 * artwork stay), then un-mix each rim pixel from the backdrop colour, so the cut-out has no
 * grey halo on the white card.
 */
async function cutBackdrop(from, to, width, bg = [247, 247, 247], tol = 8) {
  const { data, info } = await sharp(from).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const dist = (p) => { const i = p * 4; return Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2])); };
  const out = new Uint8Array(w * h); // 1 = backdrop
  const stack = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const p = y * w + x; if (out[p] || dist(p) > tol) return; out[p] = 1; stack.push(p); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) { const p = stack.pop(), x = p % w, y = (p / w) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    if (out[p]) { data[i + 3] = 0; continue; }
    const x = p % w, y = (p / w) | 0;
    const nearBg = (x > 0 && out[p - 1]) || (x < w - 1 && out[p + 1]) || (y > 0 && out[p - w]) || (y < h - 1 && out[p + w]);
    if (!nearBg) continue;
    // Rim pixel: how far it sits from the backdrop decides its alpha; take the backdrop back out.
    const a = Math.min(1, dist(p) / 60);
    if (a <= 0) { data[i + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - bg[c] * (1 - a)) / a)));
    data[i + 3] = Math.round(a * 255);
  }
  const outPath = path.join(OUT, to);
  const trimmed = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 0 }).png().toBuffer({ resolveWithObject: true });
  const info2 = await sharp(trimmed.data).resize({ width, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(outPath);
  console.log(`✓ ${to}  ${info2.width}×${info2.height}  trimmed at ${-trimmed.info.trimOffsetLeft},${-trimmed.info.trimOffsetTop}`);
}
await cutBackdrop(path.join(SRC, "PHOTO-2026-11-14-16-59-35.jpg"), "scenes/rasam-open-ingredients.webp", 1200);
