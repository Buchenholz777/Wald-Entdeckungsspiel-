// Gezeichnete, fiktive Familie (Vater, Mutter, Kleinkind) als SVG-Figuren in einem eigenen Koordinatensystem: Füße bei (0, 0), Körper nach oben.
// Wird von scripts/make-forest-background.mjs in die feststehende Waldszene gesetzt. Reiner Code, keine Fotos, keine Schrift.
const f = (n) => Number(n.toFixed(1));
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
  // rechter Arm (Bildseite rechts): angewinkelt, das Handy vor dem Bauch – er spielt gerade mit
  s += limb([[44, -288], [66, -240], [32, -232]], 21, jacket, jacketL);
  s += `<g transform="translate(28 -252) rotate(-14)"><rect x="-10" y="-17" width="20" height="34" rx="4" fill="#2b2f36"/><rect x="-8" y="-14" width="16" height="27" rx="2" fill="#bfe8d6"/><path d="M-5,-8 h10 M-5,-2 h7" stroke="#4a9a7a" stroke-width="1.6" stroke-linecap="round"/></g>`;
  s += hand(26, -234, 9.5, skin);
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
  s += eyes({ y: -6, dx: 11.5, rw: 6, rh: 4.1, iris: '#3d9a98', brow: '#4c3526', lookX: 0.8, lookY: 2.4, browW: 2.6 });
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
  // Schwanger: Das cremefarbene Oberteil spannt sich über einen runden Bauch, die offene Jacke fällt links und rechts daran vorbei
  s += `<path d="M-30,-284 Q0,-274 30,-284 L40,-236 Q54,-196 30,-164 Q0,-150 -30,-164 Q-54,-196 -40,-236 Z" fill="${top}"/>`;
  s += `<path d="M-26,-214 Q0,-196 26,-214" fill="none" stroke="#d9c9a0" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M-40,-282 Q-34,-294 -12,-294 L-8,-252 Q-30,-214 -36,-160 L-52,-160 Q-60,-224 -40,-282 Z" fill="${jacket}"/>`;
  s += `<path d="M40,-282 Q34,-294 12,-294 L8,-252 Q30,-214 36,-160 L52,-160 Q60,-224 40,-282 Z" fill="${jacket}"/>`;
  s += `<path d="M-40,-282 Q-60,-224 -52,-160 L-44,-160 Q-50,-224 -34,-280Z" fill="${jacketD}" opacity="0.55"/>`;
  s += `<path d="M-12,-294 L-8,-252 L-16,-286Z M12,-294 L8,-252 L16,-286Z" fill="${jacketL}"/>`;
  // zeigender Arm (Bildseite links, zum Moos)
  s += pointingArm(-38, -278, px, py, -18, 19, jacket, jacketL, skin, 8.6, 158);
  // äußerer Arm: die Hand ruht auf dem Bauch
  s += limb([[38, -278], [62, -226], [34, -198]], 19, jacket, jacketL);
  s += hand(26, -198, 8.6, skin);
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
  s += eyes({ y: -5, dx: 10.5, rw: 5.4, rh: 3.9, iris: '#6b4020', brow: '#4a2f1e', lookX: -0.8, lookY: 2.4, lash: true, browW: 2 });
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
  s += eyes({ y: -2, dx: 12, rw: 6.4, rh: 5, iris: '#4f8fd0', brow: '#8f6c3a', lookX: 0.6, lookY: 2.6, lash: true, browLift: 1, browW: 1.8 });
  s += nose(6, 3.2, '#d09a7c');
  s += `<ellipse cx="-20" cy="13" rx="6" ry="4" fill="#ee8f8a" opacity="0.45"/><ellipse cx="20" cy="13" rx="6" ry="4" fill="#ee8f8a" opacity="0.45"/>`;
  s += smile(18, 5.6, '#b04e48', true);
  s += `</g>`;
  return s;
}


export { father, mother, boy };

