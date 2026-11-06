import { useId, type ReactNode } from 'react';

/**
 * Bausteine für die Bildwelt. Alle Motive sind eigenständig gezeichnete SVG-Illustrationen
 * im Stil eines Naturbilderbuchs: weiche Farben, klare Konturen, helle Lichtkante, ruhiger Grund.
 * Bewegung: Die Animationsklassen (.mv, .mv2, .rip, .draw) werden nur über CSS gesteuert
 * (src/styles/illustrations.css). Das Standbild ist immer die Ruhelage.
 */

export const C = {
  ink: '#5b4636',
  inkSoft: '#8a7258',
  cream: '#fff8e8',
  paper: '#fbf5e6',
  // Grün
  g1: '#a9d28a',
  g2: '#7bb661',
  g3: '#58994a',
  g4: '#3b7a3a',
  g5: '#2c5e34',
  // Gelb/Orange/Rot
  y1: '#f8dc7a',
  y2: '#f2c14b',
  y3: '#e3a52d',
  o1: '#f0a44f',
  o2: '#df7f35',
  r1: '#e1735c',
  r2: '#cf4c3b',
  r3: '#a8352b',
  // Braun/Holz
  b1: '#d9b88a',
  b2: '#bd8d5a',
  b3: '#97683b',
  b4: '#6f4a2b',
  b5: '#4d3320',
  // Stein
  s1: '#d8d4cb',
  s2: '#b8b3a8',
  s3: '#8d887d',
  s4: '#645f57',
  // Himmel/Wasser/Sand
  sky1: '#d8edf6',
  sky2: '#a9d6ea',
  sky3: '#6fb4d6',
  w1: '#a8d9e6',
  w2: '#6fb7d3',
  w3: '#3f8fb5',
  sand1: '#f6e8c3',
  sand2: '#ecd49a',
  sand3: '#d9b872',
  white: '#ffffff',
};

export type Bg = 'cream' | 'sky' | 'sand' | 'water' | 'green' | 'stone' | 'snow' | 'rose' | 'blue' | 'earth';

const BG: Record<Bg, [string, string]> = {
  cream: ['#fff7e4', '#f8ecc9'],
  sky: ['#e6f3fa', '#cfe8f3'],
  sand: ['#fbf0cf', '#f1dfa9'],
  water: ['#e1f2f5', '#c3e3ec'],
  green: ['#eef6dc', '#dcebbd'],
  stone: ['#efece6', '#dcd8cf'],
  snow: ['#f4f9fc', '#dfeaf3'],
  rose: ['#fdeee6', '#f8dccb'],
  blue: ['#e9f0fb', '#d3e1f5'],
  earth: ['#f1e5d0', '#dfc9a3'],
};

/** Globale Definitionen für Verläufe und Papierstruktur. Einmal pro Dokument einbinden. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="il-paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.24  0 0 0 0.9 -0.34"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="il-speckle" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.95" result="a" />
          <feComposite in="a" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="il-fibre-h" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.65" numOctaves="2" seed="5" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.4 -1.0" result="a" />
          <feComposite in="a" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="il-fibre-v" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65 0.015" numOctaves="2" seed="5" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.4 -1.0" result="a" />
          <feComposite in="a" in2="SourceAlpha" operator="in" />
        </filter>
        {(Object.keys(BG) as Bg[]).map((k) => (
          <linearGradient key={k} id={`il-bg-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BG[k][0]} />
            <stop offset="1" stopColor={BG[k][1]} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

/** Bühne für ein Motiv: ruhiger, heller Grund mit feiner Papierstruktur. */
export function Scene({ bg = 'cream', children, shadow = true }: { bg?: Bg; children: ReactNode; shadow?: boolean }) {
  return (
    <>
      <rect width="240" height="200" rx="26" fill={`url(#il-bg-${bg})`} />
      <rect width="240" height="200" rx="26" fill="#fff" filter="url(#il-paper)" opacity="0.5" />
      {shadow && <ellipse cx="120" cy="172" rx="74" ry="8" fill={C.ink} opacity="0.08" />}
      {children}
    </>
  );
}

/** Bewegliche Gruppe. Transform bleibt innen, damit CSS-Animationen die Ruhelage nicht überschreiben. */
export function Mv({
  children,
  transform,
  origin,
  cls = 'mv',
}: {
  children: ReactNode;
  transform?: string;
  /** Drehpunkt in Zeichnungskoordinaten, z. B. [120, 170] */
  origin?: [number, number];
  cls?: 'mv' | 'mv2' | 'mv3';
}) {
  const style = origin ? { transformBox: 'view-box' as const, transformOrigin: `${origin[0]}px ${origin[1]}px` } : undefined;
  return (
    <g className={cls} style={style}>
      <g transform={transform}>{children}</g>
    </g>
  );
}

/** Zeichnet Formen mit klarer Außenlinie als Einheit (Linie unten, Füllung oben). */
export function Union({ children, fill, line = C.ink, w = 5 }: { children: ReactNode; fill: string; line?: string; w?: number }) {
  return (
    <g>
      <g fill={line} stroke={line} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
      <g fill={fill} stroke="none">
        {children}
      </g>
    </g>
  );
}

/** Dicke Linie mit Außenkontur (Zweige, Wege, Wurzeln, Bäche). */
export function Thick({
  d,
  w,
  fill,
  line = C.ink,
  className,
  edge = 4,
  pathLength,
}: {
  d: string;
  w: number;
  fill: string;
  line?: string;
  className?: string;
  edge?: number;
  pathLength?: number;
}) {
  return (
    <g>
      <path d={d} fill="none" stroke={line} strokeWidth={w + edge} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className} pathLength={pathLength} />
    </g>
  );
}

/** Weiche Lichtkante / Lasur auf einer Form. */
export function Glow({ d, opacity = 0.25, fill = '#fff' }: { d: string; opacity?: number; fill?: string }) {
  return <path d={d} fill={fill} opacity={opacity} />;
}

/* ---------------- Naturalistische Helfer ---------------- */

/** Mischt eine Farbe mit Weiß (amt > 0) oder Schwarz (amt < 0). */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round(r + (target - r) * p);
  g = Math.round(g + (target - g) * p);
  b = Math.round(b + (target - b) * p);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Eindeutige, URL-taugliche ID für Verläufe. */
export function useGid(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** Weicher Rundverlauf (Licht links oben, Schatten unten rechts) für plastische Gegenstände. */
export function Grad({ id, base, cx = 0.36, cy = 0.3, r = 0.9, light = 0.4, dark = 0.28 }: { id: string; base: string; cx?: number; cy?: number; r?: number; light?: number; dark?: number }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      <stop offset="0" stopColor={shade(base, light)} />
      <stop offset="0.5" stopColor={base} />
      <stop offset="1" stopColor={shade(base, -dark)} />
    </radialGradient>
  );
}

/** Plastische Wirkung: Licht links oben, weicher Schatten rechts unten, feine Körnung. Liegt über einer fertigen Form. */
export function Plastic({ d, hi = 0.38, lo = 0.28, speck = 0.18 }: { d: string; hi?: number; lo?: number; speck?: number }) {
  const gid = useGid('pl');
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id={`${gid}h`} cx="0.32" cy="0.26" r="0.55">
          <stop offset="0" stopColor="#fff" stopOpacity={hi} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}s`} cx="0.7" cy="0.78" r="0.75">
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={lo} />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#${gid}s)`} />
      <path d={d} fill={`url(#${gid}h)`} />
      <Speckle d={d} opacity={speck} />
    </g>
  );
}

/** Feine, dunkle Körnung innerhalb einer Form (Oberflächenstruktur). */
export function Speckle({ d, opacity = 0.3, color = '#2a1a0a', filter = 'il-speckle' }: { d: string; opacity?: number; color?: string; filter?: string }) {
  return <path d={d} fill={color} opacity={opacity} filter={`url(#${filter})`} />;
}

/* ---------------- Blätter ---------------- */

export type LeafKind = 'ovate' | 'round' | 'long' | 'maple' | 'oak' | 'hand' | 'hole' | 'curl';

interface LeafGeom {
  body: string;
  half: string;
  veins: string;
  stem: string;
}

const OVATE: LeafGeom = {
  body: 'M0,-58 C26,-44 40,-6 30,22 C22,44 8,52 0,54 C-8,52 -22,44 -30,22 C-40,-6 -26,-44 0,-58 Z',
  half: 'M0,-58 C26,-44 40,-6 30,22 C22,44 8,52 0,54 Z',
  veins:
    'M0,-52 L0,54 M0,-34 Q9,-32 17,-42 M0,-34 Q-9,-32 -17,-42 M0,-14 Q14,-12 26,-26 M0,-14 Q-14,-12 -26,-26 M0,8 Q16,10 28,-4 M0,8 Q-16,10 -28,-4 M0,28 Q12,28 22,18 M0,28 Q-12,28 -22,18',
  stem: 'M0,54 Q2,64 -1,74',
};
const ROUND: LeafGeom = {
  body: 'M0,-50 C34,-50 46,-16 40,12 C34,38 14,50 0,52 C-14,50 -34,38 -40,12 C-46,-16 -34,-50 0,-50 Z',
  half: 'M0,-50 C34,-50 46,-16 40,12 C34,38 14,50 0,52 Z',
  veins:
    'M0,-46 L0,52 M0,-28 Q14,-26 26,-36 M0,-28 Q-14,-26 -26,-36 M0,-8 Q18,-6 33,-18 M0,-8 Q-18,-6 -33,-18 M0,14 Q18,16 32,4 M0,14 Q-18,16 -32,4 M0,34 Q12,34 22,26 M0,34 Q-12,34 -22,26',
  stem: 'M0,52 Q2,62 -1,72',
};
const LONG: LeafGeom = {
  body: 'M0,-64 C14,-42 18,-2 12,28 C8,46 3,54 0,58 C-3,54 -8,46 -12,28 C-18,-2 -14,-42 0,-64 Z',
  half: 'M0,-64 C14,-42 18,-2 12,28 C8,46 3,54 0,58 Z',
  veins: 'M0,-58 L0,58 M0,-36 Q6,-34 10,-40 M0,-36 Q-6,-34 -10,-40 M0,-12 Q8,-10 13,-18 M0,-12 Q-8,-10 -13,-18 M0,12 Q8,14 12,6 M0,12 Q-8,14 -12,6 M0,34 Q5,34 8,28 M0,34 Q-5,34 -8,28',
  stem: 'M0,58 Q2,66 -1,76',
};
const MAPLE: LeafGeom = {
  body:
    'M0,-60 L8,-42 L22,-48 L19,-26 L38,-32 L31,-12 L52,-8 L36,6 L44,24 L19,17 L11,31 L5,27 L4,54 L-4,54 L-5,27 L-11,31 L-19,17 L-44,24 L-36,6 L-52,-8 L-31,-12 L-38,-32 L-19,-26 L-22,-48 L-8,-42 Z',
  half: 'M0,-60 L8,-42 L22,-48 L19,-26 L38,-32 L31,-12 L52,-8 L36,6 L44,24 L19,17 L11,31 L5,27 L4,54 L0,54 Z',
  veins: 'M0,30 L0,-52 M0,30 L-34,-27 M0,30 L34,-27 M0,28 L-44,-6 M0,28 L44,-6 M0,30 L-36,20 M0,30 L36,20 M0,54 L0,26',
  stem: 'M0,54 Q3,66 -1,78',
};
const OAK: LeafGeom = {
  body:
    'M0,-60 C10,-60 14,-50 14,-44 C26,-48 34,-38 28,-30 C40,-30 44,-16 34,-10 C44,-4 42,10 30,12 C38,20 32,32 20,30 C22,40 12,46 4,44 L3,56 L-3,56 L-4,44 C-12,46 -22,40 -20,30 C-32,32 -38,20 -30,12 C-42,10 -44,-4 -34,-10 C-44,-16 -40,-30 -28,-30 C-34,-38 -26,-48 -14,-44 C-14,-50 -10,-60 0,-60 Z',
  half:
    'M0,-60 C10,-60 14,-50 14,-44 C26,-48 34,-38 28,-30 C40,-30 44,-16 34,-10 C44,-4 42,10 30,12 C38,20 32,32 20,30 C22,40 12,46 4,44 L3,56 L0,56 Z',
  veins: 'M0,-54 L0,56 M0,-34 Q10,-34 20,-40 M0,-34 Q-10,-34 -20,-40 M0,-12 Q16,-12 30,-20 M0,-12 Q-16,-12 -30,-20 M0,8 Q16,8 28,2 M0,8 Q-16,8 -28,2 M0,26 Q10,26 18,22 M0,26 Q-10,26 -18,22',
  stem: 'M0,56 Q2,64 -1,70',
};

function serratedGeom(): LeafGeom {
  const right: [number, number][] = [];
  const N = 22;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const y = -58 + u * 112;
    const w = 34 * Math.sin(Math.PI * Math.pow(u, 0.82)) + 0.6;
    const tooth = i % 2 === 0 ? 3.4 : -0.6;
    right.push([Math.max(0, w + (i === 0 || i === N ? 0 : tooth)), y]);
  }
  const pts: string[] = [];
  for (const [x, y] of right) pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  for (const [x, y] of [...right].reverse()) pts.push(`${(-x).toFixed(1)},${y.toFixed(1)}`);
  const body = `M${pts.join(' L')} Z`;
  const half = `M${right.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`;
  return { body, half, veins: OVATE.veins, stem: OVATE.stem };
}

const GEOM: Record<'ovate' | 'round' | 'long' | 'maple' | 'oak' | 'serrated', LeafGeom> = { ovate: OVATE, round: ROUND, long: LONG, maple: MAPLE, oak: OAK, serrated: serratedGeom() };

export interface LeafColors {
  fill: string;
  edge: string;
  vein: string;
  light?: string;
}

export const LEAF_GREEN: LeafColors = { fill: C.g2, edge: C.g5, vein: C.g1, light: C.g1 };
export const LEAF_GREEN_DARK: LeafColors = { fill: C.g3, edge: C.g5, vein: C.g1, light: C.g2 };
export const LEAF_YELLOW: LeafColors = { fill: C.y2, edge: '#9a6a12', vein: C.y1, light: C.y1 };
export const LEAF_ORANGE: LeafColors = { fill: C.o1, edge: '#8f4a14', vein: C.y1, light: C.y1 };
export const LEAF_RED: LeafColors = { fill: C.r2, edge: '#6d1f1b', vein: C.r1, light: C.r1 };
export const LEAF_BROWN: LeafColors = { fill: C.b2, edge: C.b5, vein: C.b1, light: C.b1 };
export const LEAF_GOLD: LeafColors = { fill: '#d39a3b', edge: '#6c4417', vein: C.y1, light: C.y1 };

/** Ein Blatt mit Verlauf, feiner Körnung, dünner Kontur und plastischen Blattadern. Mittelpunkt (x, y), Drehung in Grad. */
export function Leaf({
  kind = 'ovate',
  x,
  y,
  rot = 0,
  s = 1,
  colors = LEAF_GREEN,
  veins = true,
  veinW = 1.7,
  stem = true,
  hole,
}: {
  kind?: 'ovate' | 'round' | 'long' | 'maple' | 'oak' | 'serrated';
  x: number;
  y: number;
  rot?: number;
  s?: number;
  colors?: LeafColors;
  veins?: boolean;
  veinW?: number;
  stem?: boolean;
  hole?: { x: number; y: number; r: number };
}) {
  const g = GEOM[kind];
  const gid = useGid('lf');
  const edge = shade(colors.edge, 0.05);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <Grad id={gid} base={colors.fill} light={0.38} dark={0.24} cx={0.42} cy={0.36} r={0.8} />
      </defs>
      {stem && <path d={g.stem} fill="none" stroke={edge} strokeWidth={2.6} strokeLinecap="round" />}
      <path d={g.body} fill={`url(#${gid})`} stroke={edge} strokeWidth={1.6} strokeLinejoin="round" strokeOpacity={0.9} />
      <path d={g.half} fill="#fff" opacity={0.1} />
      <Speckle d={g.body} opacity={0.26} color={shade(colors.edge, -0.2)} />
      {veins && (
        <>
          <path d={g.veins} fill="none" stroke={shade(colors.edge, -0.1)} strokeWidth={veinW} strokeLinecap="round" strokeLinejoin="round" opacity={0.28} transform="translate(0.9 0.9)" />
          <path d={g.veins} fill="none" stroke={colors.vein} strokeWidth={veinW} strokeLinecap="round" strokeLinejoin="round" opacity={0.88} />
        </>
      )}
      {hole && (
        <>
          <ellipse cx={hole.x} cy={hole.y} rx={hole.r + 1.6} ry={hole.r + 1.2} fill={edge} />
          <ellipse cx={hole.x} cy={hole.y} rx={hole.r} ry={hole.r - 0.6} fill="#f1e6cb" />
        </>
      )}
    </g>
  );
}

/** Handförmiges Blatt: fünf Fingerlappen, die von einem Punkt ausgehen. */
export function HandLeaf({ x, y, rot = 0, s = 1, colors = LEAF_GREEN }: { x: number; y: number; rot?: number; s?: number; colors?: LeafColors }) {
  const fingers = [-66, -34, 0, 34, 66];
  const len = [34, 44, 50, 44, 34];
  const wid = [11, 13, 14, 13, 11];
  const shapes = fingers.map((a, i) => (
    <g key={a} transform={`rotate(${a})`}>
      <ellipse cx={0} cy={-len[i] * 0.9} rx={wid[i]} ry={len[i]} />
    </g>
  ));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,0 Q2,26 -1,50" fill="none" stroke={colors.edge} strokeWidth={3.4} strokeLinecap="round" />
      <Union fill={colors.fill} line={colors.edge} w={5}>
        {shapes}
        <circle r={14} />
      </Union>
      <g stroke={colors.vein} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.9}>
        {fingers.map((a, i) => (
          <path key={a} d={`M0,0 L${(Math.sin((a * Math.PI) / 180) * len[i] * 1.55).toFixed(1)},${(-Math.cos((a * Math.PI) / 180) * len[i] * 1.55).toFixed(1)}`} />
        ))}
      </g>
    </g>
  );
}

/* ---------------- Kleine Bausteine ---------------- */

export function GrassBlades({ x, y, count = 7, h = 60, spread = 40, color = C.g3, light = C.g2 }: { x: number; y: number; count?: number; h?: number; spread?: number; color?: string; light?: string }) {
  const blades = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const dx = (t - 0.5) * spread;
    const hh = h * (0.7 + 0.3 * Math.sin(i * 1.7 + 1));
    const lean = dx * 0.9 + (i % 2 ? 6 : -6);
    blades.push(
      <path
        key={i}
        d={`M${x + dx - 4},${y} Q${x + dx * 1.1},${y - hh * 0.55} ${x + lean},${y - hh} Q${x + dx * 1.1 + 4},${y - hh * 0.5} ${x + dx + 4},${y} Z`}
        fill={i % 2 ? color : light}
        stroke={C.g5}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />,
    );
  }
  return <g>{blades}</g>;
}

export function Pebble({ x, y, rx = 14, ry = 10, fill = C.s2, dark = C.s4, light = C.s1, rot = 0 }: { x: number; y: number; rx?: number; ry?: number; fill?: string; dark?: string; light?: string; rot?: number }) {
  const gid = useGid('pb');
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <Grad id={gid} base={fill} light={0.32} dark={0.26} cx={0.34} cy={0.3} r={0.9} />
      </defs>
      <ellipse rx={rx} ry={ry} fill={`url(#${gid})`} stroke={dark} strokeWidth={1.5} strokeOpacity={0.75} />
      <ellipse rx={rx} ry={ry} fill="#1e1a14" opacity={0.3} filter="url(#il-speckle)" />
      <ellipse cx={-rx * 0.28} cy={-ry * 0.34} rx={rx * 0.5} ry={ry * 0.32} fill={light} opacity={0.5} />
      <path d={`M${rx * 0.15},${ry * 0.55} q${rx * 0.3},${ry * 0.1} ${rx * 0.55},-${ry * 0.2}`} stroke={dark} strokeWidth={1.1} fill="none" opacity={0.35} strokeLinecap="round" />
    </g>
  );
}

export function Cloud({ x, y, s = 1, fill = '#fff' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-30,8 C-42,8 -44,-8 -30,-10 C-30,-24 -8,-28 -2,-16 C6,-26 28,-22 28,-8 C42,-8 42,8 28,8 Z"
        fill={fill}
        stroke="#9ec3d6"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </g>
  );
}

export function Sun({ x, y, r = 18 }: { x: number; y: number; r?: number }) {
  const rays = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    rays.push(
      <line key={i} x1={x + Math.cos(a) * (r + 5)} y1={y + Math.sin(a) * (r + 5)} x2={x + Math.cos(a) * (r + 12)} y2={y + Math.sin(a) * (r + 12)} stroke={C.y3} strokeWidth={3} strokeLinecap="round" />,
    );
  }
  return (
    <g>
      {rays}
      <circle cx={x} cy={y} r={r} fill={C.y1} stroke={C.y3} strokeWidth={2.6} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.4} fill="#fff" opacity={0.4} />
    </g>
  );
}

export function Hills({ y = 150, c1 = C.g1, c2 = C.g2 }: { y?: number; c1?: string; c2?: string }) {
  return (
    <g>
      <path d={`M0,${y} C40,${y - 34} 80,${y - 30} 120,${y - 8} C160,${y - 30} 200,${y - 36} 240,${y - 6} L240,200 L0,200 Z`} fill={c1} />
      <path d={`M0,${y + 14} C50,${y - 12} 100,${y - 6} 150,${y + 10} C190,${y - 10} 220,${y - 8} 240,${y + 4} L240,200 L0,200 Z`} fill={c2} />
    </g>
  );
}

export function Ground({ y = 150, fill = C.g2, line = C.g4 }: { y?: number; fill?: string; line?: string }) {
  return (
    <g>
      <path d={`M0,${y} C60,${y - 8} 180,${y - 8} 240,${y} L240,200 L0,200 Z`} fill={fill} />
      <path d={`M0,${y} C60,${y - 8} 180,${y - 8} 240,${y}`} fill="none" stroke={line} strokeWidth={2} opacity={0.35} />
    </g>
  );
}

export function Flower({ x, y, r = 12, petals = 8, petal = C.white, edge = '#c9bfa5', center = C.y2, centerEdge = C.y3 }: { x: number; y: number; r?: number; petals?: number; petal?: string; edge?: string; center?: string; centerEdge?: string }) {
  const ps = [];
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * 360;
    ps.push(<ellipse key={i} cx={0} cy={-r * 0.95} rx={r * 0.42} ry={r * 0.62} transform={`rotate(${a})`} />);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <Union fill={petal} line={edge} w={3}>
        {ps}
      </Union>
      <circle r={r * 0.42} fill={center} stroke={centerEdge} strokeWidth={2} />
    </g>
  );
}

/** Eintrag der Bildwelt: Hintergrund und Zeichnung eines Motivs. */
export interface Art {
  bg: Bg;
  draw: () => ReactNode;
  shadow?: boolean;
}

/** Einfacher, deterministischer Zufall für gleichbleibende „zufällige“ Verteilungen (Kies, Blätter). */
export function det(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
