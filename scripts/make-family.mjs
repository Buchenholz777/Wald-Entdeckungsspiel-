// Erzeugt die eigens gezeichnete Familien-Illustration (Vater, Mutter, kleiner Junge auf einem Waldweg) als WebP und JPEG.
// Aufruf: npm run images:family
// Das Bild ist eine eigenständige, fiktive Zeichnung aus Code (SVG) und stellt keine reale Person dar. Es enthält keine Schrift.
// Zwei Zuschnitte: "breit" (Desktop und Tablet, die Figuren sitzen rechts in der Hero-Karte) und "schmal" (Smartphone, eigener, näherer Ausschnitt).
import sharp from 'sharp';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../src/assets/familie/', import.meta.url));
mkdirSync(out, { recursive: true });

const f = (n) => Number(n.toFixed(1));
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ Hilfen ------------------------------------------------------------------ */

const SKIN = { father: ['#eab995', '#d49a76'], mother: ['#f0c4a4', '#d9a481'], boy: ['#f6cdb0', '#e0a98a'] };

/** Gesicht: Augen, Brauen, Nase, Mund, Wangen. look = Blickrichtung (zum Fund am Boden). */
function eyes({ y, dx, rw, rh, iris, brow, lookX, lookY, lash = false, browLift = 0, browW = 2.2, size = 1 }) {
  let s = '';
  for (const side of [-1, 1]) {
    const cx = side * dx;
    s += `<ellipse cx="${f(cx)}" cy="${f(y)}" rx="${f(rw)}" ry="${f(rh)}" fill="#fffdf8"/>`;
    s += `<circle cx="${f(cx + lookX * (side === -1 ? 1 : 1))}" cy="${f(y + lookY)}" r="${f(rh * 0.95)}" fill="${iris}"/>`;
    s += `<circle cx="${f(cx + lookX)}" cy="${f(y + lookY)}" r="${f(rh * 0.5)}" fill="#1f1a18"/>`;
    s += `<circle cx="${f(cx + lookX - rh * 0.3)}" cy="${f(y + lookY - rh * 0.35)}" r="${f(rh * 0.28)}" fill="#fff"/>`;
    // Oberlid
    s += `<path d="M${f(cx - rw - 0.6)},${f(y + 0.4)} Q${f(cx)},${f(y - rh * 1.55)} ${f(cx + rw + 0.6)},${f(y + 0.4)}" fill="none" stroke="${lash ? '#2a1f1a' : '#4a352a'}" stroke-width="${lash ? 1.9 : 1.5}" stroke-linecap="round"/>`;
    // Braue
    const by = y - rh * 2.5 - browLift;
    s += `<path d="M${f(cx - rw * 1.1)},${f(by + 1.2)} Q${f(cx)},${f(by - 1.6)} ${f(cx + rw * 1.15)},${f(by + (side === 1 ? 0.6 : 0.6))}" fill="none" stroke="${brow}" stroke-width="${browW * size}" stroke-linecap="round"/>`;
  }
  return s;
}

function nose(y, w, shade) {
  return `<path d="M${f(-w * 0.6)},${f(y)} Q${f(-w)},${f(y + w * 0.9)} ${f(-w * 0.3)},${f(y + w * 1.05)} Q0,${f(y + w * 1.25)} ${f(w * 0.3)},${f(y + w * 1.05)} Q${f(w)},${f(y + w * 0.9)} ${f(w * 0.6)},${f(y)}" fill="none" stroke="${shade}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function smile(y, w, color, open = false) {
  if (open) return `<path d="M${f(-w)},${f(y)} Q0,${f(y + w * 1.15)} ${f(w)},${f(y)} Q0,${f(y + w * 0.3)} ${f(-w)},${f(y)} Z" fill="#a8483f"/><path d="M${f(-w * 0.62)},${f(y + 0.6)} Q0,${f(y + w * 0.45)} ${f(w * 0.62)},${f(y + 0.6)}" stroke="#fffdf8" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  return `<path d="M${f(-w)},${f(y)} Q0,${f(y + w * 0.95)} ${f(w)},${f(y)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
}

/** Gliedmaßen als dicke runde Linien (Ärmel, Hosenbeine). */
function limb(pts, w, color, hi) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ');
  let s = `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (hi) s += `<path d="${d}" fill="none" stroke="${hi}" stroke-width="${f(w * 0.28)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" transform="translate(${f(-w * 0.2)} ${f(-w * 0.12)})"/>`;
  return s;
}

/** Arm von der Schulter zur Zielhand mit leicht abgeknicktem Ellbogen; die Hand zeigt mit dem Zeigefinger in Armrichtung. */
function pointingArm(sx, sy, tx0, ty0, bend, w, color, hi, skin, r, reach) {
  // Der Arm hat eine natürliche Länge: Er zeigt in Richtung des Fundes, muss ihn aber nicht berühren (der Fund liegt weiter vorn).
  const vx = tx0 - sx;
  const vy = ty0 - sy;
  const vl = Math.hypot(vx, vy) || 1;
  const m = Math.min(1, reach / vl);
  const tx = sx + vx * m;
  const ty = sy + vy * m;
  const ex = (sx + tx) / 2 + bend;
  const ey = (sy + ty) / 2 - 8;
  const dx = tx - ex;
  const dy = ty - ey;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // der Ärmel endet kurz vor der Hand
  let s = limb([[sx, sy], [ex, ey], [tx - ux * r * 1.1, ty - uy * r * 1.1]], w, color, hi);
  s += `<path d="M${f(tx)},${f(ty)} L${f(tx + ux * r * 1.9)},${f(ty + uy * r * 1.9)}" stroke="${skin}" stroke-width="${f(r * 0.5)}" stroke-linecap="round"/>`;
  s += `<circle cx="${f(tx)}" cy="${f(ty)}" r="${f(r)}" fill="${skin}"/>`;
  return s;
}

function hand(x, y, r, skin, point = null) {
  let s = '';
  if (point) {
    s += `<path d="M${f(x)},${f(y)} L${f(x + point[0])},${f(y + point[1])}" stroke="${skin}" stroke-width="${f(r * 0.55)}" stroke-linecap="round"/>`;
  }
  s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${skin}"/>`;
  return s;
}

/* ------------------------------------------------------------------ Figuren ------------------------------------------------------------------ */
// Alle Figuren sind in einem eigenen Koordinatensystem gezeichnet: Füße bei (0, 0), Körper nach oben (negative y).

function father(pointTo) {
  const [skin, skinD] = SKIN.father;
  const jacket = '#8fa57d';
  const jacketD = '#74896a';
  const jacketL = '#b3c5a0';
  const tee = '#f2ead6';
  const trou = '#3b4452';
  const boot = '#6a4a32';
  const [px, py] = pointTo; // Zielpunkt der zeigenden Hand
  let s = '';
  // Beine: leicht auseinander, schlanke dunkle Hose
  s += limb([[-13, -190], [-15, -96], [-17, -14]], 26, trou, '#59657a');
  s += limb([[13, -190], [15, -96], [17, -14]], 26, trou, '#59657a');
  s += `<path d="M-30,-6 Q-30,-22 -14,-22 Q-3,-22 -3,-8 Q-3,2 -14,3 L-32,3 Q-32,-2 -30,-6Z" fill="${boot}"/>`;
  s += `<path d="M30,-6 Q30,-22 14,-22 Q3,-22 3,-8 Q3,2 14,3 L32,3 Q32,-2 30,-6Z" fill="${boot}"/>`;
  s += `<path d="M-30,-1 L-3,-1 M3,-1 L30,-1" stroke="#3a281a" stroke-width="2.4" stroke-linecap="round"/>`;
  // T-Shirt und Overshirt (offen)
  s += `<path d="M-34,-296 Q0,-284 34,-296 L38,-186 Q0,-176 -38,-186 Z" fill="${tee}"/>`;
  s += `<path d="M-46,-292 Q-40,-304 -14,-304 L-6,-262 L-12,-176 L-44,-176 Q-52,-236 -46,-292 Z" fill="${jacket}"/>`;
  s += `<path d="M46,-292 Q40,-304 14,-304 L6,-262 L12,-176 L44,-176 Q52,-236 46,-292 Z" fill="${jacket}"/>`;
  s += `<path d="M-46,-292 Q-52,-236 -44,-176 L-34,-176 Q-42,-236 -40,-290Z" fill="${jacketD}" opacity="0.55"/>`;
  s += `<path d="M-14,-304 L-6,-262 L-18,-296Z M14,-304 L6,-262 L18,-296Z" fill="${jacketL}"/>`;
  s += `<rect x="-39" y="-224" width="22" height="20" rx="3" fill="none" stroke="${jacketD}" stroke-width="1.8"/><rect x="17" y="-224" width="22" height="20" rx="3" fill="none" stroke="${jacketD}" stroke-width="1.8"/>`;
  s += `<path d="M-36,-176 L-12,-176 M12,-176 L36,-176" stroke="${jacketD}" stroke-width="3" stroke-linecap="round"/>`;
  // Gürtel-Andeutung
  // rechter Arm (Bildseite rechts): locker nach unten
  s += limb([[44, -288], [56, -230], [52, -176]], 21, jacket, jacketL);
  s += hand(52, -166, 9.5, skin);
  // zeigender Arm (Bildseite links): von der Schulter zum Fund am Boden
  s += pointingArm(-44, -288, px, py, -22, 21, jacket, jacketL, skin, 9.5, 168);
  // Hals
  s += `<path d="M-10,-322 L-10,-300 Q0,-292 10,-300 L10,-322Z" fill="${skinD}"/>`;
  // Kopf
  s += head_father(skin, skinD);
  return s;
}

function head_father(skin, skinD) {
  const hairDark = '#4c3526';
  const hair = '#6e4a30';
  const hairL = '#8c6340';
  const beard = '#5a3b27';
  let s = `<g transform="translate(0 -352) scale(1.15)">`;
  // Ohren
  s += `<ellipse cx="-27.5" cy="2" rx="4.4" ry="7" fill="${skin}"/><ellipse cx="27.5" cy="2" rx="4.4" ry="7" fill="${skin}"/>`;
  // Seiten des Haares (Undercut): kurz, dunkler, eng am Kopf
  s += `<path d="M-27,-4 C-33,-22 -30,-38 -14,-44 L14,-44 C30,-38 33,-22 27,-4 C25,-14 24,-22 20,-28 L-20,-28 C-24,-22 -25,-14 -27,-4Z" fill="${hairDark}"/>`;
  // Gesicht
  s += `<path d="M-26,-16 C-28,4 -22,28 0,33 C22,28 28,4 26,-16 C24,-30 14,-36 0,-36 C-14,-36 -24,-30 -26,-16Z" fill="${skin}"/>`;
  // Schatten unter dem Deckhaar
  s += `<path d="M-24,-18 C-14,-24 14,-24 24,-18 C16,-16 -16,-16 -24,-18Z" fill="${skinD}" opacity="0.4"/>`;
  // längeres Deckhaar: nach hinten gekämmt, mit Volumen
  s += `<path d="M-25,-20 C-31,-46 -14,-58 4,-56 C22,-56 33,-44 26,-20 C23,-30 18,-34 12,-37 C2,-34 -10,-34 -17,-31 C-21,-28 -24,-24 -25,-20Z" fill="${hair}"/>`;
  s += `<path d="M-20,-40 C-10,-52 8,-54 20,-44" fill="none" stroke="${hairL}" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M-14,-34 C-6,-46 6,-48 16,-40" fill="none" stroke="${hairL}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>`;
  // Gesichtsausdruck
  s += eyes({ y: -6, dx: 11.5, rw: 6, rh: 4.1, iris: '#3d9a98', brow: '#4c3526', lookX: 0.8, lookY: 1.2, browW: 2.6 });
  s += nose(2, 4.6, '#b9805f');
  // voller, gepflegter Bart: von den Koteletten um das Kinn, mit Oberlippenbart
  s += `<path d="M-26,-6 C-30,16 -22,36 0,42 C22,36 30,16 26,-6 C24,6 20,12 14,15 C8,11 4,11 0,12 C-4,11 -8,11 -14,15 C-20,12 -24,6 -26,-6Z" fill="${beard}"/>`;
  s += `<path d="M-20,22 C-12,30 12,30 20,22" fill="none" stroke="#7a5238" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`;
  s += `<path d="M-13,14 C-6,9 6,9 13,14 C8,13 4,12 0,13 C-4,12 -8,13 -13,14Z" fill="#6b4630"/>`;
  s += `<path d="M-6,19 Q0,24 6,19 Q0,21.5 -6,19Z" fill="#c98a76"/>`;
  s += `<path d="M-6,19 Q0,23.5 6,19" fill="none" stroke="#a65a4b" stroke-width="1.4" stroke-linecap="round"/>`;
  s += `</g>`;
  return s;
}

function mother(pointTo) {
  const [skin, skinD] = SKIN.mother;
  const jacket = '#c4694a';
  const jacketD = '#a5543a';
  const jacketL = '#df8d70';
  const top = '#f4ead2';
  const jeans = '#4a5e78';
  const boot = '#a8794a';
  const [px, py] = pointTo;
  let s = '';
  // lange Haare hinten
  s += `<path d="M-30,-338 C-44,-300 -44,-252 -34,-214 L34,-214 C44,-252 44,-300 30,-338 Z" fill="#5f3d27"/>`;
  s += `<path d="M-30,-330 C-40,-296 -40,-256 -32,-222" fill="none" stroke="#8a5b38" stroke-width="3" opacity="0.6" stroke-linecap="round"/>`;
  // Beine
  s += limb([[-12, -176], [-14, -92], [-15, -14]], 23, jeans, '#6a82a0');
  s += limb([[12, -176], [14, -92], [15, -14]], 23, jeans, '#6a82a0');
  s += `<path d="M-27,-6 Q-27,-20 -13,-20 Q-3,-20 -3,-8 Q-3,2 -13,3 L-29,3 Q-29,-2 -27,-6Z" fill="${boot}"/>`;
  s += `<path d="M27,-6 Q27,-20 13,-20 Q3,-20 3,-8 Q3,2 13,3 L29,3 Q29,-2 27,-6Z" fill="${boot}"/>`;
  // Oberteil und Jacke
  s += `<path d="M-30,-284 Q0,-274 30,-284 L34,-176 Q0,-166 -34,-176 Z" fill="${top}"/>`;
  s += `<path d="M-40,-282 Q-34,-294 -12,-294 L-5,-252 L-10,-160 L-38,-160 Q-46,-224 -40,-282 Z" fill="${jacket}"/>`;
  s += `<path d="M40,-282 Q34,-294 12,-294 L5,-252 L10,-160 L38,-160 Q46,-224 40,-282 Z" fill="${jacket}"/>`;
  s += `<path d="M-40,-282 Q-46,-224 -38,-160 L-30,-160 Q-36,-224 -34,-280Z" fill="${jacketD}" opacity="0.55"/>`;
  s += `<path d="M-12,-294 L-5,-252 L-16,-286Z M12,-294 L5,-252 L16,-286Z" fill="${jacketL}"/>`;
  // zeigender Arm (Bildseite links, zum Moos)
  s += pointingArm(-38, -278, px, py, -18, 19, jacket, jacketL, skin, 8.6, 158);
  // äußerer Arm
  s += limb([[38, -278], [50, -222], [46, -168]], 19, jacket, jacketL);
  s += hand(46, -158, 8.6, skin);
  // Hals
  s += `<path d="M-9,-312 L-9,-290 Q0,-282 9,-290 L9,-312Z" fill="${skinD}"/>`;
  s += head_mother(skin, skinD);
  return s;
}

function head_mother(skin, skinD) {
  const hair = '#6a4429';
  const hairL = '#946238';
  let s = `<g transform="translate(0 -342) scale(1.12)">`;
  // Haare, die vorn über die Schultern fallen
  s += `<path d="M-27,-6 C-36,22 -36,56 -28,92 L-14,92 C-18,52 -20,20 -24,2Z" fill="${hair}"/>`;
  s += `<path d="M27,-6 C36,22 36,56 28,92 L14,92 C18,52 20,20 24,2Z" fill="${hair}"/>`;
  s += `<ellipse cx="-26" cy="2" rx="3.6" ry="6" fill="${skin}"/><ellipse cx="26" cy="2" rx="3.6" ry="6" fill="${skin}"/>`;
  s += `<path d="M-24,-14 C-27,6 -20,27 0,32 C20,27 27,6 24,-14 C22,-28 12,-34 0,-34 C-12,-34 -22,-28 -24,-14Z" fill="${skin}"/>`;
  // Haaransatz mit Seitenscheitel
  s += `<path d="M-26,0 C-34,-30 -20,-48 2,-48 C24,-48 34,-30 26,0 C24,-16 18,-26 8,-30 C2,-24 -10,-22 -26,0Z" fill="${hair}"/>`;
  s += `<path d="M-14,-38 C-4,-47 14,-46 22,-36" fill="none" stroke="${hairL}" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M-23,-6 C-18,-18 -8,-24 6,-30" fill="none" stroke="${hairL}" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>`;
  // Gesicht
  s += eyes({ y: -5, dx: 10.5, rw: 5.4, rh: 3.9, iris: '#6b4020', brow: '#4a2f1e', lookX: -0.8, lookY: 1.2, lash: true, browW: 2 });
  s += nose(2, 4, '#c58d6c');
  s += `<ellipse cx="-14" cy="9" rx="5" ry="3" fill="#e8928a" opacity="0.35"/><ellipse cx="14" cy="9" rx="5" ry="3" fill="#e8928a" opacity="0.35"/>`;
  s += smile(16, 7.2, '#b04e48', true);
  s += `</g>`;
  return s;
}

function boy(pointTo) {
  const [skin, skinD] = SKIN.boy;
  const jacket = '#e3ac3a';
  const jacketD = '#c28c22';
  const jacketL = '#f4cd6a';
  const trou = '#3f5b8a';
  const boot = '#4d7a4a';
  const [px, py] = pointTo;
  let s = '';
  // kurze, rundliche Beine (Kleinkindproportionen)
  s += limb([[-9, -72], [-10, -38], [-11, -12]], 19, trou, '#6283b4');
  s += limb([[9, -72], [10, -38], [11, -12]], 19, trou, '#6283b4');
  s += `<path d="M-21,-4 Q-21,-17 -10,-17 Q0,-17 0,-7 Q0,2 -10,3 L-22,3 Q-23,-1 -21,-4Z" fill="${boot}"/>`;
  s += `<path d="M21,-4 Q21,-17 10,-17 Q0,-17 0,-7 Q0,2 10,3 L22,3 Q23,-1 21,-4Z" fill="${boot}"/>`;
  // runder Körper in der ockergelben Jacke mit Reißverschluss
  s += `<path d="M-28,-64 Q-31,-110 -18,-122 L18,-122 Q31,-110 28,-64 Q0,-55 -28,-64Z" fill="${jacket}"/>`;
  s += `<path d="M-28,-64 Q-31,-110 -18,-122 L-12,-122 Q-25,-110 -22,-62Z" fill="${jacketD}" opacity="0.5"/>`;
  s += `<path d="M0,-120 L0,-58" stroke="${jacketD}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<rect x="-18" y="-96" width="12" height="11" rx="3" fill="none" stroke="${jacketD}" stroke-width="1.5"/><rect x="6" y="-96" width="12" height="11" rx="3" fill="none" stroke="${jacketD}" stroke-width="1.5"/>`;
  // linker Arm hängt locker, rechter Arm zeigt zum Moos
  s += limb([[-25, -112], [-32, -96], [-33, -82]], 14, jacket, jacketL);
  s += hand(-33, -74, 6.6, skin);
  s += pointingArm(25, -112, px, py, 3, 14, jacket, jacketL, skin, 6.6, 70);
  // Hals
  s += `<path d="M-7,-132 L-7,-120 Q0,-114 7,-120 L7,-132Z" fill="${skinD}"/>`;
  s += head_boy(skin, skinD, jacket, jacketD);
  return s;
}
function head_boy(skin, skinD, jacket, jacketD) {
  const hair = '#b38a50';
  const hairD = '#8f6c3a';
  let s = `<g transform="translate(0 -163) scale(0.88)">`;
  // Kragen der Jacke hinter dem Kopf
  s += `<path d="M-20,28 Q0,40 20,28 L18,36 Q0,46 -18,36Z" fill="${jacketD}" opacity="0"/>`;
  s += `<ellipse cx="-30" cy="4" rx="5.4" ry="8" fill="${skin}"/><ellipse cx="30" cy="4" rx="5.4" ry="8" fill="${skin}"/>`;
  // Undercut: kurze Seiten, dunkler
  s += `<path d="M-30,-2 C-36,-26 -26,-40 -10,-44 L10,-44 C26,-40 36,-26 30,-2 C28,-14 26,-24 22,-28 L-22,-28 C-26,-24 -28,-14 -30,-2Z" fill="${hairD}" opacity="0.85"/>`;
  // rundes Kleinkindgesicht
  s += `<path d="M-30,-8 C-33,14 -22,36 0,38 C22,36 33,14 30,-8 C28,-26 16,-36 0,-36 C-16,-36 -28,-26 -30,-8Z" fill="${skin}"/>`;
  // Deckhaar: kleiner Schopf mit ein paar Strähnen
  s += `<path d="M-27,-14 C-32,-34 -14,-48 4,-46 C22,-46 32,-34 27,-14 C24,-26 18,-30 12,-32 C4,-28 -8,-28 -16,-26 C-22,-24 -26,-20 -27,-14Z" fill="${hair}"/>`;
  s += `<path d="M-12,-40 C-4,-46 8,-46 16,-40" fill="none" stroke="#d3ad70" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`;
  s += `<path d="M2,-47 C4,-52 8,-52 9,-47" fill="none" stroke="${hair}" stroke-width="2.4" stroke-linecap="round"/>`;
  // große blaue Augen, Blick nach unten zum Fund
  s += eyes({ y: -2, dx: 12, rw: 6.4, rh: 5, iris: '#4f8fd0', brow: '#8f6c3a', lookX: 0.6, lookY: 1.6, lash: true, browLift: 1, browW: 1.8 });
  s += nose(6, 3.2, '#d09a7c');
  s += `<ellipse cx="-20" cy="13" rx="6" ry="4" fill="#ee8f8a" opacity="0.45"/><ellipse cx="20" cy="13" rx="6" ry="4" fill="#ee8f8a" opacity="0.45"/>`;
  s += smile(18, 5.6, '#b04e48', true);
  s += `</g>`;
  return s;
}

/* ------------------------------------------------------------------ Szene ------------------------------------------------------------------ */

function crown(cx, cy, r, rnd, tones, count = 16) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.62;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * 0.85;
    const rr = r * (0.28 + rnd() * 0.3);
    const lit = (x - cx) * -0.5 + (y - cy) * -0.9;
    const t = lit > r * 0.12 ? tones[0] : lit < -r * 0.12 ? tones[2] : tones[1];
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${t}"/>`;
  }
  for (let i = 0; i < Math.round(count / 3); i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.5;
    s += `<circle cx="${f(cx + Math.cos(a) * d - r * 0.1)}" cy="${f(cy + Math.sin(a) * d - r * 0.12)}" r="${f(r * (0.08 + rnd() * 0.08))}" fill="#fff6c8" opacity="0.38"/>`;
  }
  return s;
}

function trunk(x, yTop, yBottom, wTop, wBottom, color, shadeColor, lean = 0) {
  const x2 = x + lean;
  return `<path d="M${f(x2 - wTop / 2)},${yTop} L${f(x2 + wTop / 2)},${yTop} L${f(x + wBottom / 2)},${yBottom} L${f(x - wBottom / 2)},${yBottom} Z" fill="${color}"/><path d="M${f(x2 + wTop * 0.1)},${yTop} L${f(x2 + wTop / 2)},${yTop} L${f(x + wBottom / 2)},${yBottom} L${f(x + wBottom * 0.15)},${yBottom} Z" fill="${shadeColor}" opacity="0.55"/>`;
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

/** Moospolster mit Zapfen: das, worauf alle zeigen. */
function mossPatch(x, y, k) {
  const rnd = rng(77);
  let s = `<g transform="translate(${f(x)} ${f(y)}) scale(${k})">`;
  s += `<ellipse cx="0" cy="8" rx="78" ry="17" fill="#2a4a22" opacity="0.28"/>`;
  s += `<path d="M-72,6 C-74,-16 -48,-30 -18,-26 C2,-34 40,-32 58,-18 C78,-8 78,8 62,14 C30,22 -40,22 -72,6Z" fill="#5f9a3e"/>`;
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd());
    const px = Math.cos(a) * 66 * d;
    const py = Math.sin(a) * 15 * d - 8;
    s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(3 + rnd() * 5)}" fill="${['#7cb552', '#69a447', '#8cc45f', '#548d37'][i % 4]}"/>`;
  }
  // Sporenkapseln
  for (let i = 0; i < 6; i++) {
    const px = -40 + i * 16 + rnd() * 6;
    s += `<path d="M${f(px)},-16 q2,-12 6,-17" stroke="#b7a05a" stroke-width="1.4" fill="none"/><ellipse cx="${f(px + 6)}" cy="-34" rx="2" ry="3.2" fill="#a46c3a"/>`;
  }
  return `${s}</g>`;
}

/** Ein einzelner Kiefernzapfen auf dem Boden. */
function coneItem(x, y, k) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) scale(${k})">`;
  s += `<ellipse cx="2" cy="22" rx="34" ry="7" fill="#2a4a22" opacity="0.28"/>`;
  s += `<g transform="translate(0 -4) rotate(-72)">`;
  s += `<ellipse cx="0" cy="-2" rx="15" ry="30" fill="#7a4e2c"/>`;
  for (let r = 0; r < 7; r++) {
    for (let c = -2; c <= 2; c++) {
      const cx = c * 6.2 + (r % 2 ? 3 : 0);
      const cy = -26 + r * 8;
      if (Math.abs(cx) > 12) continue;
      s += `<path d="M${f(cx - 4)},${f(cy)} Q${f(cx)},${f(cy + 7)} ${f(cx + 4)},${f(cy)} L${f(cx + 4)},${f(cy - 2)} L${f(cx - 4)},${f(cy - 2)}Z" fill="${(r + c) % 2 ? '#a06a3a' : '#8c5a30'}" stroke="#4a2e18" stroke-width="0.8"/>`;
    }
  }
  s += `<path d="M-6,-24 C-10,-8 -8,10 -4,22" stroke="#d09a60" stroke-width="2" fill="none" opacity="0.5"/>`;
  s += `</g></g>`;
  return s;
}

/**
 * Waldszene mit der Familie.
 *  variant "breit": Figuren rechts, links bleibt Luft (die Hero-Karte legt dort Wortmarke und Text);
 *  variant "schmal": näherer Ausschnitt für Smartphones, die drei Figuren füllen die Breite.
 */
function scene(w, h, variant) {
  const rnd = rng(variant === 'breit' ? 20261107 : 4242);
  const wide = variant === 'breit';
  const horizon = h * (wide ? 0.5 : 0.42);
  const sunX = w * (wide ? 0.5 : 0.62);
  const sunY = h * (wide ? 0.2 : 0.16);
  const T_LIGHT = ['#e3f2a8', '#bfe088', '#8fc25e'];
  const T_MID = ['#cbe8a0', '#a4d27a', '#78b25a'];
  const T_FAR = ['#e6f3cf', '#d3e8b6', '#bcd99b'];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c2"/><stop offset="0.55" stop-color="#fdf6dc"/><stop offset="1" stop-color="#eef6d4"/></linearGradient>
  <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.95"/><stop offset="0.4" stop-color="#fff0b0" stop-opacity="0.55"/><stop offset="1" stop-color="#fff0b0" stop-opacity="0"/></radialGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9e69a"/><stop offset="0.5" stop-color="#a6d078"/><stop offset="1" stop-color="#7fb35e"/></linearGradient>
  <linearGradient id="path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf0cc"/><stop offset="1" stop-color="#ecd49a"/></linearGradient>
  <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${wide ? 5 : 4}"/></filter>
  <filter id="soft2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="soft3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${wide ? 12 : 8}"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
<circle cx="${sunX}" cy="${sunY}" r="${f(Math.min(w, h) * 0.5)}" fill="url(#sun)"/>`;

  svg += `<g filter="url(#soft)" opacity="0.9">`;
  const farCount = wide ? 9 : 5;
  for (let i = 0; i < farCount; i++) {
    const cx = (i + 0.5) * (w / farCount) + (rnd() - 0.5) * 40;
    const r = (wide ? 100 : 90) * (0.8 + rnd() * 0.6);
    svg += crown(cx, horizon - r * 0.55, r, rnd, T_FAR, 12);
  }
  svg += `</g>`;

  svg += `<g filter="url(#soft3)">`;
  for (let i = 0; i < 4; i++) {
    const x0 = sunX + (i - 1.5) * (wide ? 60 : 44);
    const x1 = w * (0.1 + i * 0.26);
    svg += `<polygon points="${f(x0 - 14)},${f(sunY)} ${f(x0 + 14)},${f(sunY)} ${f(x1 + 80)},${f(horizon + h * 0.2)} ${f(x1 - 80)},${f(horizon + h * 0.2)}" fill="#fff6c8" opacity="${f(0.34 - i * 0.05)}"/>`;
  }
  svg += `</g>`;

  svg += `<g filter="url(#soft2)">`;
  const midCount = wide ? 7 : 4;
  for (let i = 0; i < midCount; i++) {
    const cx = (i + 0.5) * (w / midCount) + (rnd() - 0.5) * 50;
    const r = (wide ? 120 : 100) * (0.8 + rnd() * 0.5);
    const top = horizon - r * 0.9;
    svg += trunk(cx, top + r * 0.8, horizon + 24, 11, 18, '#b99870', '#8a6a48', (rnd() - 0.5) * 8);
    svg += crown(cx, top, r, rnd, T_MID, 15);
  }
  svg += `</g>`;

  const gy = horizon + 4;
  svg += `<path d="M0,${f(gy)} C${f(w * 0.25)},${f(gy - 18)} ${f(w * 0.7)},${f(gy - 14)} ${w},${f(gy + 4)} L${w},${h} L0,${h} Z" fill="url(#ground)"/>`;

  // Waldweg: breit und sicher, hinter und unter der Familie
  const pTop = w * 0.5;
  const pBot = w * 0.5;
  const wTop = w * 0.02;
  const wBot = w * (wide ? 0.85 : 1.1);
  svg += `<path d="M${f(pTop - wTop)},${f(gy + 2)} C${f(pTop - wTop * 2)},${f(gy + (h - gy) * 0.4)} ${f(pBot - wBot * 0.3)},${f(gy + (h - gy) * 0.62)} ${f(pBot - wBot / 2)},${h + 4} L${f(pBot + wBot / 2)},${h + 4} C${f(pBot + wBot * 0.3)},${f(gy + (h - gy) * 0.62)} ${f(pTop + wTop * 2)},${f(gy + (h - gy) * 0.4)} ${f(pTop + wTop)},${f(gy + 2)} Z" fill="url(#path)"/>`;
  svg += `<ellipse cx="${f(pBot)}" cy="${f(h * 0.8)}" rx="${f(wBot * 0.3)}" ry="${f(h * 0.07)}" fill="#fffbe0" opacity="0.2" filter="url(#soft3)"/>`;

  // große Randbäume
  const side = (x, dir, scale) => {
    const tw = 56 * scale;
    let g = trunk(x, gy - h * 0.5, h + 4, tw * 0.75, tw * 1.25, '#a8825a', '#6f4f35', dir * 5);
    g += crown(x + dir * tw * 0.4, gy - h * 0.46, (wide ? 220 : 170) * scale, rnd, T_LIGHT, 22);
    g += crown(x - dir * tw * 0.8, gy - h * 0.3, (wide ? 140 : 110) * scale, rnd, T_LIGHT, 14);
    return g;
  };
  svg += side(w * (wide ? 0.04 : 0.02), 1, 1);
  svg += side(w * (wide ? 0.99 : 1.0), -1, 0.9);

  // Boden-Vordergrund hinter den Figuren
  const fgBack = [];
  for (let i = 0; i < (wide ? 12 : 6); i++) fgBack.push(tuft(rnd() * w, gy + (h - gy) * (0.15 + rnd() * 0.3), 22 + rnd() * 26, rnd, '#7fb85c', '#98cc6e'));
  svg += fgBack.join('');

  // Figuren
  // Die Familie steht in der Bildmitte: Vater links, der kleine Junge in der Mitte, Mutter rechts.
  const footY = h * (wide ? 0.9 : 0.91);
  const cx0 = w * 0.5;
  const kAdult = (wide ? h * 0.8 : h * 0.86) / 410; // Maßstab: Vater (rund 410 Einheiten hoch) füllt den größten Teil der Bildhöhe
  const kMother = kAdult * 0.94;
  const kBoy = kAdult * 1.02; // Kleinkind: Körper knapp halb so hoch wie der Vater, Kopf nur wenig schmaler
  const dx = wide ? w * 0.18 : w * 0.285;
  const fx = cx0 - dx;
  const mx = cx0 + dx;
  // Zapfen links vor dem Vater, Moospolster rechts vor dem Jungen und der Mutter
  const coneX = fx - 110 * kAdult;
  const coneY = footY + h * 0.025;
  const mossX = cx0 + dx * 0.52;
  const mossY = footY + h * 0.05;
  const mossK = kAdult * 0.5;

  const place = (fn, x, k, target) => `<g transform="translate(${f(x)} ${f(footY)}) scale(${f(k)})">${fn(target)}</g>`;
  // Zielpunkte der Zeigehände in Figurkoordinaten (Füße bei 0,0), so berechnet, dass die Hände wirklich zum Fund zeigen
  const fatherTarget = [(coneX - fx) / kAdult + 14, (coneY - footY) / kAdult - 70];
  const boyTarget = [(mossX - cx0) / kBoy - 12, (mossY - footY) / kBoy - 36];
  const motherTarget = [(mossX - mx) / kMother + 14, (mossY - footY) / kMother - 66];
  for (const [x, k, rx] of [[fx, kAdult, 70], [cx0, kBoy, 48], [mx, kMother, 66]]) {
    svg += `<ellipse cx="${f(x)}" cy="${f(footY + 4)}" rx="${f(rx * k)}" ry="${f(11 * k)}" fill="#3a5a2a" opacity="0.28"/>`;
  }
  svg += mossPatch(mossX, mossY, mossK);
  svg += coneItem(coneX, coneY, kAdult * 0.5);
  svg += place(father, fx, kAdult, fatherTarget);
  svg += place(mother, mx, kMother, motherTarget);
  svg += place(boy, cx0, kBoy, boyTarget);

  // Vordergrund: Gras, Farn, Blumen, Blätter
  const fg = [];
  for (let i = 0; i < (wide ? 14 : 8); i++) {
    const x = rnd() * w;
    const y = h * (0.94 + rnd() * 0.07);
    fg.push(tuft(x, y, 26 + rnd() * 32, rnd, '#6fae52', '#8ac563'));
  }
  for (let i = 0; i < (wide ? 4 : 3); i++) {
    const side2 = i % 2 ? 1 : -1;
    const x = side2 < 0 ? rnd() * w * 0.16 : w - rnd() * w * 0.16;
    fg.push(fern(x, h * (0.94 + rnd() * 0.06), 60 + rnd() * 40, side2, '#5fa34c', '#7dbb5c'));
  }
  for (let i = 0; i < (wide ? 12 : 7); i++) {
    const x = rnd() * w;
    const y = h * (0.9 + rnd() * 0.09);
    fg.push(flower(x, y, 3 + rnd() * 2.2, i % 3 ? '#fffaf0' : '#ffe27a', '#f0a43c'));
  }
  const leafCols = ['#e9a23b', '#d9703a', '#f1c14b', '#c8553a'];
  for (let i = 0; i < (wide ? 8 : 5); i++) {
    const lx = rnd() * w;
    const ly = h * (0.92 + rnd() * 0.07);
    fg.push(`<g transform="translate(${f(lx)} ${f(ly)}) rotate(${f(rnd() * 360)}) scale(${f(0.8 + rnd() * 0.6)})"><path d="M0,-10 C8,-6 8,6 0,12 C-8,6 -8,-6 0,-10Z" fill="${leafCols[i % 4]}"/><path d="M0,-8 L0,10" stroke="#fff" stroke-opacity="0.35" stroke-width="0.9"/></g>`);
  }
  svg += fg.join('');
  svg += `</svg>`;
  return svg;
}

const jobs = [
  { name: 'familie-breit-1000', w: 1000, h: 560, v: 'breit' },
  { name: 'familie-schmal-720', w: 720, h: 600, v: 'schmal' },
];

for (const j of jobs) {
  const svg = scene(j.w, j.h, j.v);
  writeFileSync(`${out}${j.name}.svg`, svg);
  const base = sharp(Buffer.from(svg), { density: 72 });
  await base.clone().webp({ quality: 84, effort: 6 }).toFile(`${out}${j.name}.webp`);
  await base.clone().jpeg({ quality: 86, mozjpeg: true, progressive: true }).toFile(`${out}${j.name}.jpg`);
  for (const ext of ['webp', 'jpg']) console.log(`${j.name}.${ext}: ${(statSync(`${out}${j.name}.${ext}`).size / 1024).toFixed(0)} kB`);
}



