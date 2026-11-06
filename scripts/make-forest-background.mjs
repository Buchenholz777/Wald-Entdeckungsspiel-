// Erzeugt den Illustrations-Hintergrund "Lichter Waldweg" (eigene Zeichnung, kein Foto) als WebP und JPEG.
// Aufruf: npm run images:forest
// Das Bild ist ein freundliches Stimmungsbild: warmes Licht, sanfte Tiefe, weiche Formen, keine Figuren, keine Schrift.
import sharp from 'sharp';
import { mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../src/assets/forest/', import.meta.url));
mkdirSync(out, { recursive: true });

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const f = (n) => Number(n.toFixed(1));

/** Laubkrone aus überlappenden Kreisen: hell oben links, dunkler unten rechts. */
function crown(cx, cy, r, rnd, tones, count = 16) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.62;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * 0.85;
    const rr = r * (0.28 + rnd() * 0.3);
    const lit = (x - cx) * -0.5 + (y - cy) * -0.9; // links oben heller
    const t = lit > r * 0.12 ? tones[0] : lit < -r * 0.12 ? tones[2] : tones[1];
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${t}"/>`;
  }
  // Lichtflecken
  for (let i = 0; i < Math.round(count / 3); i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.5;
    s += `<circle cx="${f(cx + Math.cos(a) * d - r * 0.1)}" cy="${f(cy + Math.sin(a) * d - r * 0.12)}" r="${f(r * (0.08 + rnd() * 0.08))}" fill="#fff6c8" opacity="0.38"/>`;
  }
  return s;
}

function trunk(x, yTop, yBottom, wTop, wBottom, color, shadeColor, lean = 0) {
  const x2 = x + lean;
  const body = `M${f(x2 - wTop / 2)},${yTop} L${f(x2 + wTop / 2)},${yTop} L${f(x + wBottom / 2)},${yBottom} L${f(x - wBottom / 2)},${yBottom} Z`;
  const shade = `M${f(x2 + wTop * 0.1)},${yTop} L${f(x2 + wTop / 2)},${yTop} L${f(x + wBottom / 2)},${yBottom} L${f(x + wBottom * 0.15)},${yBottom} Z`;
  return `<path d="${body}" fill="${color}"/><path d="${shade}" fill="${shadeColor}" opacity="0.55"/>`;
}

function tuft(x, y, h, rnd, c1, c2) {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const dx = (i - 3) * h * 0.14 + (rnd() - 0.5) * 3;
    const hh = h * (0.55 + rnd() * 0.5);
    const bend = (rnd() - 0.5) * h * 0.4;
    s += `<path d="M${f(x + dx - 2.4)},${f(y)} Q${f(x + dx + bend * 0.4)},${f(y - hh * 0.6)} ${f(x + dx + bend)},${f(y - hh)} Q${f(x + dx + bend * 0.5)},${f(y - hh * 0.5)} ${f(x + dx + 2.4)},${f(y)} Z" fill="${i % 2 ? c1 : c2}"/>`;
  }
  return s;
}

function fern(x, y, s, flip, c1, c2) {
  let g = '';
  for (let i = 0; i < 9; i++) {
    const a = -80 + i * 20;
    g += `<path d="M0,0 Q${f(s * 0.3)},${f(-s * 0.35)} ${f(s * 0.85)},${f(-s * 0.15)} Q${f(s * 0.35)},${f(-s * 0.2)} 0,0Z" fill="${i % 2 ? c1 : c2}" transform="rotate(${a})"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${flip} 1)">${g}</g>`;
}

function flower(x, y, r, petal, centre) {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    s += `<circle cx="${f(x + Math.cos(a) * r)}" cy="${f(y + Math.sin(a) * r)}" r="${f(r * 0.72)}" fill="${petal}"/>`;
  }
  return s + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.62)}" fill="${centre}"/>`;
}

function leaf(x, y, s, rot, c) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})"><path d="M0,-10 C8,-6 8,6 0,12 C-8,6 -8,-6 0,-10Z" fill="${c}"/><path d="M0,-8 L0,10" stroke="#fff" stroke-opacity="0.35" stroke-width="0.9"/></g>`;
}

function mushroom(x, y, s) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><rect x="-3" y="-9" width="6" height="11" rx="3" fill="#f4e8cf"/><path d="M-12,-9 C-12,-22 12,-22 12,-9 C6,-6 -6,-6 -12,-9Z" fill="#c9895a"/><circle cx="-4" cy="-14" r="1.6" fill="#f4e8cf" opacity="0.9"/><circle cx="3" cy="-16" r="1.3" fill="#f4e8cf" opacity="0.9"/></g>`;
}

function scene(w, h, variant) {
  const rnd = rng(variant === 'wide' ? 20261106 : 777);
  const wide = variant === 'wide';
  const horizon = h * (wide ? 0.58 : 0.5);
  const sunX = w * (wide ? 0.62 : 0.6);
  const sunY = h * (wide ? 0.2 : 0.17);
  const T_LIGHT = ['#e3f2a8', '#bfe088', '#8fc25e'];
  const T_MID = ['#cbe8a0', '#a4d27a', '#78b25a'];
  const T_FAR = ['#e6f3cf', '#d3e8b6', '#bcd99b'];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c2"/><stop offset="0.55" stop-color="#fdf6dc"/><stop offset="1" stop-color="#eef6d4"/></linearGradient>
  <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.95"/><stop offset="0.4" stop-color="#fff0b0" stop-opacity="0.55"/><stop offset="1" stop-color="#fff0b0" stop-opacity="0"/></radialGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9e69a"/><stop offset="0.5" stop-color="#a6d078"/><stop offset="1" stop-color="#7fb35e"/></linearGradient>
  <linearGradient id="path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf0cc"/><stop offset="1" stop-color="#ecd49a"/></linearGradient>
  <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.5"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
  <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${wide ? 6 : 4}"/></filter>
  <filter id="soft2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="soft3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${wide ? 14 : 9}"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
<circle cx="${sunX}" cy="${sunY}" r="${f(Math.min(w, h) * 0.34)}" fill="url(#sun)"/>`;

  // ferne Baumreihe
  svg += `<g filter="url(#soft)" opacity="0.9">`;
  const farCount = wide ? 14 : 6;
  for (let i = 0; i < farCount; i++) {
    const cx = (i + 0.5) * (w / farCount) + (rnd() - 0.5) * 40;
    const r = (wide ? 120 : 110) * (0.8 + rnd() * 0.6);
    svg += crown(cx, horizon - r * 0.55, r, rnd, T_FAR, 12);
  }
  svg += `</g>`;

  // Lichtstrahlen
  svg += `<g filter="url(#soft3)">`;
  for (let i = 0; i < 4; i++) {
    const x0 = sunX + (i - 1.5) * (wide ? 70 : 48);
    const x1 = w * (wide ? 0.25 + i * 0.16 : 0.1 + i * 0.26);
    svg += `<polygon points="${f(x0 - 16)},${f(sunY)} ${f(x0 + 16)},${f(sunY)} ${f(x1 + 90)},${f(horizon + h * 0.16)} ${f(x1 - 90)},${f(horizon + h * 0.16)}" fill="url(#ray)" opacity="${f(0.5 - i * 0.07)}"/>`;
  }
  svg += `</g>`;

  // mittlere Baumreihe und dünne Stämme
  svg += `<g filter="url(#soft2)">`;
  const midCount = wide ? 9 : 4;
  for (let i = 0; i < midCount; i++) {
    const cx = (i + 0.5) * (w / midCount) + (rnd() - 0.5) * 70;
    if (Math.abs(cx - w / 2) < w * 0.09) continue; // Lichtung in der Mitte
    const r = (wide ? 150 : 120) * (0.8 + rnd() * 0.5);
    const top = horizon - r * 0.9;
    svg += trunk(cx, top + r * 0.8, horizon + 30, 12, 20, '#b99870', '#8a6a48', (rnd() - 0.5) * 8);
    svg += crown(cx, top, r, rnd, T_MID, 15);
  }
  svg += `</g>`;

  // Boden
  const gy = horizon + 6;
  svg += `<path d="M0,${f(gy)} C${f(w * 0.25)},${f(gy - 24)} ${f(w * 0.7)},${f(gy - 20)} ${w},${f(gy + 6)} L${w},${h} L0,${h} Z" fill="url(#ground)"/>`;

  // Weg: schmal am Horizont, breit unten, sanfte Kurve
  const pTop = w * (wide ? 0.52 : 0.5);
  const pBot = w * (wide ? 0.44 : 0.38);
  const wTop = w * 0.025;
  const wBot = w * (wide ? 0.34 : 0.6);
  svg += `<path d="M${f(pTop - wTop)},${f(gy + 2)} C${f(pTop - wTop * 1.5)},${f(gy + (h - gy) * 0.35)} ${f(pBot - wBot * 0.25)},${f(gy + (h - gy) * 0.6)} ${f(pBot - wBot / 2)},${h + 4} L${f(pBot + wBot / 2)},${h + 4} C${f(pBot + wBot * 0.4)},${f(gy + (h - gy) * 0.6)} ${f(pTop + wTop * 2)},${f(gy + (h - gy) * 0.3)} ${f(pTop + wTop)},${f(gy + 2)} Z" fill="url(#path)"/>`;
  svg += `<path d="M${f(pTop - wTop)},${f(gy + 2)} C${f(pTop - wTop * 1.5)},${f(gy + (h - gy) * 0.35)} ${f(pBot - wBot * 0.25)},${f(gy + (h - gy) * 0.6)} ${f(pBot - wBot / 2)},${h + 4}" fill="none" stroke="#9fc67a" stroke-width="5" stroke-opacity="0.5"/>`;
  // Licht auf dem Weg
  svg += `<ellipse cx="${f(pTop + (pBot - pTop) * 0.6)}" cy="${f(gy + (h - gy) * 0.45)}" rx="${f(wBot * 0.22)}" ry="${f((h - gy) * 0.1)}" fill="#fffbe0" opacity="0.5" filter="url(#soft2)"/>`;

  // große Bäume an den Rändern
  const side = (x, dir, scale) => {
    const tw = 70 * scale;
    let g = trunk(x, gy - h * 0.55, h + 4, tw * 0.75, tw * 1.25, '#a8825a', '#6f4f35', dir * 6);
    g += `<path d="M${f(x - tw * 0.2)},${f(gy - h * 0.2)} q${f(-8 * scale)},${f(-60 * scale)} ${f(-4 * scale)},${f(-140 * scale)}" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="${f(6 * scale)}"/>`;
    g += crown(x + dir * tw * 0.4, gy - h * (wide ? 0.55 : 0.5), (wide ? 300 : 230) * scale, rnd, T_LIGHT, 24);
    g += crown(x - dir * tw * 0.9, gy - h * (wide ? 0.4 : 0.34), (wide ? 190 : 150) * scale, rnd, T_LIGHT, 16);
    return g;
  };
  svg += side(w * (wide ? 0.07 : 0.03), 1, 1);
  svg += side(w * (wide ? 0.95 : 0.99), -1, 0.95);
  if (wide) {
    svg += side(w * 0.2, 1, 0.55);
    svg += side(w * 0.82, -1, 0.5);
  }

  // Vordergrund: Gras, Farn, Blumen, Pilze, Blätter
  const fg = [];
  const nTufts = wide ? 26 : 12;
  for (let i = 0; i < nTufts; i++) {
    const x = rnd() * w;
    const onPath = Math.abs(x - w * 0.46) < wBot * 0.3;
    const y = h * (0.78 + rnd() * 0.22);
    if (onPath && y > h * 0.8) continue;
    fg.push(tuft(x, y, 30 + rnd() * 44, rnd, '#6fae52', '#8ac563'));
  }
  const nFerns = wide ? 7 : 4;
  for (let i = 0; i < nFerns; i++) {
    const side2 = i % 2 ? 1 : -1;
    const x = side2 < 0 ? rnd() * w * 0.22 : w - rnd() * w * 0.22;
    fg.push(fern(x, h * (0.88 + rnd() * 0.1), 80 + rnd() * 50, side2, '#5fa34c', '#7dbb5c'));
  }
  const flowerSpots = wide ? 22 : 12;
  for (let i = 0; i < flowerSpots; i++) {
    const x = rnd() * w;
    const y = h * (0.7 + rnd() * 0.28);
    if (Math.abs(x - w * 0.46) < wBot * 0.25 && y > h * 0.75) continue;
    fg.push(flower(x, y, 3.2 + rnd() * 2.6, i % 3 ? '#fffaf0' : '#ffe27a', '#f0a43c'));
  }
  const leafCols = ['#e9a23b', '#d9703a', '#f1c14b', '#c8553a'];
  const nLeaves = wide ? 16 : 9;
  for (let i = 0; i < nLeaves; i++) fg.push(leaf(rnd() * w, h * (0.84 + rnd() * 0.15), 0.9 + rnd() * 0.7, rnd() * 360, leafCols[i % 4]));
  fg.push(mushroom(w * (wide ? 0.13 : 0.09), h * 0.93, wide ? 1.7 : 1.4));
  fg.push(mushroom(w * (wide ? 0.88 : 0.9), h * 0.95, wide ? 1.4 : 1.2));
  // Eicheln und Zapfen als kleine Waldfunde am Rand
  fg.push(`<g transform="translate(${f(w * (wide ? 0.27 : 0.16))} ${f(h * 0.97)})"><ellipse cx="0" cy="-3" rx="7" ry="9" fill="#c68a4a"/><path d="M-8,-9 C-8,-17 8,-17 8,-9 C4,-6 -4,-6 -8,-9Z" fill="#8a6540"/></g>`);
  svg += fg.join('');

  svg += `</svg>`;
  return svg;
}

const jobs = [
  { name: 'wald-breit-1600', w: 1600, h: 1000, v: 'wide' },
  { name: 'wald-schmal-720', w: 720, h: 900, v: 'narrow' },
];

// altes Foto aus früherer Fassung entfernen
const oldPhoto = fileURLToPath(new URL('../assets-src/todtenrode-wald-original.jpg', import.meta.url));
if (existsSync(oldPhoto)) rmSync(oldPhoto);

for (const j of jobs) {
  const svg = scene(j.w, j.h, j.v);
  const base = sharp(Buffer.from(svg), { density: 72 });
  await base.clone().webp({ quality: 80, effort: 6 }).toFile(`${out}${j.name}.webp`);
  await base.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(`${out}${j.name}.jpg`);
  for (const ext of ['webp', 'jpg']) console.log(`${j.name}.${ext}: ${(statSync(`${out}${j.name}.${ext}`).size / 1024).toFixed(0)} kB`);
}
