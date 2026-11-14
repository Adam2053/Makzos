import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * 3D pack mockups → /public/brand/packs. The renders sit on a transparent
 * 4000×3000 canvas; trim it to the bag and export one webp per flavour.
 * Light (L) renders are used where they exist: brighter label, crisper type.
 * Chettinadu only ships in dark, and (D) reads cleaner than (D.2).
 */
const SRC = path.resolve("makzosmockups");
const OUT = path.resolve("public/brand/packs");
const WIDTH = 960;

const picks = {
  "sweet-tamarind": "001 (L).png",
  rasam: "002 (L).png",
  "curry-leaves": "003 (L).png",
  chettinadu: "004 (D).png",
  "thai-chilli": "005 (L).png",
  tiramisu: "006 (L).png",
  "mac-cheese": "007 (L).png",
};

for (const [id, file] of Object.entries(picks)) {
  const trimmed = await sharp(path.join(SRC, file)).trim({ threshold: 0 }).toBuffer();
  const out = path.join(OUT, `${id}-3d.webp`);
  const info = await sharp(trimmed).resize({ width: WIDTH }).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(out);
  const { size } = await fs.stat(out);
  console.log(`✓ ${id}-3d.webp  ${info.width}×${info.height}  ${(size / 1024).toFixed(0)} KB`);
}
