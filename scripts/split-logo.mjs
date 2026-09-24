// Cuts the light wordmark into MAKZ | makhana mark | 'S so the launch page can
// reveal the name out of the mark. Columns are the transparent gaps between glyphs.
import sharp from "sharp";

const SRC = "public/brand/logo-light.png";
const CUTS = [
  ["logo-left.png", 0, 742],
  ["logo-mark.png", 742, 988],
  ["logo-right.png", 988, 1200],
];

for (const [name, from, to] of CUTS) {
  await sharp(SRC).extract({ left: from, top: 0, width: to - from, height: 296 }).png().toFile(`public/brand/${name}`);
}

