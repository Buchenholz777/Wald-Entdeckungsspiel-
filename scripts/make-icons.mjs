// Erzeugt die PNG-Icons ohne Abhängigkeiten (Blatt auf waldgrünem Grund).
// Aufruf: npm run icons
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../public/icons/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const BG = [0x23, 0x4c, 0x3a];
const CREAM = [0xfa, 0xf7, 0xef];
const SAGE = [0xa9, 0xd2, 0x8a];
const LEAF = [0x7b, 0xb6, 0x61];
const LEAF_DARK = [0x3b, 0x7a, 0x3a];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const ss = 3;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const [pr, pg, pb, pa] = pixel((x + (sx + 0.5) / ss) / size, (y + (sy + 0.5) / ss) / size);
          r += pr * pa; g += pg * pa; b += pb * pa; a += pa;
        }
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      const n = ss * ss;
      raw[o] = a ? Math.round(r / a) : 0;
      raw[o + 1] = a ? Math.round(g / a) : 0;
      raw[o + 2] = a ? Math.round(b / a) : 0;
      raw[o + 3] = Math.round((a / n) * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// Blattform: Schnittmenge zweier Kreise (Linse), um 38° gedreht.
function leafPixel(u, v, scale) {
  const x = (u - 0.5) / scale;
  const y = (v - 0.5) / scale;
  const ang = (38 * Math.PI) / 180;
  const lx = x * Math.cos(ang) + y * Math.sin(ang);
  const ly = -x * Math.sin(ang) + y * Math.cos(ang);
  const R = 0.42;
  const d = 0.27;
  const inLens = (lx + d) ** 2 + ly ** 2 < R ** 2 && (lx - d) ** 2 + ly ** 2 < R ** 2 && Math.abs(lx) < 0.28;
  if (!inLens) return null;
  const rib = Math.abs(ly) < 0.012 && Math.abs(lx) < 0.26;
  const vein = Math.abs(Math.abs(ly) - Math.abs(lx) * 0.55 - 0.02) < 0.01 && Math.abs(lx) < 0.2 && Math.abs(lx) > 0.02;
  if (rib || vein) return [...SAGE, 1];
  return lx < 0 ? [...LEAF, 1] : [...LEAF_DARK, 1];
}

function icon(size, { maskable = false } = {}) {
  const radius = maskable ? 0 : 0.22;
  const scale = maskable ? 0.62 : 0.8;
  return png(size, (u, v) => {
    // Rundung der Ecken (nur nicht maskable)
    if (radius > 0) {
      const cx = Math.min(u, 1 - u);
      const cy = Math.min(v, 1 - v);
      if (cx < radius && cy < radius && (radius - cx) ** 2 + (radius - cy) ** 2 > radius ** 2) return [0, 0, 0, 0];
    }
    // Sonne links oben
    const sun = (u - 0.24) ** 2 + (v - 0.24) ** 2 < 0.07 ** 2 * (maskable ? 1.1 : 1);
    if (sun) return [...CREAM, 1];
    const l = leafPixel(u, v, scale);
    if (l) return l;
    return [...BG, 1];
  });
}

writeFileSync(outDir + 'icon-192.png', icon(192));
writeFileSync(outDir + 'icon-512.png', icon(512));
writeFileSync(outDir + 'icon-maskable-512.png', icon(512, { maskable: true }));
console.log('Icons geschrieben nach', outDir);
