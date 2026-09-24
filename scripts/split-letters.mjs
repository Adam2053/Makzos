// Cuts the dark wordmark into single glyphs so each can fall on its own.
// Columns sit in the transparent gaps between letters.
import sharp from "sharp";

const SRC = "public/brand/logo-dark.png";
const CUTS = [
  ["m", 0, 225],
  ["a", 225, 395],
  ["k", 395, 568],
  ["z", 568, 742],
  ["o", 742, 988],
  ["s", 988, 1200],
];

for (const [name, from, to] of CUTS) {
  await sharp(SRC).extract({ left: from, top: 0, width: to - from, height: 296 }).png().toFile(`public/brand/letter-${name}.png`);
}
