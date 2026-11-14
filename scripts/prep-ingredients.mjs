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
