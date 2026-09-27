// Builds the site icons from the makhana mark: the light "o" on the ink background.
// The full wordmark is unreadable at tab size, so the mark stands in for it.
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const MARK = "public/brand/letter-light-o.png";
const INK = "#0f0e0c";

/** The mark centred on an ink square, filling `fill` of its height, with corners rounded by `radius` of its size. */
async function tile(size, { fill = 0.78, radius = 0.22 } = {}) {
  const h = Math.round(size * fill);
  const mark = await sharp(MARK).trim().resize({ height: h, width: h, fit: "inside" }).toBuffer();
  const r = Math.round(size * radius);
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`);
  return sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: mark, gravity: "centre" }, ...(radius ? [{ input: mask, blend: "dest-in" }] : [])])
    .png()
    .toBuffer();
}

/** An .ico is a small directory of embedded PNGs. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const favicon = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await tile(size, { fill: 0.84 }) })));
await writeFile("src/app/favicon.ico", ico(favicon));
await writeFile("src/app/icon.png", await tile(512));
// iOS rounds the corners itself, so the apple icon stays square.
await writeFile("src/app/apple-icon.png", await tile(180, { radius: 0 }));
