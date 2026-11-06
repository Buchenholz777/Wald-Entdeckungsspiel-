import type { ReactNode } from 'react';
import { shade, useGid, type Art } from './kit';
import { blob, Gloss, Loupe, rng, Shadow, SilShadow, smoothPath, type Pt } from './real-kit';

/* ============================================================================================
   Blätter und Zweige, naturgetreu: Umrisse aus Formeln (Rotbuche, Spitzahorn, Stieleiche), Adern in der
   richtigen Anordnung, Farbverläufe, Körnung. Das Blatt steht mit dem Ansatz bei (0, 0) und der Spitze bei (0, -len).
   Beispiele: Die Spiele suchen allgemein „Blatt mit Loch“, „Ahornblatt“, „Eichenblatt“; Art und Farbe dürfen abweichen.
   ============================================================================================ */

const f = (n: number) => (Math.round(n * 10) / 10).toString();

interface OutlineSpec {
  len: number;
  hw: (t: number) => number;
  waves?: number;
  wob?: number;
  teeth?: number;
  toothD?: number;
  asym?: number;
  seed?: number;
  n?: number;
}

function leafOutline(s: OutlineSpec): { d: string; right: Pt[]; left: Pt[] } {
  const n = s.n ?? 60;
  const r = rng(s.seed ?? 1);
  const ph = r.between(0, 6.28);
  const ph2 = r.between(0, 6.28);
  const right: Pt[] = [];
  const left: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const b = s.hw(t);
    const edge = i === 0 || i === n ? 0 : 1;
    const wv = s.waves ? Math.sin(t * Math.PI * 2 * s.waves + ph) * (s.wob ?? 1) * edge : 0;
    const wv2 = s.waves ? Math.sin(t * Math.PI * 2 * s.waves + ph2) * (s.wob ?? 1) * edge : 0;
    const sawR = s.teeth ? ((t * s.teeth) % 1) * (s.toothD ?? 2) * edge : 0;
    const sawL = s.teeth ? ((t * s.teeth + 0.37) % 1) * (s.toothD ?? 2) * edge : 0;
    const a = s.asym ?? 0;
    right.push([Math.max(0, b * (1 + a) + wv + sawR), -t * s.len]);
    left.push([-Math.max(0, b * (1 - a) + wv2 + sawL), -t * s.len]);
  }
  const all = [...right, ...left.slice().reverse()];
  const d = s.teeth
    ? `M${all.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`
    : smoothPath(all, true);
  return { d, right, left };
}

/** Blatt ohne Mittelachse als Pfad: Rotbuche (ei- bis breit-elliptisch, spitz, Rand leicht gewellt). */
function beechLeaf(len: number, W: number, seed: number) {
  return leafOutline({
    len,
    hw: (t) => (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.92) * (t < 0.08 ? 0.75 + t * 3 : 1),
    waves: 9,
    wob: 1.1,
    asym: 0.03,
    seed,
    n: 64,
  });
}

/** Seitennerven der Rotbuche: parallel, gerade, zum Rand ziehend. */
function beechVeins(len: number, W: number, pairs = 8): string {
  let d = `M0,2 L0,${f(-len * 0.97)}`;
  for (let i = 0; i < pairs; i++) {
    const t = 0.1 + (i / pairs) * 0.78;
    const t2 = t + 0.13;
    const hw = (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(t2, 0.99), 0.82)), 0.92) * 0.94;
    for (const s of [1, -1]) d += ` M0,${f(-t * len)} Q${f(s * hw * 0.45)},${f(-(t + 0.04) * len)} ${f(s * hw)},${f(-t2 * len)}`;
  }
  return d;
}

interface BladeProps {
  d: string;
  veins: string;
  c1: string;
  c2: string;
  c3: string;
  /** Löcher (Pfade) werden ausgeschnitten */
  holes?: string[];
  vein?: string;
  veinO?: number;
  veinW?: number;
  texture?: 'nx-bump' | 'nx-bump-velvet';
  extra?: ReactNode;
  shadowTransform?: string;
  noShadow?: boolean;
}

/** Ein Blatt: Farbverlauf, Körnung, Adern mit Lichtkante, weicher Rand; Löcher zeigen den Untergrund. */
function Blade({ d, veins, c1, c2, c3, holes = [], vein = '#e6f0b0', veinO = 0.75, veinW = 1.1, texture = 'nx-bump', extra }: BladeProps) {
  const id = useGid('bl');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="0.5" stopColor={c2} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
        {holes.length > 0 && (
          <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-200" y="-220" width="400" height="300">
            <path d={d} fill="#fff" />
            {holes.map((h, i) => (
              <path key={i} d={h} fill="#000" />
            ))}
          </mask>
        )}
      </defs>
      <g mask={holes.length > 0 ? `url(#${id}m)` : undefined}>
        <path d={d} fill={`url(#${id})`} />
        <g clipPath={`url(#${id}c)`}>
          <path d={d} fill="#2a2a08" filter={`url(#${texture})`} opacity="0.34" />
          <path d={d} fill="#6a5a10" filter="url(#nx-bump-lg)" opacity="0.2" />
          <path d={veins} fill="none" stroke="#1a2a08" strokeOpacity="0.32" strokeWidth={veinW + 0.7} strokeLinecap="round" transform="translate(0.8 0.9)" />
          <path d={veins} fill="none" stroke={vein} strokeOpacity={veinO} strokeWidth={veinW} strokeLinecap="round" />
          {extra}
        </g>
        <path d={d} fill="none" stroke={shade(c3, -0.45)} strokeOpacity="0.6" strokeWidth="0.9" strokeLinejoin="round" />
      </g>
      {holes.map((h, i) => (
        <g key={i}>
          {/* durch das Loch sieht man den hellen Waldboden */}
          <path d={h} fill="#dccdae" />
          <path d={h} fill="none" stroke="#7a6444" strokeOpacity="0.5" strokeWidth="3" filter="url(#nx-b1)" />
          <path d={h} fill="none" stroke="#6a4a1c" strokeWidth="2.6" strokeOpacity="0.85" strokeLinejoin="round" />
          <path d={h} fill="none" stroke="#d4b072" strokeWidth="0.8" strokeOpacity="0.8" strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
}

/** Blattstiel: kurz, mit Lichtkante. */
function Petiole({ len = 24, w = 3, color = '#7d8a3c' }: { len?: number; w?: number; color?: string }) {
  return (
    <g>
      <path d={`M${-w / 2},3 Q${-w * 0.8},${len / 2} ${-w / 2 + 1.5},${len} L${w / 2 + 1.5},${len} Q${w * 0.8},${len / 2} ${w / 2},3 Z`} fill={color} />
      <path d={`M${-w / 2},3 Q${-w * 0.8},${len / 2} ${-w / 2 + 1.5},${len}`} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
    </g>
  );
}

/* --------------------------------- Blatt mit Loch (Rotbuche, Beispiel) --------------------------------- */

function holeShape(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  // unregelmäßig und leicht eckig wie ein Fraßloch
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 0.78 + r.next() * 0.42;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return `M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`;
}

function BeechLeafHole() {
  const len = 138;
  const W = 86;
  const o = beechLeaf(len, W, 3);
  const veins = beechVeins(len, W, 8);
  const holes = [holeShape(14, -len * 0.5, 13.5, 12, 4), holeShape(-22, -len * 0.7, 4.6, 4.2, 7)];
  return (
    <g>
      <SilShadow d={o.d} transform="translate(120 172) rotate(8)" dx={5} dy={7} o={0.34} />
      <g transform="translate(120 172) rotate(8)">
        <Petiole len={22} w={3.4} color="#6f8434" />
        <Blade d={o.d} veins={veins} c1="#a4cf62" c2="#6ea03a" c3="#3f7228" holes={holes} />
      </g>
    </g>
  );
}

/* --------------------------------- Spitzahorn (Herbstblatt) --------------------------------- */

interface Lobe {
  a: number;
  R: number;
  w: number;
}

function mapleOutline(): { d: string; tips: Pt[] } {
  const main: Lobe[] = [
    { a: 0, R: 78, w: 38 },
    { a: -52, R: 66, w: 36 },
    { a: 52, R: 66, w: 36 },
    { a: -104, R: 50, w: 34 },
    { a: 104, R: 50, w: 34 },
  ];
  const lobes: Lobe[] = [];
  for (const l of main) {
    lobes.push(l);
    // spitze Zähne an den Flanken (Spitzahorn: wenige lange, spitze Zähne)
    for (const s of [-1, 1]) lobes.push({ a: l.a + s * l.w * 0.5, R: 26 + l.R * 0.52, w: 11 });
  }
  const C: Pt = [0, -14];
  const Rs = 24;
  const pts: Pt[] = [];
  for (let th = -178; th <= 178; th += 2.5) {
    const edge = Math.abs(th);
    const base = edge > 140 ? Rs - ((edge - 140) / 38) * 14 : Rs;
    let best = 0;
    for (const l of lobes) {
      const u = Math.abs(th - l.a) / l.w;
      if (u < 1) best = Math.max(best, Math.pow(1 - u, 1.2) * (l.R - base));
    }
    const rr = base + best;
    const a = (th * Math.PI) / 180;
    pts.push([C[0] + rr * Math.sin(a), C[1] - rr * Math.cos(a)]);
  }
  const tips: Pt[] = main.map((l) => [C[0] + l.R * Math.sin((l.a * Math.PI) / 180), C[1] - l.R * Math.cos((l.a * Math.PI) / 180)]);
  return { d: `M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`, tips };
}

function MapleLeaf() {
  const { d, tips } = mapleOutline();
  let veins = '';
  tips.forEach((t, i) => {
    veins += ` M0,-6 Q${f(t[0] * 0.5 + (i % 2 ? 2 : -2))},${f(t[1] * 0.55)} ${f(t[0] * 0.93)},${f(t[1] * 0.93 - 2)}`;
    for (const k of [0.38, 0.62]) {
      const px = t[0] * k * 0.95;
      const py = -6 + (t[1] + 6) * k * 0.95;
      for (const s of [-1, 1]) {
        const ex = px + s * 12 + t[0] * 0.08;
        const ey = py - 11 + (i === 0 ? 0 : (t[1] > -30 ? 5 : 0));
        veins += ` M${f(px)},${f(py)} L${f(ex)},${f(ey)}`;
      }
    }
  });
  const id = useGid('mp');
  return (
    <g>
      <SilShadow d={d} transform="translate(120 158) rotate(-12) scale(1.12)" dx={5} dy={8} o={0.32} />
      <g transform="translate(120 158) rotate(-12) scale(1.12)">
        <defs>
          <radialGradient id={id} cx="0.5" cy="0.78" r="0.78">
            <stop offset="0" stopColor="#c4b53a" />
            <stop offset="0.4" stopColor="#e8b42c" />
            <stop offset="0.8" stopColor="#e2862a" />
            <stop offset="1" stopColor="#c6531c" />
          </radialGradient>
        </defs>
        <Petiole len={34} w={3.4} color="#9a7a34" />
        <Blade d={d} veins={veins} c1="#d8b838" c2="#e8a02a" c3="#c4551c" vein="#9a9a2a" veinO={0.8} veinW={1.4}
          extra={
            <g>
              <path d={d} fill={`url(#${id})`} opacity="0.85" />
              {tips.map((t, i) => (
                <ellipse key={i} cx={t[0] * 0.85} cy={t[1] * 0.85} rx={11} ry={9} fill="#b53c18" opacity="0.28" filter="url(#nx-b4)" />
              ))}
              {[[-20, -50], [24, -34], [-8, -70], [36, -62], [-38, -30]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2.2 + (i % 3)} fill="#6a3010" opacity="0.28" filter="url(#nx-b1)" />
              ))}
            </g>
          }
        />
      </g>
    </g>
  );
}

/* --------------------------------- Stieleiche --------------------------------- */

function oakOutline(len: number, W: number, seed = 5): { d: string; lobeTips: Pt[] } {
  const r = rng(seed);
  const n = 5;
  const sinus = 0.36;
  const right: Pt[] = [];
  const left: Pt[] = [];
  const tips: Pt[] = [];
  // verkehrt eiförmig: am breitesten im oberen Drittel; Ansatz mit zwei kleinen „Öhrchen“
  const env = (t: number) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.72) * (0.92 + 0.14 * t);
  const N = 120;
  const lobeAt = (t: number, shift: number) => {
    const u = ((t - 0.12) / 0.84) * n + shift;
    const fr = u - Math.floor(u);
    // runde Lappen, schmale Buchten
    return sinus + (1 - sinus) * Math.pow(Math.sin(Math.PI * fr), 0.5);
  };
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const e = env(t);
    const edge = i === 0 || i === N ? 0 : 1;
    const inLobes = t > 0.1 && t < 0.97;
    const jr = 1 + (r.next() - 0.5) * 0.05;
    const jl = 1 + (r.next() - 0.5) * 0.05;
    right.push([(W / 2) * e * (inLobes ? lobeAt(t, 0) : 0.85) * jr * edge, -t * len]);
    left.push([-(W / 2) * e * (inLobes ? lobeAt(t, 0.45) : 0.85) * jl * edge, -t * len]);
  }
  for (let k = 0; k < n; k++) {
    const t = 0.12 + ((k + 0.5) / n) * 0.84;
    tips.push([(W / 2) * env(t), -t * len]);
  }
  const all = [...right, ...left.slice().reverse()];
  return { d: smoothPath(all, true, 1), lobeTips: tips };
}

function oakVeins(len: number, tips: Pt[]): string {
  let d = `M0,2 L0,${f(-len * 0.96)}`;
  tips.forEach((tp, i) => {
    const t = -tp[1] / len;
    for (const s of [1, -1]) d += ` M0,${f(-(t - 0.06) * len)} Q${f(s * tp[0] * 0.5)},${f(-(t - 0.02) * len)} ${f(s * tp[0] * 0.86)},${f(tp[1] - 2)}`;
    void i;
  });
  return d;
}

function OakLeaf() {
  const len = 134;
  const W = 96;
  const { d, lobeTips } = oakOutline(len, W);
  const veins = oakVeins(len, lobeTips);
  return (
    <g>
      <SilShadow d={d} transform="translate(116 170) rotate(10)" dx={5} dy={8} o={0.34} />
      <g transform="translate(116 170) rotate(10)">
        <Petiole len={14} w={3.2} color="#8a6a30" />
        <Blade d={d} veins={veins} c1="#d9ae4c" c2="#c07a2a" c3="#8a4a18" vein="#5a3410" veinO={0.5} veinW={1.3}
          extra={
            <g>
              <ellipse cx={-14} cy={-86} rx={20} ry={16} fill="#8aa040" opacity="0.28" filter="url(#nx-b4)" />
              <ellipse cx={18} cy={-40} rx={14} ry={12} fill="#6a3a12" opacity="0.28" filter="url(#nx-b4)" />
              <ellipse cx={-6} cy={-110} rx={12} ry={10} fill="#d8d070" opacity="0.2" filter="url(#nx-b4)" />
            </g>
          }
        />
      </g>
    </g>
  );
}

/* --------------------------------- Galle an einem Eichenblatt --------------------------------- */

function GallBall({ cx, cy, r, seed }: { cx: number; cy: number; r: number; seed: number }) {
  const id = useGid('ga');
  const body = blob(cx, cy, r, r * 0.96, seed, 0.02, 16);
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#ecc487" />
          <stop offset="0.45" stopColor="#c68c4c" />
          <stop offset="1" stopColor="#6e4118" />
        </radialGradient>
      </defs>
      <ellipse cx={cx + 3} cy={cy + r * 0.8} rx={r * 0.95} ry={r * 0.4} fill="#14240a" opacity="0.36" filter="url(#nx-b2)" />
      <path d={body} fill={`url(#${id})`} />
      <path d={body} fill="#5a3410" filter="url(#nx-bump)" opacity="0.26" />
      <ellipse cx={cx + r * 0.3} cy={cy + r * 0.2} rx={r * 0.5} ry={r * 0.6} fill="#a8402a" opacity="0.18" filter="url(#nx-b2)" />
      <path d={body} fill="none" stroke="#4a2a0c" strokeOpacity="0.45" strokeWidth="0.8" />
      <Gloss cx={cx - r * 0.34} cy={cy - r * 0.38} rx={r * 0.3} ry={r * 0.16} rot={-38} o={0.8} />
      <circle cx={cx + r * 0.05} cy={cy - r * 0.04} r={r * 0.06} fill="#4a2a0c" opacity="0.35" />
    </g>
  );
}

function OakLeafWithGalls() {
  const len = 138;
  const W = 98;
  const { d, lobeTips } = oakOutline(len, W, 9);
  const veins = oakVeins(len, lobeTips);
  return (
    <g>
      <SilShadow d={d} transform="translate(110 176) rotate(-8)" dx={5} dy={8} o={0.34} />
      <g transform="translate(110 176) rotate(-8)">
        <Petiole len={14} w={3.2} color="#6f8434" />
        <Blade d={d} veins={veins} c1="#98c25a" c2="#659a36" c3="#3d6a26" />
        <GallBall cx={-12} cy={-52} r={17} seed={3} />
        <GallBall cx={22} cy={-92} r={13.5} seed={5} />
        <GallBall cx={-24} cy={-104} r={9} seed={8} />
      </g>
    </g>
  );
}

/* --------------------------------- Blattmine --------------------------------- */

/** Mittellinie und Breite des Fraßgangs: unregelmäßig geschlängelt, zum Ende hin breiter. */
function minePolygon(): { d: string; center: string } {
  const r = rng(17);
  const N = 70;
  const c: Pt[] = [];
  const wd: number[] = [];
  let drift = 0;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    drift += r.between(-0.9, 0.9);
    drift *= 0.86;
    const x = 4 + Math.sin(t * 17 + Math.sin(t * 5) * 1.4) * (3.4 + t * 11) + drift;
    c.push([x, -30 - t * 82]);
    wd.push(1.1 + Math.pow(t, 1.5) * 4.6);
  }
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(N, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    L.push([c[i][0] + nx * wd[i], c[i][1] + ny * wd[i]]);
    R.push([c[i][0] - nx * wd[i], c[i][1] - ny * wd[i]]);
  }
  const poly = [...L, ...R.reverse()];
  return { d: `M${poly.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`, center: `M${c.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')}` };
}

function MineGraphics() {
  const m = minePolygon();
  return (
    <g>
      {/* heller Fraßgang unter der Blatthaut, zum Ende hin breiter; in der Mitte die dunkle Kotspur */}
      <path d={m.d} fill="#6a5a2a" opacity="0.5" transform="translate(0.5 0.6)" />
      <path d={m.d} fill="#f1e8bc" />
      <path d={m.d} fill="#fffdea" opacity="0.5" filter="url(#nx-b1)" transform="translate(-0.6 -0.6)" />
      <path d={m.d} fill="none" stroke="#8a7a3a" strokeOpacity="0.6" strokeWidth="0.6" strokeLinejoin="round" />
      <path d={m.center} fill="none" stroke="#2e2210" strokeOpacity="0.8" strokeWidth="0.9" strokeDasharray="2.4 0.9 0.8 1.2" strokeLinecap="round" />
    </g>
  );
}

function MineLeafGroup() {
  const len = 142;
  const W = 92;
  const o = beechLeaf(len, W, 11);
  const veins = beechVeins(len, W, 9);
  return (
    <g transform="translate(100 174) rotate(6)">
      <Petiole len={20} w={3.4} color="#6f8434" />
      <Blade d={o.d} veins={veins} c1="#8ebf50" c2="#5f943a" c3="#376a26" extra={<MineGraphics />} />
    </g>
  );
}

function LeafWithMine() {
  const o = beechLeaf(142, 92, 11);
  return (
    <g>
      <SilShadow d={o.d} transform="translate(100 174) rotate(6)" dx={5} dy={8} o={0.34} />
      <MineLeafGroup />
      <Loupe cx={188} cy={140} r={38} focus={[118, 78]} zoom={3.3}>
        <MineLeafGroup />
      </Loupe>
    </g>
  );
}

/* --------------------------------- Blattskelett --------------------------------- */

function LeafSkeleton() {
  const cid = useGid('sk');
  const len = 142;
  const W = 92;
  const o = beechLeaf(len, W, 5);
  // Netz aus Adern: Mittelrippe, Seitenadern, Querverbindungen
  let main = `M0,6 L0,${f(-len * 0.98)}`;
  let cross = '';
  const r = rng(12);
  const pairs = 9;
  for (let i = 0; i < pairs; i++) {
    const t = 0.1 + (i / pairs) * 0.8;
    const t2 = t + 0.14;
    const hw = (W / 2) * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(t2, 0.99), 0.82)), 0.92) * 0.92;
    for (const s of [1, -1]) {
      main += ` M0,${f(-t * len)} Q${f(s * hw * 0.45)},${f(-(t + 0.04) * len)} ${f(s * hw)},${f(-t2 * len)}`;
      // Querverbindungen bis zum nächsten Ast
      for (let k = 1; k < 7; k++) {
        const u = k / 7;
        const px = s * hw * u * 0.9;
        const py = -(t + 0.03 * u + 0.13 * u * 0.92) * len;
        const nx = px + s * (4 + r.next() * 3);
        const ny = py - (9 + r.next() * 5);
        cross += ` M${f(px)},${f(py)} Q${f((px + nx) / 2 + r.between(-2, 2))},${f((py + ny) / 2)} ${f(nx)},${f(ny)}`;
      }
    }
  }
  return (
    <g>
      <g transform="translate(120 178) rotate(7) scale(1.1)">
        <SilShadow d={o.d} dx={4} dy={6} o={0.22} />
        <Petiole len={22} w={3.2} color="#9c7a4a" />
        <defs>
          <clipPath id={`${cid}c`}>
            <path d={o.d} />
          </clipPath>
        </defs>
        {/* Reste des Blattgewebes: nur an wenigen, löchrigen Stellen noch vorhanden */}
        <g clipPath={`url(#${cid}c)`}>
          <g filter="url(#nx-lace)">
            <path d={o.d} fill="#a8794a" opacity="0.7" />
          </g>
          <path d={cross} fill="none" stroke="#e9d2a4" strokeOpacity="0.9" strokeWidth="0.55" strokeLinecap="round" />
          <path d={cross} fill="none" stroke="#3c2810" strokeOpacity="0.4" strokeWidth="0.55" strokeLinecap="round" transform="translate(0.4 0.5)" />
          <path d={main} fill="none" stroke="#3c2810" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" transform="translate(0.8 1)" />
          <path d={main} fill="none" stroke="#e6cd9b" strokeWidth="1.9" strokeLinecap="round" />
          <path d={main} fill="none" stroke="#fff6dc" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" transform="translate(-0.4 -0.4)" />
        </g>
      </g>
    </g>
  );
}

/* --------------------------------- Farn --------------------------------- */

const P0: Pt = [0, 0];
const P1: Pt = [-12, -92];
const P2: Pt = [48, -168];
const quadPt = (t: number): Pt => {
  const u = 1 - t;
  return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
};
const quadAng = (t: number): number => {
  const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
  const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
  return Math.atan2(dy, dx);
};

/** Ein Fiederblättchen (spitz, linsenförmig) von (x, y) in Richtung `ang` mit Länge `len`. */
function lens(x: number, y: number, ang: number, len: number, w: number): { d: string; mid: Pt } {
  const ex = x + Math.cos(ang) * len;
  const ey = y + Math.sin(ang) * len;
  const nx = -Math.sin(ang) * w;
  const ny = Math.cos(ang) * w;
  const mx = (x + ex) / 2;
  const my = (y + ey) / 2;
  return { d: `M${f(x)},${f(y)} Q${f(mx + nx)},${f(my + ny)} ${f(ex)},${f(ey)} Q${f(mx - nx)},${f(my - ny)} ${f(x)},${f(y)} Z`, mid: [mx, my] };
}

interface FrondOpts {
  underside?: boolean;
  pinnae: number;
  pinnules: number;
  lmax: number;
  seed?: number;
}

function Frond({ underside = false, pinnae, pinnules, lmax, seed = 4 }: FrondOpts) {
  const id = useGid('fr');
  const r = rng(seed);
  const tones = underside ? ['#a9c48a', '#97b676', '#85a566'] : ['#9bcb5e', '#6aa63f', '#487f30'];
  const buckets: string[] = ['', '', ''];
  const sori: string[] = [];
  const midribs: string[] = [];
  const t0 = 0.2;
  for (let i = 0; i < pinnae; i++) {
    const t = t0 + (i / (pinnae - 1)) * (0.985 - t0);
    const [rx, ry] = quadPt(t);
    const base = quadAng(t);
    const shape = Math.sin(Math.PI * Math.pow((t - 0.14) / 0.86, 0.72));
    const Lp = Math.max(8, lmax * shape);
    for (const s of [1, -1]) {
      const ang = base + s * (Math.PI / 2 - 0.34) + r.between(-0.06, 0.06);
      const tipX = rx + Math.cos(ang) * Lp;
      const tipY = ry + Math.sin(ang) * Lp;
      // Fiedermittelrippe leicht gebogen (nach vorn)
      const cx = rx + Math.cos(ang) * Lp * 0.5 + Math.cos(base) * 3;
      const cy = ry + Math.sin(ang) * Lp * 0.5 + Math.sin(base) * 3;
      midribs.push(`M${f(rx)},${f(ry)} Q${f(cx)},${f(cy)} ${f(tipX)},${f(tipY)}`);
      for (let j = 0; j < pinnules; j++) {
        const u = 0.1 + (j / (pinnules - 1)) * 0.88;
        const px = rx + (tipX - rx) * u + Math.cos(base) * 3 * Math.sin(u * Math.PI);
        const py = ry + (tipY - ry) * u + Math.sin(base) * 3 * Math.sin(u * Math.PI);
        const fall = Math.sin(Math.PI * Math.pow(0.12 + 0.88 * u, 0.85));
        const pl = Math.max(3, Lp * 0.135 * (0.5 + 0.5 * fall) * (u > 0.9 ? 0.8 : 1));
        const pw = pl * (underside ? 0.46 : 0.42);
        for (const ss of [1, -1]) {
          const pa = ang + ss * (1.02 - u * 0.25) + r.between(-0.08, 0.08);
          const L = lens(px, py, pa, pl, pw);
          const k = (ss === 1 ? 0 : 1) + (r.next() > 0.7 ? 1 : 0);
          buckets[Math.min(2, k)] += ` ${L.d}`;
          if (underside) {
            // Sporengruppen: zwei Reihen brauner Punkte entlang der Fiederblättchen-Mitte
            for (const q of [0.34, 0.68]) {
              for (const off of [-1, 1]) {
                const sx = px + Math.cos(pa) * pl * q + -Math.sin(pa) * pw * 0.5 * off;
                const sy = py + Math.sin(pa) * pl * q + Math.cos(pa) * pw * 0.5 * off;
                sori.push(`M${f(sx - 0.75)},${f(sy)} a0.75,0.75 0 1,0 1.5,0 a0.75,0.75 0 1,0 -1.5,0`);
              }
            }
          }
        }
      }
    }
  }
  const rachis = `M0,0 Q${f(P1[0])},${f(P1[1])} ${f(P2[0])},${f(P2[1])}`;
  const stipe = `M0,6 Q${f(-3)},${f(-20)} ${f(quadPt(0.2)[0])},${f(quadPt(0.2)[1])}`;
  const all = buckets.join(' ');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#0a1a04" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <path d={all} transform="translate(5 8)" fill="#1a1408" opacity="0.28" filter="url(#nx-b2)" />
      <path d={stipe} fill="none" stroke="#5a4426" strokeWidth="4.4" strokeLinecap="round" />
      <path d={stipe} fill="none" stroke="#a88a56" strokeWidth="1.4" strokeLinecap="round" transform="translate(-0.8 0)" />
      <path d={rachis} fill="none" stroke={underside ? '#7a7a4a' : '#3e6a28'} strokeWidth="3" strokeLinecap="round" />
      <path d={midribs.join(' ')} fill="none" stroke={underside ? '#8a9a62' : '#3e6a28'} strokeWidth="0.9" strokeLinecap="round" />
      {buckets.map((b, i) => (
        <g key={i}>
          <path d={b} fill={tones[i]} />
          <path d={b} fill="#1a2a08" filter="url(#nx-bump)" opacity="0.22" />
        </g>
      ))}
      <path d={all} fill={`url(#${id})`} />
      <path d={all} fill="none" stroke={underside ? '#58703c' : '#2a5020'} strokeOpacity={underside ? 0.7 : 0.45} strokeWidth={underside ? 0.5 : 0.35} />
      {underside && (
        <>
          <path d={sori.join(' ')} fill="#4a2410" opacity="0.5" transform="translate(0.35 0.4)" />
          <path d={sori.join(' ')} fill="#8a4c20" />
        </>
      )}
      {/* braune Spreuschuppen am Stiel */}
      {[0.02, 0.06, 0.1, 0.14, 0.17].map((tt, i) => {
        const p = quadPt(tt * 0.8);
        return <ellipse key={i} cx={p[0] + (i % 2 ? 2 : -2)} cy={p[1]} rx={1.4} ry={3.4} fill="#b88a4a" opacity="0.85" transform={`rotate(${i % 2 ? 18 : -18} ${p[0]} ${p[1]})`} />;
      })}
    </g>
  );
}

function FernFrondArt() {
  return (
    <g transform="translate(84 196) scale(1.04)">
      <Frond pinnae={17} pinnules={9} lmax={64} seed={6} />
    </g>
  );
}

function FernSporesArt() {
  return (
    <g>
      <g transform="translate(150 198) scale(1.04)">
        <Frond underside pinnae={14} pinnules={7} lmax={62} seed={8} />
      </g>
      <Loupe cx={62} cy={132} r={46} focus={[150 + quadPt(0.5)[0] * 1.04 - 30, 198 + quadPt(0.5)[1] * 1.04 - 6]} zoom={3.4}>
        <g transform="translate(150 198) scale(1.04)">
          <Frond underside pinnae={14} pinnules={7} lmax={62} seed={8} />
        </g>
      </Loupe>
    </g>
  );
}

/* --------------------------------- Nadelzweig (Fichte) --------------------------------- */

function NeedleTwigArt() {
  const r = rng(14);
  const S: Pt = [20, 168];
  const C: Pt = [104, 134];
  const E: Pt = [208, 66];
  const pt = (t: number): Pt => {
    const u = 1 - t;
    return [u * u * S[0] + 2 * u * t * C[0] + t * t * E[0], u * u * S[1] + 2 * u * t * C[1] + t * t * E[1]];
  };
  const ang = (t: number) => {
    const dx = 2 * (1 - t) * (C[0] - S[0]) + 2 * t * (E[0] - C[0]);
    const dy = 2 * (1 - t) * (C[1] - S[1]) + 2 * t * (E[1] - C[1]);
    return Math.atan2(dy, dx);
  };
  const needles: { z: number; d: string; tone: number; hi: string }[] = [];
  const N = 96;
  for (let k = 0; k < N; k++) {
    const t = 0.07 + (k / N) * 0.93;
    const [x, y] = pt(t);
    const a = ang(t);
    for (let m = 0; m < 3; m++) {
      const phi = (k * 3 + m) * 2.399963 + r.next() * 0.2;
      const pitch = 0.95 + r.between(-0.12, 0.12); // Winkel zur Zweigachse (≈ 55°)
      const lateral = Math.sin(pitch) * Math.cos(phi);
      const z = Math.sin(pitch) * Math.sin(phi);
      const along = Math.cos(pitch);
      // Richtung im Bild: entlang des Zweigs und quer dazu
      const dxv = Math.cos(a) * along - Math.sin(a) * lateral;
      const dyv = Math.sin(a) * along + Math.cos(a) * lateral;
      const L = (t > 0.88 ? 15 : 25) * (0.85 + r.next() * 0.3);
      const ex = x + dxv * L;
      const ey = y + dyv * L;
      const nx = -dyv * 1.15;
      const ny = dxv * 1.15;
      const mx = x + dxv * L * 0.55 + nx * 0.2;
      const my = y + dyv * L * 0.55 + ny * 0.2;
      needles.push({
        z,
        d: `M${f(x + nx)},${f(y + ny)} Q${f(mx + nx * 0.9)},${f(my + ny * 0.9)} ${f(ex)},${f(ey)} Q${f(mx - nx * 0.9)},${f(my - ny * 0.9)} ${f(x - nx)},${f(y - ny)} Z`,
        tone: z < -0.2 ? 0 : z < 0.3 ? 1 : 2,
        hi: t > 0.84 ? '1' : '0',
      });
    }
  }
  needles.sort((a, b) => a.z - b.z);
  const tones = ['#2b5a2e', '#3b7437', '#59914a'];
  const tipTones = ['#6f9a3c', '#8bb24a', '#a8c85e'];
  const twig = `M${S[0]},${S[1]} Q${C[0]},${C[1]} ${E[0]},${E[1]}`;
  const [bx, by] = pt(1);
  return (
    <g>
      <path d={twig} transform="translate(5 8)" fill="none" stroke="#1a1408" strokeOpacity="0.3" strokeWidth="14" strokeLinecap="round" filter="url(#nx-b4)" />
      <path d={twig} fill="none" stroke="#4a3220" strokeWidth="8" strokeLinecap="round" />
      <path d={twig} fill="none" stroke="#8a6a44" strokeWidth="2.6" strokeLinecap="round" transform="translate(-0.8 -1.2)" />
      {needles.map((n, i) => (
        <g key={i}>
          <path d={n.d} fill={n.hi === '1' ? tipTones[n.tone] : tones[n.tone]} stroke={n.hi === '1' ? '#4a6a22' : '#17341a'} strokeOpacity="0.5" strokeWidth="0.3" />
        </g>
      ))}
      {/* Endknospe: hellbraun, spitz, von Schuppen umhüllt */}
      <path d={`M${f(bx - 4)},${f(by + 3)} Q${f(bx + 2)},${f(by - 7)} ${f(bx + 9)},${f(by - 12)} Q${f(bx + 9)},${f(by - 2)} ${f(bx + 4)},${f(by + 4)} Z`} fill="#c79a5a" stroke="#7a5428" strokeOpacity="0.7" strokeWidth="0.6" />
    </g>
  );
}

/* --------------------------------- Buchenknospe --------------------------------- */

function Bud({ x, y, ang, len, w, seed }: { x: number; y: number; ang: number; len: number; w: number; seed: number }) {
  const id = useGid('bd');
  const r = rng(seed);
  const half = (t: number) => (w / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.9) * (t < 0.05 ? 0.6 : 1);
  const up: Pt[] = [];
  const dn: Pt[] = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    up.push([t * len, -half(t)]);
    dn.push([t * len, half(t)]);
  }
  const body = smoothPath([...up, ...dn.reverse()], true);
  const scales: ReactNode[] = [];
  const rows = 9;
  for (let k = 1; k <= rows; k++) {
    const t = (k / (rows + 0.6)) ** 0.95;
    const hw = half(t) * 0.98;
    const x0 = t * len;
    scales.push(
      <path key={k} d={`M${f(x0 - 3.4)},${f(-hw)} Q${f(x0 + 1.2)},${f(-hw * 0.4)} ${f(x0 + 2.4)},0 Q${f(x0 + 1.2)},${f(hw * 0.4)} ${f(x0 - 3.4)},${f(hw)}`} fill="none" stroke="#3a1c0a" strokeOpacity={0.5 + r.next() * 0.2} strokeWidth="0.8" />,
    );
    scales.push(
      <path key={`h${k}`} d={`M${f(x0 - 2.6)},${f(-hw * 0.9)} Q${f(x0 + 1.8)},${f(-hw * 0.34)} ${f(x0 + 2.8)},0`} fill="none" stroke="#e0b078" strokeOpacity="0.55" strokeWidth="0.55" />,
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c28a58" />
          <stop offset="0.5" stopColor="#9a5e34" />
          <stop offset="1" stopColor="#5a2e16" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} transform="translate(2 4)" fill="#241608" opacity="0.28" filter="url(#nx-b2)" />
      <path d={body} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}c)`}>
        <path d={body} fill="#2a1204" filter="url(#nx-bump)" opacity="0.25" />
        {scales}
        <path d={`M0,${f(-w * 0.28)} L${f(len)},${f(-w * 0.04)}`} stroke="#fff" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" filter="url(#nx-b1)" />
      </g>
      <path d={body} fill="none" stroke="#3a1c0a" strokeOpacity="0.6" strokeWidth="0.8" />
      <path d={`M${f(len - 3)},-1.2 L${f(len + 3)},0 L${f(len - 3)},1.2 Z`} fill="#d8b890" />
    </g>
  );
}

function BeechTwigArt() {
  const r = rng(23);
  const nodes: Pt[] = [[12, 172], [62, 148], [108, 154], [154, 122], [198, 128]];
  const path = smoothPath(nodes, false, 0.6);
  const lent: ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const seg = Math.floor(r.next() * 4);
    const u = r.next();
    const a = nodes[seg];
    const b = nodes[seg + 1];
    lent.push(<ellipse key={i} cx={a[0] + (b[0] - a[0]) * u} cy={a[1] + (b[1] - a[1]) * u - 0.4} rx={1.5} ry={0.6} fill="#e8dcc8" opacity="0.8" transform={`rotate(${(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI} ${a[0] + (b[0] - a[0]) * u} ${a[1] + (b[1] - a[1]) * u})`} />);
  }
  return (
    <g>
      <path d={path} transform="translate(4 8)" fill="none" stroke="#1a1408" strokeOpacity="0.3" strokeWidth="9" strokeLinecap="round" filter="url(#nx-b2)" />
      <path d={path} fill="none" stroke="#6a5240" strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#a8927a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-0.5 -1.2)" />
      <path d={path} fill="none" stroke="#33261a" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="0.8 3.2" strokeLinecap="round" />
      {lent}
      {/* Knoten: kleine Ringnarben */}
      {nodes.slice(1, 4).map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4.6} ry={2.8} fill="none" stroke="#3a2a1c" strokeOpacity="0.6" strokeWidth="0.9" transform={`rotate(${i % 2 ? 40 : -50} ${x} ${y})`} />
      ))}
      <Bud x={62} y={148} ang={-42} len={72} w={12} seed={1} />
      <Bud x={108} y={154} ang={26} len={66} w={11.5} seed={2} />
      <Bud x={154} y={122} ang={-44} len={72} w={12} seed={3} />
      <Bud x={198} y={128} ang={-6} len={50} w={11} seed={4} />
    </g>
  );
}

/* ============================================================================================ */

export const realBlatt: Record<string, Art> = {
  'fern-frond': { bg: 'leafy', shadow: false, draw: () => <FernFrondArt /> },
  'fern-spores': { bg: 'leafy', shadow: false, draw: () => <FernSporesArt /> },
  'needle-twig': { bg: 'litter', shadow: false, draw: () => <NeedleTwigArt /> },
  'beech-bud': { bg: 'leafy', shadow: false, draw: () => <BeechTwigArt /> },
  'leaf-hole': { bg: 'litter', shadow: false, draw: () => <BeechLeafHole /> },
  'maple-leaf': { bg: 'litter', shadow: false, draw: () => <MapleLeaf /> },
  'oak-leaf': { bg: 'litter', shadow: false, draw: () => <OakLeaf /> },
  gall: { bg: 'litter', shadow: false, draw: () => <OakLeafWithGalls /> },
  'leaf-mine': { bg: 'litter', shadow: false, draw: () => <LeafWithMine /> },
  'leaf-skeleton': { bg: 'soil', shadow: false, draw: () => <LeafSkeleton /> },
};

void Shadow;
