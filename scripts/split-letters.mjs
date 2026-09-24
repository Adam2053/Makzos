// Cuts the dark wordmark into single glyphs so each can fall on its own.
// Columns sit in the transparent gaps between letters.
import sharp from "sharp";

const SOURCES = [
  ["public/brand/logo-dark.png", "letter"],
  ["public/brand/logo-light.png", "letter-light"],
];
const CUTS = [
  ["m", 0, 225],
  ["a", 225, 395],
  ["k", 395, 568],
  ["z", 568, 742],
  ["o", 742, 988],
  ["s", 988, 1200],
];

for (const [src, prefix] of SOURCES) {
  for (const [name, from, to] of CUTS) {
    await sharp(src).extract({ left: from, top: 0, width: to - from, height: 296 }).png().toFile(`public/brand/${prefix}-${name}.png`);
  }
}
