import type { ReactNode } from 'react';
import { det, shade, useGid, type Art } from './kit';
import { blob, Gloss, Orb, rng, Shadow, SilShadow, smoothPath, type Pt } from './real-kit';

/* ============================================================================================
   Zapfen: Fichtenzapfen (lang, schlank, dünne rundliche Schuppen) und Kiefernzapfen (kurz, eiförmig,
   verholzte Schuppen mit rautenförmigem Schild). Die Schuppen sitzen in Spiralreihen um die Achse,
   die Reihen weiter oben überdecken die darunter wie Dachziegel. Alle Zufallswerte sind fest.
   Beispiele: Fichte und Kiefer. Das Spiel sucht allgemein „Zapfen“, Art und Größe dürfen abweichen.
   ============================================================================================ */

type ConeKind = 'spruce' | 'pine';

interface ConeProps {
  kind: ConeKind;
  /** Länge entlang der Achse (Ansatz oben, Spitze unten) */
  len: number;
  /** größte Breite */
  w: number;
  seed: number;
  /** Ab dieser Achsenposition (0 = Ansatz, 1 = Spitze) fehlen die Schuppen (Fraßspur); sie sitzen nur noch an der Spitze */
  bareUntil?: number;
}

function profile(kind: ConeKind, t: number): number {
  if (kind === 'spruce') {
    const a = t < 0.34 ? (0.34 - t) / 0.34 : (t - 0.34) / 0.66;
    return Math.pow(Math.max(0, 1 - Math.pow(a, t < 0.34 ? 2.4 : 2.1)), 0.58);
  }
  const a = t < 0.46 ? (0.46 - t) / 0.46 : (t - 0.46) / 0.54;
  return Math.sqrt(Math.max(0, 1 - Math.pow(a, 2.05)));
}

/** Umriss eines Zapfens (Achse nach unten, Ansatz bei y = 0); `grow` weitet ihn leicht aus (zum Beschneiden). */
export function coneOutline(kind: ConeKind, len: number, w: number, grow = 0): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const hw = (w / 2) * profile(kind, t) + (profile(kind, t) > 0.05 ? grow : 0);
    left.push([-hw, t * len]);
    right.push([hw, t * len]);
  }
  return smoothPath([...left, ...right.reverse()], true);
}

export function ConeShape({ kind, len, w, seed, bareUntil = 0 }: ConeProps) {
  const r = rng(seed);
  const rows = kind === 'spruce' ? 17 : 11;
  const base = kind === 'spruce' ? '#8c5b34' : '#7d6347';
  const hiCol = kind === 'spruce' ? '#c79862' : '#b39770';
  const loCol = kind === 'spruce' ? '#4e2f1a' : '#3d2e20';
  const id = useGid('cn');

  const outline = coneOutline(kind, len, w);
  const clipD = coneOutline(kind, len, w, kind === 'spruce' ? 1.4 : 2.2);

  const scales: { z: number; node: ReactNode }[] = [];
  const stubs: ReactNode[] = [];
  const rowH = len / rows;
  for (let i = rows - 1; i >= 0; i--) {
    const t = (i + 0.55) / rows;
    const radius = (w / 2) * profile(kind, t);
    if (radius < 1.2) continue;
    const m = Math.max(5, Math.round((kind === 'spruce' ? 9.5 : 7.5) * (0.45 + 0.55 * (radius / (w / 2)))));
    const phase = (i % 2 === 0 ? 0 : 0.5) + r.between(-0.08, 0.08);
    for (let j = 0; j < m; j++) {
      const th = ((j + phase) / m) * Math.PI * 2;
      const z = Math.cos(th);
      if (z < -0.12) continue; // Rückseite
      const x = radius * Math.sin(th);
      // leichte Neigung der Achse zum Betrachter: Schuppen mit großem z sitzen etwas tiefer
      const y = t * len + z * rowH * 0.28;
      const arc = ((Math.PI * 2 * radius) / m) * (0.62 + 0.55 * Math.max(z, 0.05));
      const bare = t < bareUntil;
      if (bare) {
        if (z > 0.3) {
          // Stummel: Ansatzstelle der abgenagten Schuppe, ein kurzer, schräger, ausgefranster Zahn
          const sx = x * 0.62;
          stubs.push(
            <g key={`s${i}-${j}`} transform={`translate(${f(sx)} ${f(y)}) rotate(${f(x * 0.9)})`}>
              <path d={`M${f(-arc * 0.3)},${f(-rowH * 0.5)} L${f(arc * 0.3)},${f(-rowH * 0.5)} L${f(arc * 0.12)},${f(rowH * 0.85)} L${f(-arc * 0.1)},${f(rowH * 0.7)} Z`} fill="#5a3e24" opacity="0.7" transform="translate(0.7 0.9)" />
              <path d={`M${f(-arc * 0.3)},${f(-rowH * 0.5)} L${f(arc * 0.3)},${f(-rowH * 0.5)} L${f(arc * 0.12)},${f(rowH * 0.85)} L${f(-arc * 0.1)},${f(rowH * 0.7)} Z`} fill={r.next() > 0.5 ? '#d2b07c' : '#bd955f'} />
              <path d={`M${f(-arc * 0.24)},${f(-rowH * 0.4)} L${f(-arc * 0.06)},${f(rowH * 0.6)}`} stroke="#f0dcb0" strokeOpacity="0.7" strokeWidth="0.5" />
            </g>,
          );
        }
        continue;
      }
      const sc = scale(kind, x, y, arc, rowH, z, r.next(), base, hiCol, loCol, `${id}k${i}-${j}`);
      scales.push({ z: -Math.abs(Math.sin(th)), node: sc });
    }
  }
  // je Reihe: Randschuppen zuerst, mittlere zuletzt (die Reihenfolge bleibt reihenweise von unten nach oben)
  return (
    <g>
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#120804" stopOpacity="0" />
          <stop offset="1" stopColor="#120804" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120804" stopOpacity={0.32} />
          <stop offset="0.14" stopColor="#120804" stopOpacity="0" />
          <stop offset="0.9" stopColor="#120804" stopOpacity="0" />
          <stop offset="1" stopColor="#120804" stopOpacity={0.3} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={outline} />
        </clipPath>
        <clipPath id={`${id}k`}>
          <path d={clipD} />
        </clipPath>
      </defs>
      {bareUntil > 0 && (
        <g>
          {/* Mittelspindel: faserig, hell, nach oben dicker */}
          <path d={`M${-w * 0.13},0 L${w * 0.13},0 L${w * 0.07},${len} L${-w * 0.07},${len} Z`} fill="#b8946a" />
          <path d={`M${-w * 0.13},0 L${-w * 0.03},0 L${-w * 0.02},${len} L${-w * 0.07},${len} Z`} fill="#e6d0a4" opacity="0.85" />
          <path d={`M${w * 0.05},0 L${w * 0.13},0 L${w * 0.07},${len} L${w * 0.03},${len} Z`} fill="#5a3e24" opacity="0.55" />
          <rect x={-w * 0.13} y={0} width={w * 0.26} height={len} fill="#7a5a34" filter="url(#nx-bump-v)" opacity="0.5" />
          {stubs}
        </g>
      )}
      <g clipPath={bareUntil === 0 ? `url(#${id}k)` : undefined}>
        <g filter="url(#nx-bump)">
          {scales.map((s, k) => (
            <g key={k}>{s.node}</g>
          ))}
        </g>
      </g>
      <g clipPath={`url(#${id}c)`} pointerEvents="none">
        {bareUntil === 0 && <path d={outline} fill={`url(#${id}l)`} />}
        {bareUntil === 0 && <path d={outline} fill={`url(#${id}v)`} />}
      </g>
    </g>
  );
}

function scale(kind: ConeKind, x: number, y: number, arc: number, rowH: number, z: number, rv: number, base: string, hi: string, lo: string, gid: string): ReactNode {
  const tone = shade(base, (rv - 0.5) * 0.22 - (1 - z) * 0.1);
  const tilt = (x / 24) * 9;
  if (kind === 'spruce') {
    // dünne, rundliche Schuppe mit hellerem, leicht gewelltem Rand
    const W = arc * 1.08;
    const H = rowH * 2.5;
    return (
      <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(tilt)})`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(tone, -0.46)} />
            <stop offset="0.3" stopColor={shade(tone, -0.12)} />
            <stop offset="0.82" stopColor={shade(tone, 0.2)} />
            <stop offset="1" stopColor={hi} />
          </linearGradient>
        </defs>
        <path
          d={`M${f(-W / 2)},${f(-H * 0.38)} L${f(-W / 2)},${f(H * 0.3)} Q${f(-W * 0.52)},${f(H * 0.52)} ${f(-W * 0.3)},${f(H * 0.58)} Q${f(-W * 0.12)},${f(H * 0.66)} 0,${f(H * 0.6)} Q${f(W * 0.12)},${f(H * 0.66)} ${f(W * 0.3)},${f(H * 0.58)} Q${f(W * 0.52)},${f(H * 0.52)} ${f(W / 2)},${f(H * 0.3)} L${f(W / 2)},${f(-H * 0.38)} Z`}
          fill={`url(#${gid})`}
          stroke={shade(lo, 0.05)}
          strokeOpacity="0.8"
          strokeWidth="0.55"
          strokeLinejoin="round"
        />
        <path d={`M${f(-W * 0.38)},${f(H * 0.5)} Q0,${f(H * 0.66)} ${f(W * 0.38)},${f(H * 0.5)}`} fill="none" stroke={shade(hi, 0.3)} strokeOpacity="0.75" strokeWidth="0.7" strokeLinecap="round" />
        <path d={`M0,${f(-H * 0.1)} L0,${f(H * 0.42)}`} stroke={shade(lo, 0.1)} strokeOpacity="0.28" strokeWidth="0.5" />
      </g>
    );
  }
  // Kiefer: Schild mit vier Flächen (Pyramide) und kleinem Nabel
  const W = arc * 1.12;
  const H = rowH * 2.05;
  const lit = shade(tone, 0.26);
  const dark = shade(tone, -0.3);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(tilt * 0.6)})`}>
      <path d={`M${f(-W * 0.5)},0 L0,${f(-H * 0.5)} L${f(W * 0.5)},0 L0,${f(H * 0.5)} Z`} fill={shade(lo, 0.1)} />
      <path d={`M${f(-W * 0.46)},0 L0,${f(-H * 0.46)} L0,0 Z`} fill={lit} />
      <path d={`M0,${f(-H * 0.46)} L${f(W * 0.46)},0 L0,0 Z`} fill={tone} />
      <path d={`M${f(-W * 0.46)},0 L0,${f(H * 0.46)} L0,0 Z`} fill={shade(tone, -0.08)} />
      <path d={`M0,${f(H * 0.46)} L${f(W * 0.46)},0 L0,0 Z`} fill={dark} />
      <ellipse cx={0} cy={0} rx={W * 0.1} ry={H * 0.1} fill={shade(tone, -0.4)} />
      <ellipse cx={-W * 0.03} cy={-H * 0.03} rx={W * 0.05} ry={H * 0.05} fill={shade(tone, 0.2)} opacity="0.7" />
      <path d={`M${f(-W * 0.46)},0 L0,${f(-H * 0.46)} L${f(W * 0.46)},0`} fill="none" stroke={shade(hi, 0.25)} strokeOpacity="0.55" strokeWidth="0.6" strokeLinejoin="round" />
    </g>
  );
}

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Ansatzstück: kurzer, heller Stiel mit ein paar Schuppenresten. */
function Stalk({ w, len }: { w: number; len: number }) {
  return (
    <g>
      <path d={`M${-w * 0.08},${-len} L${w * 0.08},${-len} L${w * 0.1},2 L${-w * 0.1},2 Z`} fill="#8a6a42" />
      <path d={`M${-w * 0.08},${-len} L${-w * 0.02},${-len} L${-w * 0.03},2 L${-w * 0.1},2 Z`} fill="#c9a874" opacity="0.8" />
      <ellipse cx={0} cy={-len} rx={w * 0.08} ry={1.6} fill="#5a3f26" />
    </g>
  );
}

/* ============================================================================================
   Eichel: Nuss mit Längsstreifen, glänzend, Spitze mit dunklem Nippel; Fruchtbecher aus kleinen,
   filzigen Schuppen (Stieleiche als Beispiel). Liegend gezeichnet, wie man sie auf dem Waldboden findet.
   ============================================================================================ */

function nutOutline(L: number, W: number, pointy = 0.9): { d: string; half: (t: number) => number } {
  const half = (t: number) => {
    const peak = 0.4;
    const a = t < peak ? (peak - t) / peak : (t - peak) / (1 - peak);
    const p = t < peak ? 2.1 : 1.55;
    return (W / 2) * Math.pow(Math.max(0, 1 - Math.pow(a, p)), 0.62) * (t > 0.96 ? 1 - (t - 0.96) * 14 * pointy : 1);
  };
  const up: Pt[] = [];
  const dn: Pt[] = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    up.push([t * L, -half(t)]);
    dn.push([t * L, half(t)]);
  }
  return { d: smoothPath([...up, ...dn.reverse()], true), half };
}

export function AcornNut({ L = 62, W = 34, seed = 5, tone = '#b88a4c', withCup = true }: { L?: number; W?: number; seed?: number; tone?: string; withCup?: boolean }) {
  const { d, half } = nutOutline(L, W);
  const id = useGid('ac');
  const r = rng(seed);
  const stripes = [];
  for (let k = -5; k <= 5; k++) {
    const off = k / 5.6;
    const pts: Pt[] = [];
    for (let i = 3; i <= 25; i++) {
      const t = i / 26;
      pts.push([t * L, off * half(t) * 0.96]);
    }
    stripes.push(
      <path key={k} d={smoothPath(pts, false)} fill="none" stroke={shade(tone, -0.5)} strokeOpacity={0.14 + r.next() * 0.2} strokeWidth={0.7 + r.next() * 0.9} strokeLinecap="round" />,
    );
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(tone, 0.38)} />
          <stop offset="0.3" stopColor={shade(tone, 0.12)} />
          <stop offset="0.7" stopColor={tone} />
          <stop offset="1" stopColor={shade(tone, -0.42)} />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa05a" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#9aa05a" stopOpacity="0" />
          <stop offset="0.85" stopColor="#3a1f0a" stopOpacity="0" />
          <stop offset="1" stopColor="#3a1f0a" stopOpacity="0.5" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={`url(#${id}a)`} />
      <g clipPath={`url(#${id}c)`}>
        <path d={d} fill={`url(#${id}b)`} />
        {stripes}
        {!withCup && (
          <>
            {/* helle, matte Ansatznarbe */}
            <ellipse cx={1.5} cy={0} rx={5.4} ry={half(0.03) * 0.98} fill="#d8c08a" />
            <ellipse cx={1.5} cy={0} rx={5.4} ry={half(0.03) * 0.98} fill="#6a4a20" opacity="0.2" filter="url(#nx-bump)" />
          </>
        )}
        <path d={d} fill="#2a1604" filter="url(#nx-bump)" opacity="0.2" />
      </g>
      <path d={d} fill="none" stroke={shade(tone, -0.55)} strokeOpacity="0.55" strokeWidth="0.9" />
      {/* Spitze */}
      <path d={`M${L - 4.5},-2.4 Q${L + 1.5},0 ${L - 4.5},2.4 Z`} fill="#4a2c12" />
      <Gloss cx={L * 0.42} cy={-W * 0.24} rx={L * 0.2} ry={W * 0.06} rot={-4} o={0.62} />
      <Gloss cx={L * 0.2} cy={-W * 0.3} rx={L * 0.05} ry={W * 0.035} rot={-30} o={0.7} />
    </g>
  );
}

export function AcornCupShape({ R = 19, C = 24, seed = 11, open = false }: { R?: number; C?: number; seed?: number; open?: boolean }) {
  // Fruchtbecher von der Seite: Rand rechts (x = 0), Wölbung nach links, kleine Schuppen in Querreihen
  const r = rng(seed);
  const id = useGid('cp');
  const prof = (s: number) => R * Math.sqrt(Math.max(0, 1 - Math.pow(s / C, 2.1))) ;
  const outline: Pt[] = [];
  for (let i = 0; i <= 14; i++) {
    const s = (i / 14) * C;
    outline.push([-s, -prof(s)]);
  }
  for (let i = 14; i >= 0; i--) {
    const s = (i / 14) * C;
    outline.push([-s, prof(s)]);
  }
  const d = smoothPath(outline, true);
  const tiles: ReactNode[] = [];
  const rings = 8;
  for (let k = 0; k < rings; k++) {
    const s = (k / rings) * C * 0.97 + 1.2;
    const rr = prof(s);
    const n = Math.max(3, Math.round(rr / 3.5));
    for (let j = -n; j <= n; j++) {
      const ph = ((j + (k % 2 ? 0.5 : 0)) / (n + 0.7)) * (Math.PI / 2) * 1.02;
      if (Math.abs(ph) > Math.PI / 2 * 0.98) continue;
      const y = rr * Math.sin(ph);
      const sz = 3.5 * (0.55 + 0.45 * Math.cos(ph)) * (1 - (s / C) * 0.12);
      const tone = shade('#8a7656', r.between(-0.12, 0.12) - (s / C) * 0.1);
      tiles.push(
        <g key={`${k}-${j}`} transform={`translate(${f(-s)} ${f(y)})`}>
          <ellipse cx={0.5} cy={0.5} rx={sz * 0.95} ry={sz * 1.05} fill={shade(tone, -0.45)} opacity="0.7" />
          <ellipse cx={0} cy={0} rx={sz * 0.85} ry={sz} fill={tone} />
          <ellipse cx={-sz * 0.2} cy={-sz * 0.28} rx={sz * 0.5} ry={sz * 0.4} fill={shade(tone, 0.34)} opacity="0.7" />
          <path d={`M${f(-sz * 0.2)},${f(-sz * 0.2)} q${f(sz * 0.3)},${f(sz * 0.5)} 0,${f(sz * 0.9)}`} stroke={shade(tone, -0.5)} strokeOpacity="0.35" strokeWidth="0.4" fill="none" />
        </g>,
      );
    }
  }
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#0f0804" stopOpacity="0" />
          <stop offset="1" stopColor="#0f0804" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d={d} fill="#6e5c40" />
      <g clipPath={`url(#${id}c)`}>
        <g filter="url(#nx-bump)">{tiles}</g>
        <path d={d} fill={`url(#${id}l)`} />
      </g>
      {/* Rand des Bechers: von der Seite schmal, bei geöffneter Ansicht als Ring mit leerem, dunklem Inneren */}
      {open ? (
        <g>
          <ellipse cx={0} cy={0} rx={12.5} ry={R} fill="#9c8a62" />
          <ellipse cx={0.4} cy={0.4} rx={11.2} ry={R * 0.93} fill="#cdbd94" />
          <ellipse cx={1.4} cy={0.6} rx={9.2} ry={R * 0.8} fill="#4a3822" />
          <ellipse cx={3.2} cy={1.4} rx={6.4} ry={R * 0.6} fill="#241a0e" filter="url(#nx-b2)" />
          <ellipse cx={-3.4} cy={-1} rx={2.4} ry={3.2} fill="#a8946a" opacity="0.8" />
          <path d={`M-9,${f(-R * 0.55)} A11.6,${f(R * 0.9)} 0 0 1 6,${f(-R * 0.86)}`} fill="none" stroke="#efe3bf" strokeOpacity="0.8" strokeWidth="1" strokeLinecap="round" />
        </g>
      ) : (
        <>
          <ellipse cx={0} cy={0} rx={2.2} ry={R} fill="#b4a37c" />
          <ellipse cx={-0.5} cy={0} rx={1.2} ry={R * 0.96} fill="#d8cba6" opacity="0.8" />
        </>
      )}
      <path d={d} fill="none" stroke="#3a2a14" strokeOpacity="0.5" strokeWidth="0.8" />
      {/* kurzer Stiel hinten */}
      <path d={`M${-C + 2},-3.2 Q${-C - 5},-2.6 ${-C - 8},-1.6 L${-C - 8},2 Q${-C - 5},3 ${-C + 2},3.4 Z`} fill="#7c6440" />
      <path d={`M${-C + 2},-3.2 Q${-C - 5},-2.6 ${-C - 8},-1.6 L${-C - 8},-0.2 Q${-C - 5},-1 ${-C + 2},-1.2 Z`} fill="#b09a6c" opacity="0.8" />
    </g>
  );
}

/* ============================================================================================ */

/** Haselnussschale mit rundem Loch und feinen Nagespuren am Rand (Mäuse nagen ein sauberes, rundes Loch). */
function GnawedShell({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  const r = rng(21);
  const marks: ReactNode[] = [];
  const hx = 9;
  const hy = -6;
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + r.between(-0.05, 0.05);
    const r0 = 11.2 + r.next() * 1.2;
    const r1 = r0 + 2.2 + r.next() * 2.6;
    // Nagezähne hinterlassen feine, parallele Rillen quer zum Rand
    const tilt = 0.28;
    marks.push(
      <path
        key={i}
        d={`M${f(hx + Math.cos(a) * r0)},${f(hy + Math.sin(a) * r0 * 0.94)} L${f(hx + Math.cos(a + tilt) * r1)},${f(hy + Math.sin(a + tilt) * r1 * 0.94)}`}
        stroke="#4a2f12"
        strokeOpacity={0.35 + r.next() * 0.35}
        strokeWidth={0.55}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <g transform={`translate(${cx} ${cy}) rotate(-8) scale(${s})`}>
      <Hazelnut cx={0} cy={0} />
      <ellipse cx={hx} cy={hy} rx={13.2} ry={12.4} fill="#7a5226" />
      <ellipse cx={hx - 0.6} cy={hy - 0.6} rx={12.2} ry={11.4} fill="#e6cf9c" />
      <ellipse cx={hx} cy={hy + 0.4} rx={9.8} ry={9} fill="#26160a" />
      <ellipse cx={hx + 1.6} cy={hy + 1.8} rx={7} ry={6.2} fill="#0f0802" opacity="0.8" filter="url(#nx-b1)" />
      <path d={`M${hx - 9.6},${hy - 1} A9.8,9 0 0 1 ${hx + 1},${hy - 9.2}`} fill="none" stroke="#f2e2b8" strokeWidth="1.1" strokeOpacity="0.9" strokeLinecap="round" />
      {marks}
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M${hx + 10 + k * 1.2},${hy + 4 + k * 2} l2.4,-0.6 l-0.6,1.8 z`} fill="#f0dfb2" opacity="0.85" />
      ))}
    </g>
  );
}

/** Aufgebrochene Schalenhälfte: außen glatt, innen hell und rau, Rand ausgefranst. */
function ShellHalf({ s = 1, seed = 1 }: { s?: number; seed?: number }) {
  const id = useGid('sh');
  const outer = blob(0, 0, 22, 17, seed, 0.06, 18);
  const inner = blob(-1, -1, 17.5, 12.6, seed + 1, 0.08, 18);
  return (
    <g transform={`scale(${s})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6a866" />
          <stop offset="1" stopColor="#7e5224" />
        </linearGradient>
      </defs>
      <path d={outer} transform="translate(2 3)" fill="#241608" opacity="0.28" filter="url(#nx-b2)" />
      <path d={outer} fill={`url(#${id})`} />
      <path d={outer} fill="#3a2008" filter="url(#nx-bump)" opacity="0.22" />
      <path d={inner} fill="#ead6a6" />
      <path d={inner} fill="#7a5a2c" filter="url(#nx-bump-lg)" opacity="0.45" />
      <path d={inner} fill="none" stroke="#5a3a18" strokeOpacity="0.55" strokeWidth="3.4" filter="url(#nx-b1)" />
      <path d={inner} fill="none" stroke="#f4e6bd" strokeOpacity="0.85" strokeWidth="0.9" />
    </g>
  );
}

/** Einzelne, lose Fichtenschuppe (zum Beispiel am Boden unter einem abgenagten Zapfen). */
function LooseScale({ x, y, rot, s = 1, seed = 1 }: { x: number; y: number; rot: number; s?: number; seed?: number }) {
  const id = useGid('ls');
  const r = rng(seed);
  const tone = shade('#9a6a3e', r.between(-0.12, 0.1));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(tone, 0.25)} />
          <stop offset="1" stopColor={shade(tone, -0.3)} />
        </linearGradient>
      </defs>
      <ellipse cx={1.5} cy={2.5} rx={6.5} ry={9} fill="#241608" opacity="0.3" filter="url(#nx-b1)" />
      <path d="M-5.5,-9 L5.5,-9 Q7,-2 5.5,4 Q3,10 0,10.5 Q-3,10 -5.5,4 Q-7,-2 -5.5,-9 Z" fill={`url(#${id})`} stroke={shade(tone, -0.45)} strokeOpacity="0.7" strokeWidth="0.6" />
      <path d="M-3,-8 L3,-8 L2,-3 L-2,-3 Z" fill="#d8bf8e" />
      <path d="M-4,7 Q0,10 4,7" fill="none" stroke={shade(tone, 0.4)} strokeOpacity="0.7" strokeWidth="0.7" />
    </g>
  );
}

/** Pfad der Nussschale (Haselnuss, Eichel) als Hilfe für Schatten. */
function nutPath(L: number, W: number): string {
  return nutOutline(L, W).d;
}

/* ============================================================================================
   Kastanie (Rosskastanie, Beispiel): glänzende, mahagonibraune Frucht mit heller, matter Ansatzfläche.
   ============================================================================================ */

function Chestnut({ cx, cy, r, rot = 0, seed = 3, showHilum = true }: { cx: number; cy: number; r: number; rot?: number; seed?: number; showHilum?: boolean }) {
  const id = useGid('ch');
  const rr = rng(seed);
  const body = blob(0, 0, r, r * 0.9, seed, 0.02, 18);
  const flames = [];
  for (let k = 0; k < 24; k++) {
    const a = -Math.PI * 0.95 + (k / 24) * Math.PI * 0.9;
    const a2 = a + rr.between(-0.1, 0.1);
    flames.push(
      <path
        key={k}
        d={`M${f(Math.cos(a) * r * 0.2)},${f(Math.sin(a) * r * 0.2 - r * 0.15)} Q${f(Math.cos(a2) * r * 0.62)},${f(Math.sin(a2) * r * 0.6)} ${f(Math.cos(a2) * r * 1.02)},${f(Math.sin(a2) * r * 0.96)}`}
        fill="none"
        stroke={rr.next() > 0.45 ? '#a8501f' : '#1f0b04'}
        strokeOpacity={0.18 + rr.next() * 0.28}
        strokeWidth={0.8 + rr.next() * 2.4}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <defs>
        <radialGradient id={id} cx="0.36" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#b25a28" />
          <stop offset="0.35" stopColor="#7c3513" />
          <stop offset="1" stopColor="#2a0f05" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}c)`}>
        {flames}
        {showHilum && (
          <>
            <path d={blob(r * 0.12, r * 0.7, r * 0.62, r * 0.4, seed + 4, 0.05, 14)} fill="#caa878" />
            <path d={blob(r * 0.12, r * 0.7, r * 0.62, r * 0.4, seed + 4, 0.05, 14)} fill="#6a4a22" filter="url(#nx-bump-lg)" opacity="0.5" />
            <path d={blob(r * 0.12, r * 0.7, r * 0.62, r * 0.4, seed + 4, 0.05, 14)} fill="none" stroke="#2c1206" strokeOpacity="0.75" strokeWidth={r * 0.06} />
          </>
        )}
        <ellipse cx={-r * 0.1} cy={-r * 0.92} rx={r * 0.16} ry={r * 0.08} fill="#c8b890" opacity="0.8" />
      </g>
      <Gloss cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.34} ry={r * 0.18} rot={-35} o={0.8} />
      <Gloss cx={r * 0.34} cy={-r * 0.12} rx={r * 0.1} ry={r * 0.05} rot={-60} o={0.4} />
      <path d={body} fill="none" stroke="#1c0a04" strokeOpacity="0.5" strokeWidth="0.9" />
    </g>
  );
}

/** Dichte, kurze Stacheln auf einer Fläche (Rosskastanienschale, grün). */
function HuskSpines({ cx, cy, rx, ry, n, seed, len = 5.4, rim = true }: { cx: number; cy: number; rx: number; ry: number; n: number; seed: number; len?: number; rim?: boolean }) {
  const r = rng(seed);
  const spines: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = r.next() * Math.PI * 2;
    const rad = Math.sqrt(r.next()) * (rim ? 0.98 : 0.9);
    const x = cx + Math.cos(a) * rx * rad;
    const y = cy + Math.sin(a) * ry * rad;
    const dir = (Math.atan2((y - cy) / ry, (x - cx) / rx) * 180) / Math.PI + 90;
    const L = len * (0.7 + r.next() * 0.55) * (0.6 + 0.4 * rad);
    spines.push(
      <g key={i} transform={`translate(${f(x)} ${f(y)}) rotate(${f(dir)})`}>
        <path d={`M-1.5,0 L0,${f(-L)} L1.5,0 Z`} fill={r.next() > 0.5 ? '#6f8c34' : '#5a7a2a'} />
        <path d={`M-1.5,0 L0,${f(-L)} L-0.2,0 Z`} fill="#b7cf6a" opacity="0.85" />
        <circle cx={0} cy={f(-L)} r={0.5} fill="#7a5a28" />
      </g>,
    );
  }
  return <g>{spines}</g>;
}

/** Aufgeplatzte Klappe der Rosskastanien-Hülle von oben: grüner Rand mit kurzen Stacheln, innen weißlich-samtig. */
function HuskValve({ cx, cy, rot, rx, ry, seed }: { cx: number; cy: number; rot: number; rx: number; ry: number; seed: number }) {
  const id = useGid('hv');
  const r = rng(seed);
  const outer = blob(0, 0, rx, ry, seed, 0.05, 20);
  const inner = blob(-1, 1, rx * 0.8, ry * 0.7, seed + 2, 0.05, 20);
  const spines: ReactNode[] = [];
  const n = 120;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r.between(-0.03, 0.03);
    const band = r.next() < 0.6 ? 1 : 0.84 + r.next() * 0.12;
    const x = Math.cos(a) * rx * band;
    const y = Math.sin(a) * ry * band;
    const ang = (Math.atan2(Math.sin(a) / ry, Math.cos(a) / rx) * 180) / Math.PI + 90;
    const L = 6.5 + r.next() * 4.4;
    spines.push(
      <g key={i} transform={`translate(${f(x)} ${f(y)}) rotate(${f(ang)})`}>
        <path d={`M-1.9,0 L0,${f(-L)} L1.9,0 Z`} fill={r.next() > 0.5 ? '#6b8a2e' : '#587a28'} />
        <path d={`M-1.9,0 L0,${f(-L)} L-0.3,0 Z`} fill="#bcd472" opacity="0.9" />
        <path d={`M-0.6,${f(-L + 1.4)} L0,${f(-L)} L0.6,${f(-L + 1.4)} Z`} fill="#6a4a1c" />
      </g>,
    );
  }
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <defs>
        <radialGradient id={id} cx="0.45" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#f8f2e0" />
          <stop offset="0.7" stopColor="#e2d6b0" />
          <stop offset="1" stopColor="#b8a878" />
        </radialGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9bb64a" />
          <stop offset="1" stopColor="#557428" />
        </linearGradient>
      </defs>
      <path d={outer} transform="translate(3 6)" fill="#241608" opacity="0.3" filter="url(#nx-b4)" />
      {spines}
      <path d={outer} fill={`url(#${id}g)`} />
      <path d={outer} fill="#26340c" filter="url(#nx-bump)" opacity="0.3" />
      <HuskSpines cx={0} cy={0} rx={rx * 0.9} ry={ry * 0.9} n={46} seed={seed + 9} len={6.5} />
      <path d={inner} fill={`url(#${id})`} />
      <path d={inner} fill="#8a7a48" filter="url(#nx-bump-velvet)" opacity="0.42" />
      <path d={inner} fill="none" stroke="#5a4a20" strokeOpacity="0.5" strokeWidth="4" filter="url(#nx-b2)" />
      <path d={inner} fill="none" stroke="#3a4a12" strokeOpacity="0.6" strokeWidth="0.9" />
    </g>
  );
}

/* ============================================================================================
   Eichelhütchen, Haselnuss mit Hülle, Buchecker, Buchenhülle, Ahornfrucht
   ============================================================================================ */

function Hazelnut({ cx, cy, rot = 0, s = 1 }: { cx: number; cy: number; rot?: number; s?: number }) {
  // Nuss mit dem Ansatz unten (heller, matter Fleck), kleine Spitze oben
  const id = useGid('hz');
  const body = 'M0,-38 C14,-30 27,-14 27,6 C27,24 15,34 0,34 C-15,34 -27,24 -27,6 C-27,-14 -14,-30 0,-38 Z';
  const rr = rng(2);
  const grain = [];
  for (let k = -6; k <= 6; k++) {
    const x0 = (k / 6.4) * 24;
    grain.push(<path key={k} d={`M${f(x0 * 0.2)},-34 Q${f(x0 * 1.1)},0 ${f(x0 * 0.95)},30`} fill="none" stroke={rr.next() > 0.5 ? '#6b3f14' : '#e2b87a'} strokeOpacity={0.14 + rr.next() * 0.16} strokeWidth={0.8 + rr.next()} />);
  }
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <defs>
        <radialGradient id={id} cx="0.38" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#e2b676" />
          <stop offset="0.5" stopColor="#bf8a47" />
          <stop offset="1" stopColor="#6b4220" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}c)`}>
        {grain}
        <path d={body} fill="#3a2008" filter="url(#nx-bump)" opacity="0.22" />
        {/* heller, matter Ansatzfleck */}
        <path d="M-19,22 Q0,12 19,22 Q22,36 0,38 Q-22,36 -19,22 Z" fill="#e9d6ae" />
        <path d="M-19,22 Q0,12 19,22 Q22,36 0,38 Q-22,36 -19,22 Z" fill="#7a5a2c" filter="url(#nx-bump-lg)" opacity="0.5" />
        <path d="M-19,22 Q0,12 19,22" fill="none" stroke="#6b4220" strokeOpacity="0.55" strokeWidth="1.2" />
      </g>
      <path d={body} fill="none" stroke="#4a2c10" strokeOpacity="0.55" strokeWidth="0.9" />
      <path d="M-2.5,-35 Q0,-41 2.5,-35" fill="#8a6a40" />
      <Gloss cx={-9} cy={-12} rx={8} ry={4} rot={-48} o={0.5} />
    </g>
  );
}

/** Hülle der Haselnuss: ein grünes, blattartiges, am Rand tief gezacktes Körbchen (hier leer, daneben liegt die Nuss). */
function HazelHusk({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  const id = useGid('hh');
  const r = rng(31);
  const lobes = [24, 38, 28, 42, 30, 36];
  let d = 'M-14,42 C-22,24 -29,8 -28,-10';
  const veins: string[] = [];
  lobes.forEach((h, i) => {
    const x0 = -28 + i * 9.4;
    const xm = x0 + 4.7 + r.between(-1.2, 1.2);
    const x1 = x0 + 9.4;
    const top = -10 - h;
    d += ` Q${f(x0 + 0.8)},${f(-10 - h * 0.55)} ${f(xm)},${f(top)} Q${f(x1 - 0.4)},${f(-10 - h * 0.5)} ${f(x1)},${f(-10 + 1.5)}`;
    veins.push(`M${f(xm * 0.35)},40 Q${f(xm * 0.7)},${f(10)} ${f(xm)},${f(top + 4)}`);
  });
  d += ' C29,8 22,24 14,42 Q0,48 -14,42 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#b9cf6a" />
          <stop offset="0.5" stopColor="#8aa843" />
          <stop offset="1" stopColor="#566f2a" />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#8ea848" stopOpacity="0" />
          <stop offset="0.55" stopColor="#d9d68a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#b08a48" stopOpacity="0.62" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} transform="translate(3 4)" fill="#241608" opacity="0.3" filter="url(#nx-b2)" />
      <path d={d} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}c)`}>
        <path d={d} fill="#2a3a0e" filter="url(#nx-bump)" opacity="0.26" />
        <rect x={-34} y={-60} width={68} height={110} fill={`url(#${id}t)`} />
        {veins.map((v, i) => (
          <path key={i} d={v} fill="none" stroke="#e6eeaa" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
        ))}
        <ellipse cx={0} cy={-8} rx={26} ry={5} fill="#3e5018" opacity="0.5" filter="url(#nx-b2)" />
      </g>
      <path d={d} fill="none" stroke="#33481a" strokeOpacity="0.6" strokeWidth="0.9" strokeLinejoin="round" />
    </g>
  );
}

/** Buchecker: dreikantige Nuss mit gewölbten Flächen; zwei Flächen sind sichtbar, dazwischen eine Kante. */
function Beechnut({ cx, cy, rot = 0, s = 1, flip = false, tone = '#8a4a1c' }: { cx: number; cy: number; rot?: number; s?: number; flip?: boolean; tone?: string }) {
  const id = useGid('bn');
  const left = 'M0,-42 C-7,-22 -21,2 -22,22 Q-23,31 -15,33 L2,35 C5,28 5,10 3,-8 C2,-22 1,-34 0,-42 Z';
  const right = 'M0,-42 C1,-34 2,-22 3,-8 C5,10 5,28 2,35 L14,34 Q23,31 23,24 C22,2 8,-22 0,-42 Z';
  const rr = rng(8);
  const whole = `${left} ${right}`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor={shade(tone, 0.42)} />
          <stop offset="0.5" stopColor={shade(tone, 0.12)} />
          <stop offset="1" stopColor={shade(tone, -0.06)} />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor={shade(tone, -0.2)} />
          <stop offset="1" stopColor={shade(tone, -0.55)} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={whole} />
        </clipPath>
      </defs>
      <path d={whole} transform="translate(3 4)" fill="#241608" opacity="0.28" filter="url(#nx-b2)" />
      <path d={left} fill={`url(#${id}a)`} />
      <path d={right} fill={`url(#${id}b)`} />
      <g clipPath={`url(#${id}c)`}>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${f(-14 + i * 4.4)},${f(30)} Q${f(-6 + i * 2.6)},0 ${f(-0.3 + i * 0.2)},-38`} fill="none" stroke={shade(tone, -0.6)} strokeOpacity={0.1 + rr.next() * 0.12} strokeWidth={0.7 + rr.next() * 0.7} />
        ))}
        <path d={whole} fill="#2a1304" filter="url(#nx-bump)" opacity="0.2" />
        {/* heller Ansatz unten, weich in die Fläche übergehend */}
        <ellipse cx={1} cy={37} rx={24} ry={8.5} fill="#dcc08e" />
        <ellipse cx={1} cy={37} rx={24} ry={8.5} fill="#7a5a2c" filter="url(#nx-bump-lg)" opacity="0.45" />
      </g>
      <path d="M0,-42 C1,-34 2,-22 3,-8 C5,10 5,28 2,35" fill="none" stroke={shade(tone, 0.55)} strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" />
      <path d={left} fill="none" stroke={shade(tone, -0.62)} strokeOpacity="0.5" strokeWidth="0.8" strokeLinejoin="round" />
      <path d={right} fill="none" stroke={shade(tone, -0.62)} strokeOpacity="0.5" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M-1.4,-44 L0,-39 L1.4,-44 Z" fill="#3a1e08" />
      <Gloss cx={-10} cy={-2} rx={2.2} ry={17} rot={9} o={0.4} />
    </g>
  );
}

/** Eine Klappe der Buchenhülle von oben: Innenseite hell-braun und glatt, Rand und Außenseite mit weichen, gebogenen Stacheln. */
function BeechValve({ rot, len, w, seed }: { rot: number; len: number; w: number; seed: number }) {
  const r = rng(seed);
  const id = useGid('bv');
  const half = (t: number) => (w / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.78)), 0.8);
  const edge: Pt[] = [];
  for (let i = 0; i <= 10; i++) edge.push([half(i / 10), -(i / 10) * len]);
  for (let i = 10; i >= 0; i--) edge.push([-half(i / 10), -(i / 10) * len]);
  const d = smoothPath(edge, true);
  const bristles: ReactNode[] = [];
  const n = 210;
  for (let i = 0; i < n; i++) {
    const t = 0.03 + r.next() * 0.96;
    const side = r.next() > 0.5 ? 1 : -1;
    const hw = half(t);
    const x = side * hw * (0.62 + r.next() * 0.5);
    const y = -t * len + r.between(-3, 3);
    const L = 4.6 + r.next() * 5.4;
    const ang = side * (0.5 + r.next() * 0.7) - (t > 0.85 ? 0 : 0);
    const ex = x + Math.sin(ang) * L + side * 1;
    const ey = y - Math.cos(ang) * L * 0.8 - (t > 0.9 ? L * 0.6 : 0);
    bristles.push(
      <path key={i} d={`M${f(x)},${f(y)} Q${f((x + ex) / 2 + side * 0.8)},${f((y + ey) / 2)} ${f(ex)},${f(ey)}`} fill="none" stroke={r.next() > 0.45 ? '#5a3416' : '#8a5a2a'} strokeWidth={0.75} strokeLinecap="round" />,
    );
  }
  return (
    <g transform={`rotate(${rot})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7e5e38" />
          <stop offset="0.5" stopColor="#a98856" />
          <stop offset="1" stopColor="#c9ac78" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} transform="translate(1.5 2.5)" fill="#241608" opacity="0.28" filter="url(#nx-b1)" />
      {bristles}
      <path d={d} fill="#5a3818" />
      <g clipPath={`url(#${id}c)`}>
        <path d={d} fill="#7a5028" filter="url(#nx-bump)" opacity="0.8" />
      </g>
      <path d={smoothPath(edge.map(([x, y]) => [x * 0.62, y * 0.86 - len * 0.05] as Pt), true)} fill={`url(#${id})`} />
      <path d={smoothPath(edge.map(([x, y]) => [x * 0.62, y * 0.86 - len * 0.05] as Pt), true)} fill="#fff" filter="url(#nx-bump-velvet)" opacity="0.3" />
      <path d={smoothPath(edge.map(([x, y]) => [x * 0.62, y * 0.86 - len * 0.05] as Pt), true)} fill="none" stroke="#3a2410" strokeOpacity="0.45" strokeWidth="1.1" />
      <path d={`M0,${f(-len * 0.08)} L0,${f(-len * 0.82)}`} stroke="#6a5030" strokeOpacity="0.5" strokeWidth="1.1" />
    </g>
  );
}

/** Ahornfrucht: zwei Nüsschen, zwei Flügel mit Längsadern (Beispiel; der Winkel der Flügel ist je nach Art verschieden). */
function Samara({ spread = 112 }: { spread?: number }) {
  const id = useGid('sm');
  const wing = (side: 1 | -1, rr: number) => {
    const L = 92;
    const W = 28;
    const up: Pt[] = [];
    const lo: Pt[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const w = W * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.85) + (t < 0.05 ? 3 : 0);
      up.push([t * L, -w * 0.12 - Math.sin(t * Math.PI) * 1.6]);
      lo.push([t * L, w * 0.9 + (rr - 0.5) * 2]);
    }
    const d = smoothPath([...up, ...lo.reverse()], true);
    const veins: ReactNode[] = [];
    for (let k = 0; k < 16; k++) {
      const u = k / 15;
      veins.push(
        <path key={k} d={`M${f(6 + u * 4)},${f(-0.5 + u * 3)} Q${f(L * 0.4)},${f(u * W * 0.5 + 1)} ${f(L * (0.62 + u * 0.3))},${f(u * W * 0.78 + 1)}`} fill="none" stroke="#8a6a30" strokeOpacity={0.28 + (k % 3) * 0.06} strokeWidth={0.7} />,
      );
    }
    return (
      <g transform={`rotate(${side * (spread / 2) - 0} 0 0) rotate(-90)`}>
        <g transform={side === 1 ? '' : 'scale(1 -1)'}>
          <defs>
            <clipPath id={`${id}c${side}`}>
              <path d={d} />
            </clipPath>
            <linearGradient id={`${id}g${side}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d8c47c" />
              <stop offset="0.55" stopColor="#d9bf80" />
              <stop offset="1" stopColor="#c9a566" />
            </linearGradient>
          </defs>
          <path d={d} transform="translate(2 3)" fill="#241608" opacity="0.25" filter="url(#nx-b2)" />
          <path d={d} fill={`url(#${id}g${side})`} />
          <g clipPath={`url(#${id}c${side})`}>
            <path d={d} fill="#bfd08a" opacity="0.28" />
            {veins}
            <path d={d} fill="#5a3a10" filter="url(#nx-bump-velvet)" opacity="0.18" />
            <path d={`M3,${f(-1.5)} Q${f(L * 0.4)},${f(-4.5)} ${f(L * 0.72)},${f(-3)} L${f(L * 0.72)},${f(1)} Q${f(L * 0.4)},${f(-0.5)} 3,${f(2.5)} Z`} fill="#8a6a34" opacity="0.8" />
          </g>
          <path d={d} fill="none" stroke="#7a5a28" strokeOpacity="0.7" strokeWidth="0.9" />
        </g>
      </g>
    );
  };
  return (
    <g>
      {wing(1, 0.4)}
      {wing(-1, 0.7)}
      {/* zwei Nüsschen am Ansatz */}
      {[-7, 7].map((dx, i) => (
        <g key={i} transform={`translate(${dx} 0)`}>
          <ellipse cx={0} cy={0} rx={8.5} ry={10.5} fill="#7a6a3a" />
          <Orb d={blob(0, 0, 8, 10, 4 + i, 0.03, 12)} base="#a6975a" hi={0.3} lo={0.35} />
          {[-4, -1.5, 1, 3.6].map((x0) => (
            <path key={x0} d={`M${x0},-9 Q${x0 * 1.4},0 ${x0},9`} fill="none" stroke="#5a4a22" strokeOpacity="0.45" strokeWidth="0.7" />
          ))}
          <Gloss cx={-3} cy={-4} rx={2.8} ry={1.8} rot={-30} o={0.45} />
        </g>
      ))}
      {/* Verbindungsstück */}
      <rect x={-3} y={7} width={6} height={6} rx={2} fill="#8a7a46" />
    </g>
  );
}

/* ============================================================================================ */

export const realFrucht: Record<string, Art> = {
  cone: {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <SilShadow d={coneOutline('spruce', 168, 60)} transform="translate(46 56) rotate(-62)" dx={6} dy={10} o={0.4} blur="nx-b4" />
        <g transform="translate(46 56) rotate(-62)">
          <Stalk w={36} len={12} />
          <ConeShape kind="spruce" len={168} w={60} seed={4} />
        </g>
      </g>
    ),
  },
  'cone-compare': {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <SilShadow d={coneOutline('spruce', 150, 42)} transform="translate(60 22) rotate(-24)" dx={5} dy={9} o={0.38} blur="nx-b4" />
        <g transform="translate(60 22) rotate(-24)">
          <Stalk w={30} len={9} />
          <ConeShape kind="spruce" len={150} w={42} seed={9} />
        </g>
        <SilShadow d={coneOutline('pine', 62, 54)} transform="translate(170 78) rotate(-14)" dx={5} dy={9} o={0.4} blur="nx-b4" />
        <g transform="translate(170 78) rotate(-14)">
          <Stalk w={34} len={8} />
          <ConeShape kind="pine" len={62} w={54} seed={6} />
        </g>
      </g>
    ),
  },
  'gnawed-cone': {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <SilShadow d={coneOutline('spruce', 150, 52)} transform="translate(58 42) rotate(-56)" dx={6} dy={10} o={0.36} blur="nx-b4" />
        <LooseScale x={174} y={150} rot={24} seed={1} s={1.35} />
        <LooseScale x={206} y={118} rot={-36} seed={2} s={1.3} />
        <LooseScale x={96} y={166} rot={80} seed={3} s={1.25} />
        <LooseScale x={214} y={160} rot={-10} seed={4} s={1.2} />
        <LooseScale x={142} y={176} rot={52} seed={5} s={1.2} />
        <g transform="translate(58 42) rotate(-56)">
          <Stalk w={30} len={10} />
          <ConeShape kind="spruce" len={150} w={52} seed={4} bareUntil={0.6} />
        </g>
      </g>
    ),
  },
  chestnut: {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={112} cy={146} rx={64} ry={9} o={0.4} />
        <Chestnut cx={78} cy={104} r={44} rot={-10} seed={3} />
        <Shadow cx={170} cy={140} rx={30} ry={6} o={0.35} />
        <Chestnut cx={168} cy={112} r={31} rot={22} seed={11} showHilum={false} />
      </g>
    ),
  },
  'chestnut-husk': {
    bg: 'leafy',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={120} cy={150} rx={86} ry={9} o={0.34} />
        <HuskValve cx={70} cy={96} rot={-14} rx={58} ry={46} seed={3} />
        <HuskValve cx={170} cy={98} rot={16} rx={56} ry={44} seed={5} />
        <Chestnut cx={120} cy={104} r={27} rot={-6} seed={3} />
      </g>
    ),
  },
  acorn: {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <SilShadow d={nutPath(62, 34)} transform="translate(86 100) rotate(11) scale(1.9)" dx={4} dy={7} o={0.4} blur="nx-b2" />
        <g transform="translate(88 100) rotate(11) scale(1.9)">
          <AcornNut seed={5} />
          <g transform="translate(14 0)">
            <AcornCupShape R={19.5} C={25} seed={7} />
          </g>
        </g>
      </g>
    ),
  },
  'acorn-cup': {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={96} cy={144} rx={56} ry={9} o={0.38} />
        {/* Becher schräg von vorn: runde Öffnung, innen leer und dunkel */}
        <g transform="translate(110 96) rotate(-14) scale(2.1)">
          <AcornCupShape R={19.5} C={25} seed={13} open />
        </g>
        <Shadow cx={182} cy={152} rx={30} ry={5} o={0.32} />
        <g transform="translate(160 138) rotate(-18)">
          <g transform="scale(0.85)">
            <AcornNut L={50} W={28} seed={9} withCup={false} tone="#b08848" />
          </g>
        </g>
      </g>
    ),
  },
  hazelnut: {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={92} cy={152} rx={52} ry={9} o={0.4} />
        <Hazelnut cx={90} cy={98} rot={-8} s={1.7} />
        <Shadow cx={184} cy={154} rx={34} ry={7} o={0.34} />
        <HazelHusk x={184} y={118} rot={62} s={1.05} />
      </g>
    ),
  },
  'gnawed-nut': {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={86} cy={148} rx={50} ry={8} o={0.38} />
        <GnawedShell cx={84} cy={92} s={1.5} />
        <Shadow cx={180} cy={150} rx={34} ry={6} o={0.32} />
        <g transform="translate(166 130) rotate(-18)">
          <ShellHalf s={1.2} seed={2} />
        </g>
        <g transform="translate(200 160) rotate(160)">
          <ShellHalf s={0.95} seed={5} />
        </g>
      </g>
    ),
  },
  beechnut: {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={88} cy={158} rx={46} ry={8} o={0.4} />
        <Beechnut cx={86} cy={106} rot={-5} s={1.9} />
        <Shadow cx={178} cy={150} rx={34} ry={6} o={0.34} />
        <Beechnut cx={178} cy={118} rot={64} s={1.35} flip tone="#94502a" />
      </g>
    ),
  },
  'beech-husk': {
    bg: 'litter',
    shadow: false,
    draw: () => (
      <g>
        <Shadow cx={120} cy={152} rx={78} ry={11} o={0.36} />
        <g transform="translate(120 102) scale(1 0.84)">
          {[
            [-140, 1],
            [-40, 2],
            [40, 3],
            [140, 4],
          ].map(([a, sd]) => (
            <BeechValve key={sd} rot={a} len={78} w={44} seed={sd} />
          ))}
          {/* leere Mulde in der Mitte, in der die Nüsschen saßen */}
          <ellipse cx={0} cy={0} rx={13} ry={11} fill="#4a3018" />
          <ellipse cx={1} cy={1} rx={9} ry={7.5} fill="#2c1c0c" filter="url(#nx-b1)" />
        </g>
      </g>
    ),
  },
  'maple-seed': {
    bg: 'leafy',
    shadow: false,
    draw: () => (
      <g>
        <g transform="translate(118 154) rotate(-5) scale(1.55)">
          <Samara spread={84} />
        </g>
      </g>
    ),
  },
};

void det;
