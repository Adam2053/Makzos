import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const SRC = "/Users/arpitmarathe/Documents/Mazos/images";
const OUT = "/Users/arpitmarathe/Documents/Mazos/makzos/public/brand";

await fs.mkdir(OUT, { recursive: true });

/**
 * Flood-fill from the image border, knocking out any pixel that reads as
 * "studio backdrop": near-neutral (low chroma) and light. That eats both the
 * flat #F2F2F2 sweep and the soft grey drop shadow, but stops dead at the
 * saturated pack artwork — including the pale cream Mac & Cheese bag.
 */
async function knockout(srcFile, outFile, { chroma = 14, luma = 52, maxWidth = 1400 } = {}) {
  const img = sharp(srcFile).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  const chromaAt = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return Math.max(r, g, b) - Math.min(r, g, b);
  };
  const lumaAt = (i) => data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

  // The mockup backdrop and its drop shadow are perfectly neutral greys; the pack
  // artwork is not. But each pack also carries a desaturated B&W photo panel that
  // bleeds to its own edge, so a plain neutral test leaks straight into the bag.
  // Fix: build a silhouette from the strongly-coloured pixels (zip strip, brand
  // band, flavour art) and fill each column between its topmost and bottommost
  // hit. That envelope covers the whole pack — photo panel included — and is used
  // as a hard barrier the background fill may not cross.
  const solid = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) {
    let top = -1, bottom = -1;
    for (let y = 0; y < h; y++) {
      if (chromaAt((y * w + x) * ch) >= 32) { if (top < 0) top = y; bottom = y; }
    }
    if (top < 0 || bottom - top < 8) continue;
    for (let y = top; y <= bottom; y++) solid[y * w + x] = 1;
  }

  const isBackdrop = (p) => {
    if (solid[p]) return false;
    const i = p * ch;
    return chromaAt(i) < chroma && lumaAt(i) > luma;
  };

  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    if (isBackdrop(p)) stack.push(p);
  };

  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  while (stack.length) {
    const p = stack.pop();
    const x = p % w, y = (p / w) | 0;
    data[p * ch + 3] = 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  // The column-fill envelope overshoots wherever the bag's zip strip and brand
  // band are wider than its middle, trapping a band of backdrop — white on one
  // side, cast shadow on the other — against the bag. Creep inward from the cut
  // edge across any neutral that isn't the bag itself; the bag's own dark or
  // saturated edge stops it, and the depth cap bounds the damage if it doesn't.
  {
    const depth = new Int16Array(w * h).fill(-1);
    let frontier = [];
    for (let p = 0; p < w * h; p++) if (data[p * ch + 3] === 0) { depth[p] = 0; frontier.push(p); }
    for (let d = 1; d <= 90 && frontier.length; d++) {
      const next = [];
      for (const p of frontier) {
        const x = p % w, y = (p / w) | 0;
        for (const q of [x < w - 1 ? p + 1 : -1, x > 0 ? p - 1 : -1, y < h - 1 ? p + w : -1, y > 0 ? p - w : -1]) {
          if (q < 0 || depth[q] >= 0) continue;
          const i = q * ch;
          if (chromaAt(i) < 16 && lumaAt(i) > 88) { depth[q] = d; data[i + 3] = 0; next.push(q); }
          else depth[q] = 32000;
        }
      }
      frontier = next;
    }
  }

  // Feather the cut edge so the pack doesn't sit on the page with a jagged rim.
  // Only edge pixels are softened; interior alpha is left untouched.
  const alpha = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) alpha[p] = data[p * ch + 3];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (!alpha[p]) continue;
      const n = alpha[p - 1] + alpha[p + 1] + alpha[p - w] + alpha[p + w];
      if (n < 1020) data[p * ch + 3] = Math.round((alpha[p] + n / 4) / 2);
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .trim({ threshold: 1 })
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(path.join(OUT, outFile));

  const { size } = await fs.stat(path.join(OUT, outFile));
  console.log(`✓ ${outFile}  ${(size / 1024).toFixed(0)} KB`);
}

async function scene(srcFile, outBase, width = 1800) {
  const base = sharp(srcFile).resize({ width, withoutEnlargement: true });
  await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${outBase}.jpg`));
  await base.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${outBase}.webp`));
  console.log(`✓ ${outBase}.jpg / .webp`);
}

async function logo() {
  const src = path.join(SRC, "Logo final black@4x.png");
  await knockout(src, "logo-dark.png", { chroma: 26, luma: 150, maxWidth: 1200 });

  // Light lockup: invert the ink so the mark reads on the dark page.
  const { data, info } = await sharp(path.join(OUT, "logo-dark.png"))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] === 0) continue;
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "logo-light.png"));
  console.log("✓ logo-light.png");
}

const packs = [
  ["WhatsApp Image 2026-08-18 at 07.03.09.jpeg", "pack-chettinadu.png"],
  ["WhatsApp Image 2026-08-18 at 07.03.10.jpeg", "pack-thai-chilli.png"],
  ["WhatsApp Image 2026-08-18 at 07.03.11.jpeg", "pack-curry-leaves.png"],
  ["WhatsApp Image 2026-08-18 at 07.03.11 (1).jpeg", "pack-mac-cheese.png"],
];

for (const [from, to] of packs) await knockout(path.join(SRC, from), to);

await scene(path.join(SRC, "WhatsApp Image 2026-08-18 at 07.03.10 (2).jpeg"), "scene-chettinadu");
await scene(path.join(SRC, "WhatsApp Image 2026-08-18 at 07.03.10 (1).jpeg"), "scene-thai-chilli");
await scene(path.join(SRC, "WhatsApp Image 2026-08-18 at 07.03.11 (2).jpeg"), "scene-mac-cheese");

await logo();
console.log("\nAssets written to", OUT);
